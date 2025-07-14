import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  obtenerReservas, 
  guardarReserva, 
  existeReservaEnSlot, 
  formatearReservaDesdeFormulario,
  obtenerReservasPorFecha 
} from '../utils/reservasService';

const bloques = [
  { id: 1, hora: '08:00 - 10:00' },
  { id: 2, hora: '10:00 - 12:00' },
  { id: 3, hora: '12:00 - 14:00' },
  { id: 4, hora: '14:00 - 16:00' },
  { id: 5, hora: '16:00 - 18:00' },
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const subBloques = ['1° hora', '2° hora'];

// Función para obtener el número de semana y el rango de lunes a viernes
function getSemanaInfo(fechaStr) {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr + 'T00:00:00');
  // Obtener el día de la semana (0=domingo, 1=lunes, ...)
  const diaSemana = fecha.getDay();
  // Calcular el lunes de esa semana
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));
  // Calcular el viernes de esa semana
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  // Número de semana ISO-8601
  const temp = new Date(lunes.getTime());
  temp.setHours(0,0,0,0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const firstThursday = temp.getTime();
  temp.setMonth(0, 1);
  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.round((firstThursday - temp.getTime()) / (7 * 24 * 3600 * 1000));
  // Formatear fechas
  const format = d => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return {
    semana: weekNumber,
    lunes: format(lunes),
    viernes: format(viernes)
  };
}

const ReservasPage = () => {
  const { user } = useContext(AuthContext);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    curso: '',
    asignatura: '',
    profesor: user?.nombre || '',
    bloque: '',
    fecha: '',
    tipoBloque: 'completo',
  });
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [todasLasReservas, setTodasLasReservas] = useState([]);

  const semanaInfo = getSemanaInfo(fechaSeleccionada);

  const obtenerFechaActual = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // Cargar reservas cuando cambia la fecha
  useEffect(() => {
    const cargarReservas = async () => {
      if (fechaSeleccionada) {
        try {
          const reservas = await obtenerReservasPorFecha(fechaSeleccionada);
          setReservasDelDia(reservas);
        } catch (error) {
          console.error('Error al cargar reservas del día:', error);
          setReservasDelDia([]);
        }
      } else {
        setReservasDelDia([]);
      }
      
      // Cargar todas las reservas para el debug
      try {
        const todas = await obtenerReservas();
        setTodasLasReservas(todas);
      } catch (error) {
        console.error('Error al cargar todas las reservas:', error);
        setTodasLasReservas([]);
      }
    };

    cargarReservas();
  }, [fechaSeleccionada]);

  // Al hacer click en una celda, guardar la info de la celda y abrir el modal
  const handleCeldaClick = async (bloque, dia, subBloque) => {
    try {
      // Verificar si ya existe una reserva en este slot
      const existe = await existeReservaEnSlot(fechaSeleccionada, dia, bloque.id, subBloque);
      if (existe) {
        alert('Ya existe una reserva en este horario. Selecciona otro slot disponible.');
        return;
      }

      setReservaSeleccionada({ bloque, dia, subBloque });
      setFormData({
        ...formData,
        bloque: `${bloque.id} - ${bloque.hora} (${subBloque})`,
        fecha: fechaSeleccionada,
        profesor: user?.nombre || '',
        tipoBloque: 'completo',
      });
      setModalAbierto(true);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      alert('Error al verificar disponibilidad. Inténtalo de nuevo.');
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Guardar la reserva usando el sistema de almacenamiento
  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    
    try {
      const datosReserva = formatearReservaDesdeFormulario(formData, reservaSeleccionada);
      const reservaGuardada = await guardarReserva(datosReserva);
      
      if (reservaGuardada) {
        // Actualizar la lista de reservas del día
        const reservasActualizadas = await obtenerReservasPorFecha(fechaSeleccionada);
        setReservasDelDia(reservasActualizadas);
        
        // Actualizar todas las reservas para el debug
        const todasActualizadas = await obtenerReservas();
        setTodasLasReservas(todasActualizadas);
        
        // Mostrar mensaje de éxito
        alert(`¡Reserva creada exitosamente! 
        
Detalles:
- Curso: ${formData.curso}
- Asignatura: ${formData.asignatura}
- Fecha: ${formData.fecha}
- Bloque: ${formData.bloque}
- Profesor: ${formData.profesor}
        
La reserva aparecerá automáticamente en el calendario público.`);
      } else {
        alert('Error al guardar la reserva. Inténtalo de nuevo.');
      }
      
      setModalAbierto(false);
      setFormData({
        curso: '',
        asignatura: '',
        profesor: user?.nombre || '',
        bloque: '',
        fecha: '',
        tipoBloque: 'completo',
      });
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      alert('Error al procesar la reserva. Verifica tu conexión e inténtalo de nuevo.');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFormData({
      curso: '',
      asignatura: '',
      profesor: user?.nombre || '',
      bloque: '',
      fecha: '',
      tipoBloque: 'completo',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-2 sm:p-3 lg:p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
            Sistema de Reservas
          </h1>
          <p className="text-gray-600 text-sm">
            Gestiona las reservas del laboratorio de forma eficiente
          </p>
        </div>

        {/* Selector de fecha */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-3 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <label htmlFor="fecha" className="text-sm font-semibold text-gray-700">
              Selecciona una fecha:
            </label>
            <input 
              type="date" 
              id="fecha" 
              name="fecha" 
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              min={obtenerFechaActual()}
              className="px-3 py-1 border-2 border-blue-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-center text-sm"
            />
          </div>
        </div>

        {/* Info de la semana seleccionada */}
        {semanaInfo && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200 p-2 mb-3 text-center animate-fade-in">
            <div className="text-blue-700 font-bold text-sm">
              Semana {semanaInfo.semana}
            </div>
            <div className="text-blue-600 text-xs">
              {semanaInfo.lunes} al {semanaInfo.viernes}
            </div>
          </div>
        )}

        {/* Tabla de horarios */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 h-96">
          <div className="overflow-auto h-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="px-2 py-2 text-center font-semibold text-xs uppercase tracking-wider border-r border-blue-700">
                    Horas/Bloq
                  </th>
                  {diasSemana.map(dia => (
                    <th key={dia} className="px-2 py-2 text-center font-semibold text-xs uppercase tracking-wider border-r border-blue-700 last:border-r-0">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bloques.map(bloque => (
                  [0, 1].map(subIdx => (
                    <tr key={`${bloque.id}-${subIdx}`} className="hover:bg-gray-50 transition-colors duration-200">
                      {subIdx === 0 && (
                        <td
                          rowSpan={2}
                          className="px-2 py-3 text-center bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 font-medium text-gray-700"
                        >
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {bloque.id}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {bloque.hora}
                          </div>
                        </td>
                      )}
                      {diasSemana.map(dia => {
                        const reservaEnSlot = reservasDelDia.find(r =>
                          r.dia === dia &&
                          String(r.bloque) === String(bloque.id) &&
                          r.subBloque === subBloques[subIdx]
                        );
                        
                        const existeReserva = !!reservaEnSlot;
                        
                        return (
                          <td
                            key={`${bloque.id}-${dia}-${subIdx}`}
                            onClick={() => !existeReserva && fechaSeleccionada && handleCeldaClick(bloque, dia, subBloques[subIdx])}
                            className={`px-2 py-2 text-center border-r border-gray-200 last:border-r-0 transition-all duration-200 min-h-[40px] ${
                              existeReserva 
                                ? 'bg-gradient-to-br from-red-100 to-pink-100 cursor-not-allowed' 
                                : fechaSeleccionada 
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:from-green-100 hover:to-emerald-100 hover:shadow-md' 
                                  : 'bg-gray-50 cursor-not-allowed'
                            }`}
                          >
                            {existeReserva ? (
                              <div className="space-y-0.5">
                                <div className="font-bold text-red-700 text-xs">Reservado</div>
                                {reservaEnSlot && (
                                  <>
                                    <div className="text-xs text-red-600">
                                      {reservaEnSlot.curso}
                                    </div>
                                    <div className="text-xs text-red-500">
                                      {reservaEnSlot.asignatura}
                                    </div>
                                    <div className="text-xs text-red-400">
                                      {reservaEnSlot.profesor}
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              fechaSeleccionada && (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-green-600 font-medium text-xs px-1 py-0.5 bg-green-100 rounded">
                                    Disponible
                                  </span>
                                </div>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enlace al calendario */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-700 mb-2">
              📅 ¿Quieres ver todas las reservas del mes?
            </div>
            <a 
              href="/calendario" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors duration-200"
            >
              Ver Calendario Mensual
            </a>
            <div className="text-sm text-indigo-600 mt-2">
              Las reservas que hagas aquí aparecerán automáticamente en el calendario
            </div>
          </div>
        </div>

        {/* Debug section */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="font-bold text-gray-700 mb-2">📊 Estadísticas del Sistema:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{todasLasReservas.length}</div>
              <div className="text-sm text-blue-700">Total Reservas</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{reservasDelDia.length}</div>
              <div className="text-sm text-green-700">Reservas Hoy</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(todasLasReservas.map(r => r.profesor)).size}
              </div>
              <div className="text-sm text-purple-700">Profesores Activos</div>
            </div>
          </div>
          
          {/* Últimas reservas */}
          {todasLasReservas.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-2">🕒 Últimas 3 Reservas:</div>
              <div className="space-y-2">
                {todasLasReservas.slice(-3).reverse().map(reserva => (
                  <div key={reserva.id} className="bg-white p-2 rounded border text-xs">
                    <strong>{reserva.curso}</strong> - {reserva.asignatura} | 
                    {new Date(reserva.fecha).toLocaleDateString('es-ES')} | 
                    Bloque {reserva.bloque} ({reserva.subBloque}) | 
                    {reserva.profesor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal para registrar reserva */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full max-h-[67vh] animate-bounce-in" style={{boxShadow: '8px 8px 25px rgba(0, 0, 0, 0.3), 4px 4px 15px rgba(0, 0, 0, 0.2)'}}>
              <div className="p-4">
                <h2 className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Registrar Reserva
                </h2>
                
                <form onSubmit={handleSubmitReserva} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Curso:
                    </label>
                    <select
                      name="curso"
                      value={formData.curso}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Selecciona un curso</option>
                      <option value="1°A">1°A</option>
                      <option value="1°B">1°B</option>
                      <option value="1°C">1°C</option>
                      <option value="2°A">2°A</option>
                      <option value="2°B">2°B</option>
                      <option value="2°C">2°C</option>
                      <option value="3°A">3°A</option>
                      <option value="3°B">3°B</option>
                      <option value="3°C">3°C</option>
                      <option value="4°A">4°A</option>
                      <option value="4°B">4°B</option>
                      <option value="4°C">4°C</option>
                      <option value="5°A">5°A</option>
                      <option value="5°B">5°B</option>
                      <option value="5°C">5°C</option>
                      <option value="6°A">6°A</option>
                      <option value="6°B">6°B</option>
                      <option value="6°C">6°C</option>
                      <option value="7°A">7°A</option>
                      <option value="7°B">7°B</option>
                      <option value="7°C">7°C</option>
                      <option value="8°A">8°A</option>
                      <option value="8°B">8°B</option>
                      <option value="8°C">8°C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Asignatura:
                    </label>
                    <input
                      type="text"
                      name="asignatura"
                      value={formData.asignatura}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                      placeholder="Ej: Matemáticas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Profesor:
                    </label>
                    <input
                      type="text"
                      name="profesor"
                      value={formData.profesor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Bloque:
                    </label>
                    <select
                      name="bloque"
                      value={formData.bloque}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Selecciona un bloque</option>
                      <option value="Bloque completo">Bloque completo</option>
                      <option value="1° hora">1° hora</option>
                      <option value="2° hora">2° hora</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Fecha:
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
                      </div>
          )}

          {/* Pie de página */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 leading-tight">
              <div>Desarrollado por Bit Core</div>
              <div>para Jorge Zúñiga U.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default ReservasPage; 