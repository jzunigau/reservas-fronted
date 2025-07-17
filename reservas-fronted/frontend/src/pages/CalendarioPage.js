import React, { useState, useEffect } from 'react';
import { obtenerReservas, obtenerReservasPorMes } from '../utils/reservasService';

// Datos simulados ampliados de reservas para el calendario
const reservasSimuladas = [
  // Semana 1
  {
    id: 1,
    fecha: '2025-01-02',
    bloque: 1,
    subBloque: '1° hora',
    dia: 'Jueves',
    tipoBloque: 'completo',
    curso: '3° A',
    asignatura: 'Matemáticas',
    profesor: 'Prof. García',
    laboratorio: 'Lab. Informática 1',
    estado: 'confirmada'
  },
  {
    id: 2,
    fecha: '2025-01-03',
    bloque: 2,
    subBloque: '2° hora',
    dia: 'Viernes',
    tipoBloque: '1hora',
    curso: '2° B',
    asignatura: 'Física',
    profesor: 'Prof. Martínez',
    laboratorio: 'Lab. Ciencias',
    estado: 'confirmada'
  },
  
  // Semana 2
  {
    id: 3,
    fecha: '2025-01-06',
    bloque: 3,
    subBloque: '1° hora',
    dia: 'Lunes',
    tipoBloque: 'completo',
    curso: '4° A',
    asignatura: 'Química',
    profesor: 'Prof. López',
    laboratorio: 'Lab. Química',
    estado: 'confirmada'
  },
  {
    id: 4,
    fecha: '2025-01-07',
    bloque: 1,
    subBloque: '2° hora',
    dia: 'Martes',
    tipoBloque: '2hora',
    curso: '1° C',
    asignatura: 'Biología',
    profesor: 'Prof. Rodríguez',
    laboratorio: 'Lab. Biología',
    estado: 'pendiente'
  },
  {
    id: 5,
    fecha: '2025-01-08',
    bloque: 4,
    subBloque: '1° hora',
    dia: 'Miércoles',
    tipoBloque: 'completo',
    curso: '3° B',
    asignatura: 'Informática',
    profesor: 'Prof. Vega',
    laboratorio: 'Lab. Informática 2',
    estado: 'confirmada'
  },
  {
    id: 6,
    fecha: '2025-01-09',
    bloque: 2,
    subBloque: '1° hora',
    dia: 'Jueves',
    tipoBloque: 'completo',
    curso: '2° A',
    asignatura: 'Tecnología',
    profesor: 'Prof. Sánchez',
    laboratorio: 'Lab. Tecnología',
    estado: 'confirmada'
  },
  {
    id: 7,
    fecha: '2025-01-10',
    bloque: 3,
    subBloque: '2° hora',
    dia: 'Viernes',
    tipoBloque: '1hora',
    curso: '4° B',
    asignatura: 'Física',
    profesor: 'Prof. Martínez',
    laboratorio: 'Lab. Física',
    estado: 'confirmada'
  },
  
  // Semana 3
  {
    id: 8,
    fecha: '2025-01-13',
    bloque: 1,
    subBloque: '1° hora',
    dia: 'Lunes',
    tipoBloque: 'completo',
    curso: '1° A',
    asignatura: 'Ciencias Naturales',
    profesor: 'Prof. Hernández',
    laboratorio: 'Lab. Ciencias',
    estado: 'confirmada'
  },
  {
    id: 9,
    fecha: '2025-01-14',
    bloque: 4,
    subBloque: '1° hora',
    dia: 'Martes',
    tipoBloque: 'completo',
    curso: '3° C',
    asignatura: 'Química',
    profesor: 'Prof. López',
    laboratorio: 'Lab. Química',
    estado: 'confirmada'
  },
  {
    id: 10,
    fecha: '2025-01-15',
    bloque: 2,
    subBloque: '2° hora',
    dia: 'Miércoles',
    tipoBloque: '2hora',
    curso: '2° C',
    asignatura: 'Matemáticas',
    profesor: 'Prof. García',
    laboratorio: 'Lab. Informática 1',
    estado: 'confirmada'
  },
  {
    id: 11,
    fecha: '2025-01-16',
    bloque: 3,
    subBloque: '1° hora',
    dia: 'Jueves',
    tipoBloque: 'completo',
    curso: '4° C',
    asignatura: 'Biología',
    profesor: 'Prof. Rodríguez',
    laboratorio: 'Lab. Biología',
    estado: 'confirmada'
  },
  {
    id: 12,
    fecha: '2025-01-17',
    bloque: 1,
    subBloque: '1° hora',
    dia: 'Viernes',
    tipoBloque: 'completo',
    curso: '1° B',
    asignatura: 'Tecnología',
    profesor: 'Prof. Sánchez',
    laboratorio: 'Lab. Tecnología',
    estado: 'confirmada'
  },
  
  // Semana 4
  {
    id: 13,
    fecha: '2025-01-20',
    bloque: 2,
    subBloque: '1° hora',
    dia: 'Lunes',
    tipoBloque: 'completo',
    curso: '3° A',
    asignatura: 'Física',
    profesor: 'Prof. Martínez',
    laboratorio: 'Lab. Física',
    estado: 'confirmada'
  },
  {
    id: 14,
    fecha: '2025-01-21',
    bloque: 4,
    subBloque: '2° hora',
    dia: 'Martes',
    tipoBloque: '2hora',
    curso: '2° A',
    asignatura: 'Informática',
    profesor: 'Prof. Vega',
    laboratorio: 'Lab. Informática 2',
    estado: 'pendiente'
  },
  {
    id: 15,
    fecha: '2025-01-22',
    bloque: 3,
    subBloque: '1° hora',
    dia: 'Miércoles',
    tipoBloque: 'completo',
    curso: '4° A',
    asignatura: 'Química',
    profesor: 'Prof. López',
    laboratorio: 'Lab. Química',
    estado: 'confirmada'
  },
  {
    id: 16,
    fecha: '2025-01-23',
    bloque: 1,
    subBloque: '1° hora',
    dia: 'Jueves',
    tipoBloque: 'completo',
    curso: '1° C',
    asignatura: 'Ciencias Naturales',
    profesor: 'Prof. Hernández',
    laboratorio: 'Lab. Ciencias',
    estado: 'confirmada'
  },
  {
    id: 17,
    fecha: '2025-01-24',
    bloque: 2,
    subBloque: '2° hora',
    dia: 'Viernes',
    tipoBloque: '1hora',
    curso: '3° B',
    asignatura: 'Matemáticas',
    profesor: 'Prof. García',
    laboratorio: 'Lab. Informática 1',
    estado: 'confirmada'
  },
  
  // Semana 5
  {
    id: 18,
    fecha: '2025-01-27',
    bloque: 4,
    subBloque: '1° hora',
    dia: 'Lunes',
    tipoBloque: 'completo',
    curso: '2° B',
    asignatura: 'Tecnología',
    profesor: 'Prof. Sánchez',
    laboratorio: 'Lab. Tecnología',
    estado: 'confirmada'
  },
  {
    id: 19,
    fecha: '2025-01-28',
    bloque: 3,
    subBloque: '2° hora',
    dia: 'Martes',
    tipoBloque: '2hora',
    curso: '4° B',
    asignatura: 'Biología',
    profesor: 'Prof. Rodríguez',
    laboratorio: 'Lab. Biología',
    estado: 'confirmada'
  },
  {
    id: 20,
    fecha: '2025-01-29',
    bloque: 1,
    subBloque: '1° hora',
    dia: 'Miércoles',
    tipoBloque: 'completo',
    curso: '1° A',
    asignatura: 'Informática',
    profesor: 'Prof. Vega',
    laboratorio: 'Lab. Informática 2',
    estado: 'confirmada'
  },
  {
    id: 21,
    fecha: '2025-01-30',
    bloque: 2,
    subBloque: '1° hora',
    dia: 'Jueves',
    tipoBloque: 'completo',
    curso: '3° C',
    asignatura: 'Física',
    profesor: 'Prof. Martínez',
    laboratorio: 'Lab. Física',
    estado: 'confirmada'
  },
  {
    id: 22,
    fecha: '2025-01-31',
    bloque: 4,
    subBloque: '2° hora',
    dia: 'Viernes',
    tipoBloque: '1hora',
    curso: '2° C',
    asignatura: 'Química',
    profesor: 'Prof. López',
    laboratorio: 'Lab. Química',
    estado: 'pendiente'
  }
];

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const CalendarioPage = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [reservasDelMes, setReservasDelMes] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('todos');
  const [reservasReales, setReservasReales] = useState([]);

  // Obtener primer día del mes y días totales
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
  const primerDiaSemana = primerDiaMes.getDay();
  const diasEnMes = ultimoDiaMes.getDate();

  // Cargar reservas de la API al iniciar
  useEffect(() => {
    const cargarReservasReales = async () => {
      try {
        const reservasGuardadas = await obtenerReservas();
        setReservasReales(reservasGuardadas);
      } catch (error) {
        console.error('Error al cargar reservas reales:', error);
        setReservasReales([]);
      }
    };

    cargarReservasReales();
  }, []);

  // Combinar reservas simuladas y reales
  const todasLasReservas = [...reservasSimuladas, ...reservasReales];

  // Obtener laboratorios únicos para el filtro
  const laboratoriosUnicos = [...new Set(todasLasReservas.map(r => r.laboratorio))];

  // Filtrar reservas del mes actual
  useEffect(() => {
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    let reservasFiltradas = todasLasReservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha);
      return fechaReserva.getMonth() === mesActual && fechaReserva.getFullYear() === añoActual;
    });

    // Aplicar filtros
    if (filtroEstado !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(r => r.estado === filtroEstado);
    }
    
    if (filtroLaboratorio !== 'todos') {
      reservasFiltradas = reservasFiltradas.filter(r => r.laboratorio === filtroLaboratorio);
    }
    
    setReservasDelMes(reservasFiltradas);
  }, [fechaActual, filtroEstado, filtroLaboratorio, reservasReales]);

  // Navegar entre meses
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  // Obtener reservas de un día específico
  const obtenerReservasDia = (dia) => {
    const fechaBuscada = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    const fechaStr = fechaBuscada.toISOString().split('T')[0];
    return reservasDelMes.filter(reserva => reserva.fecha === fechaStr);
  };

  // Abrir modal con detalles de reserva
  const abrirDetalleReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalAbierto(true);
  };

  // Generar grid del calendario
  const generarDiasCalendario = () => {
    const dias = [];
    
    // Días vacíos al inicio del mes
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  // Obtener color de la reserva según estado
  const obtenerColorReserva = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
      case 'pendiente':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600';
      case 'cancelada':
        return 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600';
    }
  };

  const dias = generarDiasCalendario();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="text-center text-white text-2xl sm:text-3xl md:text-4xl font-bold">
            📅 Calendario de Reservas
          </h1>
          <p className="text-center text-indigo-100 mt-2 text-sm sm:text-base">
            Consulta pública de reservas de laboratorios
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {/* Filtros */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todas">Todas las reservas</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Laboratorio:</label>
                <select
                  value={filtroLaboratorio}
                  onChange={(e) => setFiltroLaboratorio(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todos">Todos los laboratorios</option>
                  {laboratoriosUnicos.map(lab => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navegación de meses */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-4">
            <button
              onClick={() => cambiarMes(-1)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              <span className="mr-2">←</span>
              <span className="hidden sm:inline">Anterior</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {reservasDelMes.length} reserva{reservasDelMes.length !== 1 ? 's' : ''} este mes
              </p>
            </div>
            
            <button
              onClick={() => cambiarMes(1)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* Grid del calendario */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 bg-gray-100">
              {diasSemana.map(dia => (
                <div key={dia} className="p-2 sm:p-3 text-center font-bold text-gray-700 text-sm sm:text-base border-r border-gray-200 last:border-r-0">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
              {dias.map((dia, index) => {
                const reservasDelDia = dia ? obtenerReservasDia(dia) : [];
                const esHoy = dia && 
                  new Date().getDate() === dia && 
                  new Date().getMonth() === fechaActual.getMonth() && 
                  new Date().getFullYear() === fechaActual.getFullYear();
                
                const esFindelSemana = index % 7 === 0 || index % 7 === 6;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] sm:min-h-[140px] p-1 sm:p-2 relative
                      ${dia ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                      ${esHoy ? 'bg-indigo-50 border-2 border-indigo-400 shadow-md' : ''}
                      ${esFindelSemana && dia ? 'bg-blue-50' : ''}
                      transition-colors duration-200
                    `}
                  >
                    {dia && (
                      <>
                        {/* Número del día */}
                        <div className={`
                          text-sm sm:text-base font-bold mb-1 flex items-center justify-between
                          ${esHoy ? 'text-indigo-600' : esFindelSemana ? 'text-blue-600' : 'text-gray-700'}
                        `}>
                          <span>{dia}</span>
                          {reservasDelDia.length > 0 && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                              {reservasDelDia.length}
                            </span>
                          )}
                        </div>

                        {/* Reservas del día */}
                        <div className="space-y-1 max-h-[80px] sm:max-h-[100px] overflow-y-auto">
                          {reservasDelDia.slice(0, 4).map((reserva, idx) => (
                            <div
                              key={reserva.id}
                              onClick={() => abrirDetalleReserva(reserva)}
                              className={`
                                text-xs text-white px-2 py-1 rounded cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm
                                ${obtenerColorReserva(reserva.estado)}
                              `}
                            >
                              <div className="font-medium truncate">
                                {reserva.curso}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {reserva.asignatura}
                              </div>
                              <div className="text-xs opacity-80 truncate">
                                Bloque {reserva.bloque}
                              </div>
                            </div>
                          ))}
                          
                          {/* Indicador de más reservas */}
                          {reservasDelDia.length > 4 && (
                            <div className="text-xs text-gray-500 text-center font-medium bg-gray-100 rounded py-1">
                              +{reservasDelDia.length - 4} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leyenda mejorada */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-center">📋 Leyenda</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                <span>Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded"></div>
                <span>Cancelada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-400 rounded"></div>
                <span>Día actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                <span>Fin de semana</span>
              </div>
            </div>
          </div>

          {/* Resumen estadístico mejorado */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{reservasDelMes.length}</div>
              <div className="text-blue-100">Total reservas</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {reservasDelMes.filter(r => r.estado === 'confirmada').length}
              </div>
              <div className="text-green-100">Confirmadas</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {reservasDelMes.filter(r => r.estado === 'pendiente').length}
              </div>
              <div className="text-yellow-100">Pendientes</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {new Set(reservasDelMes.map(r => r.laboratorio)).size}
              </div>
              <div className="text-purple-100">Laboratorios</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {new Set(reservasDelMes.map(r => r.profesor)).size}
              </div>
              <div className="text-orange-100">Profesores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles mejorado */}
      {modalAbierto && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className={`px-6 py-4 rounded-t-lg text-white ${
              reservaSeleccionada.estado === 'confirmada' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                : reservaSeleccionada.estado === 'pendiente'
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                : 'bg-gradient-to-r from-red-600 to-pink-600'
            }`}>
              <h2 className="text-xl font-bold text-center">
                📝 Detalles de la Reserva
              </h2>
              <div className="text-center mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {reservaSeleccionada.estado.charAt(0).toUpperCase() + reservaSeleccionada.estado.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    📅 Fecha
                  </label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {new Date(reservaSeleccionada.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    ⏰ Bloque
                  </label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    Bloque {reservaSeleccionada.bloque} ({reservaSeleccionada.subBloque})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    🎓 Curso
                  </label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {reservaSeleccionada.curso}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    📚 Asignatura
                  </label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {reservaSeleccionada.asignatura}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  👨‍🏫 Profesor
                </label>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {reservaSeleccionada.profesor}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  🧪 Laboratorio
                </label>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {reservaSeleccionada.laboratorio}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  📝 Tipo de Reserva
                </label>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {reservaSeleccionada.tipoBloque === 'completo' ? 'Bloque completo (2 horas)' : 
                   reservaSeleccionada.tipoBloque === '1hora' ? 'Primera hora únicamente' : 
                   'Segunda hora únicamente'}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <div>Sistema de Reservas - Consulta Pública</div>
        <div>Desarrollado por <span className="font-semibold text-indigo-600">Bit Core</span></div>
        <div>para <span className="font-semibold text-cyan-600">Jorge Zúñiga U.</span></div>
      </div>
    </div>
  );
};

export default CalendarioPage; 