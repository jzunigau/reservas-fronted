import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { obtenerReservas } from '../utils/reservasService';

const MiCuentaPage = () => {
  const { user } = useContext(AuthContext);
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalAño: 0,
    totalMes: 0,
    bloquesMasUsados: [],
    diasMasActivos: [],
    asignaturasMasReservadas: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      if (!user?.nombre) return;
      
      try {
        setLoading(true);
        
        // Obtener todas las reservas del usuario
        const todasReservas = await obtenerReservas();
        const reservasDelUsuario = todasReservas.filter(
          reserva => reserva.profesor === user.nombre
        );
        
        setReservasUsuario(reservasDelUsuario);
        calcularEstadisticas(reservasDelUsuario);
        
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [user]);

  const calcularEstadisticas = (reservas) => {
    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    // Filtrar reservas del año actual
    const reservasAño = reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha + 'T00:00:00');
      return fechaReserva.getFullYear() === añoActual;
    });

    // Filtrar reservas del mes actual
    const reservasMes = reservasAño.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha + 'T00:00:00');
      return fechaReserva.getMonth() + 1 === mesActual;
    });

    // Calcular bloques más usados
    const bloqueCount = {};
    reservasAño.forEach(reserva => {
      const bloque = reserva.bloque;
      bloqueCount[bloque] = (bloqueCount[bloque] || 0) + 1;
    });

    const bloquesMasUsados = Object.entries(bloqueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([bloque, count]) => ({ bloque, count }));

    // Calcular días más activos
    const diaCount = {};
    reservasAño.forEach(reserva => {
      const dia = reserva.dia;
      diaCount[dia] = (diaCount[dia] || 0) + 1;
    });

    const diasMasActivos = Object.entries(diaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([dia, count]) => ({ dia, count }));

    // Calcular asignaturas más reservadas
    const asignaturaCount = {};
    reservasAño.forEach(reserva => {
      const asignatura = reserva.asignatura || 'Sin especificar';
      asignaturaCount[asignatura] = (asignaturaCount[asignatura] || 0) + 1;
    });

    const asignaturasMasReservadas = Object.entries(asignaturaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([asignatura, count]) => ({ asignatura, count }));

    setEstadisticas({
      totalAño: reservasAño.length,
      totalMes: reservasMes.length,
      bloquesMasUsados,
      diasMasActivos,
      asignaturasMasReservadas
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const obtenerMesNombre = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[new Date().getMonth()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de la cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Cuenta</h1>
          <p className="text-gray-600">
            Información personal y estadísticas de uso del sistema de reservas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Información del Usuario */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {obtenerIniciales(user?.nombre)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {user?.nombre || 'Usuario'}
              </h2>
              <p className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded-full inline-block">
                👨‍🏫 Profesor
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  📊 Resumen de Actividad
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de reservas:</span>
                    <span className="font-semibold text-blue-600">{reservasUsuario.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Este año:</span>
                    <span className="font-semibold text-green-600">{estadisticas.totalAño}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Este mes:</span>
                    <span className="font-semibold text-purple-600">{estadisticas.totalMes}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                  🎯 Estado Actual
                </h3>
                <p className="text-sm text-blue-600">
                  Cuenta activa y funcionando correctamente
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✅ Verificado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Estadísticas del Año y Mes Actual */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              📈 Estadísticas {new Date().getFullYear()}
            </h2>

            <div className="space-y-4">
              {/* Resumen del mes */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-700 mb-3">📊 Resumen de {obtenerMesNombre()}</h3>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {estadisticas.totalMes}
                    </div>
                    <p className="text-xs text-purple-600">Reservas este mes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-500 mb-1">
                      {estadisticas.totalMes > 0 ? (estadisticas.totalMes / new Date().getDate()).toFixed(1) : '0.0'}
                    </div>
                    <p className="text-xs text-purple-500">Promedio diario</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-purple-600">Progreso del mes:</span>
                    <span className="font-semibold text-purple-700">
                      {Math.round((new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bloques más usados */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-700 mb-3">🕐 Bloques Preferidos</h3>
                {estadisticas.bloquesMasUsados.length > 0 ? (
                  <div className="space-y-2">
                    {estadisticas.bloquesMasUsados.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Bloque {item.bloque}</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-blue-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...estadisticas.bloquesMasUsados.map(b => b.count))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-blue-700 text-sm">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos disponibles</p>
                )}
              </div>

              {/* Días más activos */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-700 mb-3">📅 Días Más Activos</h3>
                {estadisticas.diasMasActivos.length > 0 ? (
                  <div className="space-y-2">
                    {estadisticas.diasMasActivos.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{item.dia}</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-green-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...estadisticas.diasMasActivos.map(d => d.count))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-green-700 text-sm">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Tabla de Reservas */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              📋 Mis Reservas
            </h2>

            <div className="space-y-4">
              {/* Historial */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">📋 Historial</h3>
                <div className="space-y-3">
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-gray-600">
                      {reservasUsuario.length}
                    </div>
                    <p className="text-xs text-gray-600">Total de reservas</p>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {reservasUsuario.length > 0 ? (
                      reservasUsuario
                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                        .slice(0, 5)
                        .map((reserva, index) => (
                          <div key={index} className="bg-white rounded p-2 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700">
                                  {new Date(reserva.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short'
                                  })} - {reserva.dia}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Bloque {reserva.bloque}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-600 truncate max-w-16" title={reserva.curso}>
                                  {reserva.curso?.substring(0, 8) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-2">📋</div>
                        <p className="text-sm text-gray-500">No tienes reservas registradas</p>
                      </div>
                    )}
                  </div>
                  
                  {reservasUsuario.length > 5 && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        y {reservasUsuario.length - 5} más...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mis futuras reservas */}
              {(() => {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const reservasFuturas = reservasUsuario.filter(reserva => {
                  const fechaReserva = new Date(reserva.fecha + 'T00:00:00');
                  return fechaReserva >= hoy;
                });
                
                return reservasFuturas.length > 0 ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-green-700 mb-3">🚀 Mis Futuras Reservas</h3>
                    <div className="space-y-3">
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          {reservasFuturas.length}
                        </div>
                        <p className="text-xs text-green-600">Reservas próximas</p>
                      </div>
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {reservasFuturas
                          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                          .slice(0, 5)
                          .map((reserva, index) => (
                          <div key={index} className="bg-white rounded p-2 border border-green-200">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="text-xs font-medium text-green-700">
                                  {new Date(reserva.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short'
                                  })} - {reserva.dia}
                                </div>
                                <div className="text-xs text-green-600">
                                  Bloque {reserva.bloque}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-green-600 truncate max-w-16" title={reserva.curso}>
                                  {reserva.curso?.substring(0, 8) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {reservasFuturas.length > 5 && (
                        <div className="text-center">
                          <span className="text-xs text-green-500">
                            y {reservasFuturas.length - 5} más...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">🚀 Mis Futuras Reservas</h3>
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">📅</div>
                      <p className="text-sm text-gray-500">No tienes reservas próximas</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Crea una nueva reserva para verla aquí
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="text-center text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> Tus estadísticas se actualizan automáticamente cada vez que realizas una nueva reserva.</p>
            <p className="mt-1">Para más información sobre el uso del sistema, consulta la documentación o contacta al administrador.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiCuentaPage;