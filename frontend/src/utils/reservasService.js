// Servicio para manejar las reservas usando la API del backend

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Función helper para manejar respuestas de la API
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Obtener todas las reservas
export const obtenerReservas = async () => {
  try {
    const response = await fetch(`${API_URL}/reservas`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleApiResponse(response);
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    // Fallback a localStorage si hay error en la API
    return obtenerReservasLocalStorage();
  }
};

// Obtener reservas por fecha específica
export const obtenerReservasPorFecha = async (fecha) => {
  try {
    const response = await fetch(`${API_URL}/reservas/fecha/${fecha}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleApiResponse(response);
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener reservas por fecha:', error);
    // Fallback a localStorage
    return obtenerReservasPorFechaLocalStorage(fecha);
  }
};

// Obtener reservas por mes
export const obtenerReservasPorMes = async (year, month) => {
  try {
    const response = await fetch(`${API_URL}/reservas/mes/${year}/${month}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleApiResponse(response);
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener reservas por mes:', error);
    return [];
  }
};

// Verificar disponibilidad de un slot
export const verificarDisponibilidad = async (fecha, bloque, subBloque, dia) => {
  try {
    const response = await fetch(
      `${API_URL}/reservas/disponibilidad/${fecha}/${bloque}/${encodeURIComponent(subBloque)}/${encodeURIComponent(dia)}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    const result = await handleApiResponse(response);
    return result.data?.disponible || false;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    // Fallback a localStorage
    return !existeReservaEnSlotLocalStorage(fecha, dia, bloque, subBloque);
  }
};

// Función existeReservaEnSlot que usa la API
export const existeReservaEnSlot = async (fecha, dia, bloque, subBloque) => {
  const disponible = await verificarDisponibilidad(fecha, bloque, subBloque, dia);
  return !disponible;
};

// Guardar una nueva reserva
export const guardarReserva = async (nuevaReserva) => {
  try {
    const response = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(nuevaReserva)
    });
    
    const result = await handleApiResponse(response);
    return result.data || null;
  } catch (error) {
    console.error('Error al guardar reserva:', error);
    // Fallback a localStorage
    return guardarReservaLocalStorage(nuevaReserva);
  }
};

// Actualizar estado de una reserva
export const actualizarReserva = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/reservas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datosActualizados)
    });
    
    const result = await handleApiResponse(response);
    return result.data || null;
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    return null;
  }
};

// Eliminar una reserva
export const eliminarReserva = async (id) => {
  try {
    const response = await fetch(`${API_URL}/reservas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    await handleApiResponse(response);
    return true;
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    return false;
  }
};

// Obtener estadísticas del sistema
export const obtenerEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/reservas/stats/general`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleApiResponse(response);
    return result.data || {};
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {};
  }
};

// Obtener laboratorios disponibles
export const obtenerLaboratorios = async () => {
  try {
    const response = await fetch(`${API_URL}/reservas/laboratorios`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleApiResponse(response);
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener laboratorios:', error);
    return [];
  }
};

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