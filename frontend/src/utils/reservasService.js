// Servicio para manejar las reservas usando Supabase

import { supabase } from '../config/supabase'

// Obtener todas las reservas
export const obtenerReservas = async () => {
  try {
    console.log('🔍 DEBUG RESERVAS - Obteniendo reservas...')
    console.log('🔍 DEBUG RESERVAS - Supabase disponible:', !!supabase)
    console.log('🔍 DEBUG RESERVAS - Supabase.from disponible:', !!supabase?.from)
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible, usando fallback')
      return obtenerReservasLocalStorage()
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        usuario:usuarios(nombre, apellido, email),
        laboratorio_data:laboratorios(nombre, capacidad, ubicacion)
      `)
      .order('fecha', { ascending: true })
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error de Supabase:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Datos obtenidos:', data?.length || 0, 'reservas')
    return data || []
  } catch (error) {
    console.error('Error al obtener reservas:', error)
    // Fallback a localStorage si hay error en la API
    return obtenerReservasLocalStorage()
  }
}

// Obtener reservas por fecha específica
export const obtenerReservasPorFecha = async (fecha) => {
  try {
    console.log('🔍 DEBUG RESERVAS - Obteniendo reservas por fecha:', fecha)
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible, usando fallback por fecha')
      return obtenerReservasPorFechaLocalStorage(fecha)
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        usuario:usuarios(nombre, apellido, email),
        laboratorio_data:laboratorios(nombre, capacidad, ubicacion)
      `)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true })
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error por fecha:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Reservas por fecha obtenidas:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error al obtener reservas por fecha:', error)
    // Fallback a localStorage
    return obtenerReservasPorFechaLocalStorage(fecha)
  }
}

// Obtener reservas por mes
export const obtenerReservasPorMes = async (year, month) => {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        usuario:usuarios(nombre, apellido, email),
        laboratorio_data:laboratorios(nombre, capacidad, ubicacion)
      `)
      .gte('fecha', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('fecha', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
      .in('estado', ['confirmada', 'pendiente'])
      .order('fecha', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener reservas por mes:', error)
    return []
  }
}

// Verificar disponibilidad de un slot
export const verificarDisponibilidad = async (fecha, bloque, subBloque, dia) => {
  try {
    console.log('🔍 DEBUG RESERVAS - Verificando disponibilidad:', { fecha, bloque, subBloque, dia })
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible, usando fallback disponibilidad')
      return !existeReservaEnSlotLocalStorage(fecha, dia, bloque, subBloque)
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('fecha', fecha)
      .eq('dia_semana', dia)
      .eq('bloque', bloque)
      .eq('sub_bloque', subBloque)
      .neq('estado', 'cancelada')
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error verificando disponibilidad:', error)
      throw error
    }
    
    const available = !data || data.length === 0
    console.log('✅ DEBUG RESERVAS - Disponibilidad:', available)
    return available
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error)
    // Fallback a localStorage
    return !existeReservaEnSlotLocalStorage(fecha, dia, bloque, subBloque)
  }
}

// Función existeReservaEnSlot que usa Supabase
export const existeReservaEnSlot = async (fecha, dia, bloque, subBloque) => {
  const disponible = await verificarDisponibilidad(fecha, bloque, subBloque, dia)
  return !disponible
}

// Guardar una nueva reserva
export const guardarReserva = async (nuevaReserva) => {
  try {
    console.log('🔍 DEBUG RESERVAS - Guardando reserva:', nuevaReserva)
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible, usando localStorage')
      return guardarReservaLocalStorage(nuevaReserva)
    }

    // Obtener datos del usuario desde localStorage (nuestro sistema de auth)
    const userData = localStorage.getItem('user_data')
    if (!userData) {
      console.log('❌ DEBUG RESERVAS - No hay datos de usuario en localStorage')
      throw new Error('Usuario no autenticado')
    }

    const user = JSON.parse(userData)
    console.log('🔍 DEBUG RESERVAS - Usuario actual:', user)

    // Buscar información del usuario en la tabla usuarios por email
    const { data: dbUserData, error: userError } = await supabase
      .from('usuarios')
      .select('id, rol, nombre, apellido')
      .eq('email', user.email)
      .single()

    console.log('🔍 DEBUG RESERVAS - Datos de usuario en BD:', dbUserData)
    console.log('🔍 DEBUG RESERVAS - Error de usuario:', userError)

    if (userError || !dbUserData) {
      console.log('⚠️ DEBUG RESERVAS - Usuario no encontrado en BD, creando fallback')
      // Si no encuentra el usuario en BD, usar localStorage como fallback
      return guardarReservaLocalStorage(nuevaReserva)
    }

    // Buscar el laboratorio por nombre
    const { data: labData, error: labError } = await supabase
      .from('laboratorios')
      .select('id')
      .eq('nombre', nuevaReserva.laboratorio)
      .single()

    console.log('🔍 DEBUG RESERVAS - Datos de laboratorio:', labData)
    console.log('🔍 DEBUG RESERVAS - Error de laboratorio:', labError)

    let laboratorio_id
    if (labError || !labData) {
      // Si no encuentra el laboratorio, usar el primero disponible
      const { data: firstLab } = await supabase
        .from('laboratorios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single()
      
      const finalLabData = firstLab || { id: 1 }
      laboratorio_id = finalLabData.id
      console.log('🔍 DEBUG RESERVAS - Usando laboratorio por defecto:', laboratorio_id)
    } else {
      laboratorio_id = labData.id
      console.log('🔍 DEBUG RESERVAS - Usando laboratorio encontrado:', laboratorio_id)
    }

    // Preparar datos para inserción
    const reservaData = {
      usuario_id: dbUserData.id,
      laboratorio_id: laboratorio_id,
      fecha: nuevaReserva.fecha,
      bloque: parseInt(nuevaReserva.bloque),
      sub_bloque: nuevaReserva.subBloque ? 
        (nuevaReserva.subBloque === '1° hora' ? 1 : 
         nuevaReserva.subBloque === '2° hora' ? 2 : 
         parseInt(nuevaReserva.subBloque) || 1) : 1,  // CONVERSIÓN DE TEXTO A NÚMERO
      dia_semana: nuevaReserva.dia,
      tipo_bloque: nuevaReserva.tipoBloque || 'completo',
      curso: nuevaReserva.curso,
      asignatura: nuevaReserva.asignatura,
      profesor: nuevaReserva.profesor,
      laboratorio: nuevaReserva.laboratorio,
      observaciones: nuevaReserva.observaciones || null,
      estado: 'confirmada'
    }

    console.log('🔍 DEBUG RESERVAS - Datos a insertar:', reservaData)

    const { data, error } = await supabase
      .from('reservas')
      .insert([reservaData])
      .select()
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error creando reserva:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Reserva creada:', data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error('Error al guardar reserva:', error)
    // Fallback a localStorage
    return guardarReservaLocalStorage(nuevaReserva)
  }
}

// Actualizar estado de una reserva
export const actualizarReserva = async (id, datosActualizados) => {
  try {
    console.log('🔍 DEBUG RESERVAS - Actualizando reserva:', id, datosActualizados)
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible para actualización')
      return null
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .update(datosActualizados)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error actualizando reserva:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Reserva actualizada:', data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error('Error al actualizar reserva:', error)
    return null
  }
}

// Eliminar una reserva
export const eliminarReserva = async (id) => {
  try {
    console.log('🔍 DEBUG RESERVAS - Eliminando reserva:', id)
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible para eliminación')
      return false
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error cancelando reserva:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Reserva cancelada:', data?.[0])
    return true
  } catch (error) {
    console.error('Error al eliminar reserva:', error)
    return false
  }
}

// Obtener estadísticas del sistema
export const obtenerEstadisticas = async () => {
  try {
    const { data, error } = await supabase
      .from('vista_estadisticas')
      .select('*')
      .single()
    
    if (error) throw error
    return data || {}
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return {}
  }
}

// Obtener laboratorios disponibles
export const obtenerLaboratorios = async () => {
  try {
    console.log('🔍 DEBUG RESERVAS - Obteniendo laboratorios...')
    
    if (!supabase?.from) {
      console.log('⚠️ DEBUG RESERVAS - Supabase no disponible para laboratorios')
      return []
    }
    
    const { data, error } = await supabase
      .from('laboratorios')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('🚨 DEBUG RESERVAS - Error obteniendo laboratorios:', error)
      throw error
    }
    
    console.log('✅ DEBUG RESERVAS - Laboratorios obtenidos:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error al obtener laboratorios:', error)
    return []
  }
}

// Formatear datos de la reserva desde el formulario
export const formatearReservaDesdeFormulario = (formData, reservaSeleccionada) => {
  // Determinar el laboratorio basado en la asignatura (simulación)
  const laboratoriosPorAsignatura = {
    'Matemáticas': 'Lab. Informática 1',
    'Física': 'Lab. Física',
    'Química': 'Lab. Química',
    'Biología': 'Lab. Biología',
    'Informática': 'Lab. Informática 2',
    'Tecnología': 'Lab. Tecnología',
    'Ciencias Naturales': 'Lab. Ciencias'
  };

  // Determinar sub_bloque basado en tipoBloque
  let subBloque = 1; // Por defecto
  if (formData.tipoBloque === '2hora') {
    subBloque = 2;
  } else if (formData.tipoBloque === 'completo') {
    subBloque = 1; // Para bloque completo, usar 1 como referencia
  }

  return {
    bloque: reservaSeleccionada.bloque.id,
    subBloque: subBloque,
    dia: reservaSeleccionada.dia,
    fecha: formData.fecha,
    tipoBloque: formData.tipoBloque,
    curso: formData.curso,
    asignatura: formData.asignatura,
    profesor: formData.profesor,
    laboratorio: laboratoriosPorAsignatura[formData.asignatura] || 'Lab. General'
  };
};

// =====================================================
// FUNCIONES FALLBACK PARA LOCALSTORAGE
// =====================================================

const RESERVAS_KEY = 'sistema_reservas_laboratorio';

// Obtener reservas del localStorage (fallback)
const obtenerReservasLocalStorage = () => {
  try {
    const reservas = localStorage.getItem(RESERVAS_KEY);
    return reservas ? JSON.parse(reservas) : [];
  } catch (error) {
    console.error('Error al obtener reservas del localStorage:', error);
    return [];
  }
};

// Obtener reservas por fecha del localStorage (fallback)
const obtenerReservasPorFechaLocalStorage = (fecha) => {
  const todasLasReservas = obtenerReservasLocalStorage();
  return todasLasReservas.filter(reserva => reserva.fecha === fecha);
};

// Verificar si existe una reserva en un slot específico (localStorage)
const existeReservaEnSlotLocalStorage = (fecha, dia, bloque, subBloque) => {
  const reservas = obtenerReservasPorFechaLocalStorage(fecha);
  return reservas.some(reserva => 
    reserva.dia === dia && 
    String(reserva.bloque) === String(bloque) && 
    reserva.subBloque === subBloque
  );
};

// Guardar reserva en localStorage (fallback)
const guardarReservaLocalStorage = (nuevaReserva) => {
  try {
    const reservasExistentes = obtenerReservasLocalStorage();
    const reservaConId = {
      ...nuevaReserva,
      id: Date.now(), // ID único basado en timestamp
      fechaCreacion: new Date().toISOString(),
      estado: 'confirmada'
    };
    
    const reservasActualizadas = [...reservasExistentes, reservaConId];
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservasActualizadas));
    
    return reservaConId;
  } catch (error) {
    console.error('Error al guardar reserva en localStorage:', error);
    return null;
  }
};

// Limpiar reservas del localStorage
export const limpiarReservas = () => {
  try {
    localStorage.removeItem(RESERVAS_KEY);
    return true;
  } catch (error) {
    console.error('Error al limpiar reservas:', error);
    return false;
  }
};

// Función para migrar datos de localStorage a la API (opcional)
export const migrarReservasLocalStorageAAPI = async () => {
  const reservasLocal = obtenerReservasLocalStorage();
  
  try {
    if (reservasLocal.length === 0) {
      return { success: true, migradas: 0, errores: 0 };
    }

    let migradas = 0;
    let errores = 0;

    for (const reserva of reservasLocal) {
      try {
        await guardarReserva(reserva);
        migradas++;
      } catch (error) {
        console.error('Error al migrar reserva:', reserva, error);
        errores++;
      }
    }

    // Si todas se migraron exitosamente, limpiar localStorage
    if (errores === 0) {
      limpiarReservas();
    }

    return { success: true, migradas, errores };
  } catch (error) {
    console.error('Error en migración:', error);
    return { success: false, migradas: 0, errores: reservasLocal?.length || 0 };
  }
};

// Función para sincronizar offline/online (opcional)
export const sincronizarReservas = async () => {
  try {
    // Intentar obtener reservas de la API
    const reservasAPI = await obtenerReservas();
    
    // Si hay éxito, actualizar localStorage como caché
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservasAPI));
    
    return { success: true, total: reservasAPI.length };
  } catch (error) {
    console.error('Error en sincronización:', error);
    return { success: false, error: error.message };
  }
}; 
