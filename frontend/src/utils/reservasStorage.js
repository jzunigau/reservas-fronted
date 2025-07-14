// Utilidades para manejar las reservas en localStorage

const RESERVAS_KEY = 'sistema_reservas_laboratorio';

// Obtener todas las reservas del localStorage
export const obtenerReservas = () => {
  try {
    const reservas = localStorage.getItem(RESERVAS_KEY);
    return reservas ? JSON.parse(reservas) : [];
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    return [];
  }
};

// Guardar una nueva reserva
export const guardarReserva = (nuevaReserva) => {
  try {
    const reservasExistentes = obtenerReservas();
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
    console.error('Error al guardar reserva:', error);
    return null;
  }
};

// Obtener reservas de una fecha específica
export const obtenerReservasPorFecha = (fecha) => {
  const todasLasReservas = obtenerReservas();
  return todasLasReservas.filter(reserva => reserva.fecha === fecha);
};

// Verificar si existe una reserva en un slot específico
export const existeReservaEnSlot = (fecha, dia, bloque, subBloque) => {
  const reservas = obtenerReservasPorFecha(fecha);
  return reservas.some(reserva => 
    reserva.dia === dia && 
    String(reserva.bloque) === String(bloque) && 
    reserva.subBloque === subBloque
  );
};

// Eliminar una reserva por ID
export const eliminarReserva = (id) => {
  try {
    const reservasExistentes = obtenerReservas();
    const reservasActualizadas = reservasExistentes.filter(reserva => reserva.id !== id);
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservasActualizadas));
    return true;
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    return false;
  }
};

// Limpiar todas las reservas (para testing)
export const limpiarReservas = () => {
  try {
    localStorage.removeItem(RESERVAS_KEY);
    return true;
  } catch (error) {
    console.error('Error al limpiar reservas:', error);
    return false;
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