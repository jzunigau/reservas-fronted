// Servicio para manejar las reservas usando Supabase

import { supabase, db, utils } from '../config/supabase'

// Obtener todas las reservas
export const obtenerReservas = async () => {
  try {
    const { data, error } = await db.getReservations()
    if (error) throw error
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
    const { data, error } = await db.getReservationsByDate(fecha)
    if (error) throw error
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
    const { available, error } = await db.checkAvailability(fecha, bloque, subBloque, dia)
    if (error) throw error
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
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Buscar información del usuario en la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      throw new Error('Usuario no encontrado en la base de datos')
    }

    // Buscar el laboratorio por nombre
    const { data: labData, error: labError } = await supabase
      .from('laboratorios')
      .select('id')
      .eq('nombre', nuevaReserva.laboratorio)
      .single()

    if (labError || !labData) {
      // Si no encuentra el laboratorio, usar el primero disponible
      const { data: firstLab } = await supabase
        .from('laboratorios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single()
      
      labData = firstLab || { id: 1 }
    }

    // Preparar datos para inserción
    const reservaData = {
      usuario_id: userData.id,
      laboratorio_id: labData.id,
      fecha: nuevaReserva.fecha,
      bloque: parseInt(nuevaReserva.bloque),
      sub_bloque: nuevaReserva.subBloque,
      dia_semana: nuevaReserva.dia,
      tipo_bloque: nuevaReserva.tipoBloque || 'completo',
      curso: nuevaReserva.curso,
      asignatura: nuevaReserva.asignatura,
      profesor: nuevaReserva.profesor,
      laboratorio: nuevaReserva.laboratorio,
      observaciones: nuevaReserva.observaciones || null,
      estado: 'confirmada'
    }

    const { data, error } = await db.createReservation(reservaData)
    if (error) throw error
    
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
    const { data, error } = await db.updateReservation(id, datosActualizados)
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error('Error al actualizar reserva:', error)
    return null
  }
}

// Eliminar una reserva
export const eliminarReserva = async (id) => {
  try {
    const { data, error } = await db.cancelReservation(id)
    if (error) throw error
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
    const { data, error } = await db.getLaboratories()
    if (error) throw error
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

  return {
    bloque: reservaSeleccionada.bloque.id,
    subBloque: reservaSeleccionada.subBloque,
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
