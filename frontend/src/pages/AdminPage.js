import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');

  // Datos simulados para demostración
  const [reservas, setReservas] = useState([
    { id: 1, fecha: '2024-01-15', bloque: 1, profesor: 'Juan Pérez', curso: '3° A', asignatura: 'Matemáticas', laboratorio: 'Lab 1', estado: 'confirmada' },
    { id: 2, fecha: '2024-01-15', bloque: 2, profesor: 'María García', curso: '2° B', asignatura: 'Física', laboratorio: 'Lab 2', estado: 'pendiente' },
    { id: 3, fecha: '2024-01-16', bloque: 3, profesor: 'Carlos López', curso: '1° A', asignatura: 'Química', laboratorio: 'Lab 1', estado: 'cancelada' },
  ]);

  const [profesores, setProfesores] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@colegio.com', asignaturas: ['Matemáticas', 'Física'], activo: true },
    { id: 2, nombre: 'María García', email: 'maria.garcia@colegio.com', asignaturas: ['Física', 'Química'], activo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@colegio.com', asignaturas: ['Química', 'Biología'], activo: false },
  ]);

  const [laboratorios, setLaboratorios] = useState([
    { id: 1, nombre: 'Laboratorio de Física', capacidad: 30, ubicacion: 'Piso 2', equipamiento: 'Completo', disponible: true },
    { id: 2, nombre: 'Laboratorio de Química', capacidad: 25, ubicacion: 'Piso 1', equipamiento: 'Completo', disponible: true },
    { id: 3, nombre: 'Laboratorio de Biología', capacidad: 28, ubicacion: 'Piso 3', equipamiento: 'Parcial', disponible: false },
  ]);

  // Estadísticas calculadas
  const stats = {
    totalReservas: reservas.length,
    reservasHoy: reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length,
    profesoresActivos: profesores.filter(p => p.activo).length,
    laboratoriosDisponibles: laboratorios.filter(l => l.disponible).length,
    reservasPendientes: reservas.filter(r => r.estado === 'pendiente').length,
    reservasConfirmadas: reservas.filter(r => r.estado === 'confirmada').length,
  };

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
  };

  const cambiarEstadoReserva = (id, nuevoEstado) => {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
  };

  const toggleProfesorActivo = (id) => {
    setProfesores(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p));
  };

  const toggleLaboratorioDisponible = (id) => {
    setLaboratorios(prev => prev.map(l => l.id === id ? { ...l, disponible: !l.disponible } : l));
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg p-4 sm:p-6 shadow-lg border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Reservas"
          value={stats.totalReservas}
          icon="📊"
          color="border-blue-500"
          subtitle="Este período"
        />
        <StatCard
          title="Reservas Hoy"
          value={stats.reservasHoy}
          icon="📅"
          color="border-green-500"
          subtitle="Programadas"
        />
        <StatCard
          title="Profesores Activos"
          value={stats.profesoresActivos}
          icon="👨‍🏫"
          color="border-purple-500"
          subtitle="En el sistema"
        />
        <StatCard
          title="Labs Disponibles"
          value={stats.laboratoriosDisponibles}
          icon="🔬"
          color="border-yellow-500"
          subtitle="Para reservar"
        />
      </div>

      {/* Resumen de actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas recientes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reservas Recientes</h3>
            <button
              onClick={() => setActiveTab('reservas')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {reservas.slice(0, 3).map(reserva => (
              <div key={reserva.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{reserva.profesor}</p>
                  <p className="text-sm text-gray-600">{reserva.asignatura} - {reserva.curso}</p>
                  <p className="text-xs text-gray-500">{reserva.fecha} - Bloque {reserva.bloque}</p>
                </div>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}
                `}>
                  {reserva.estado}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de laboratorios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Estado Laboratorios</h3>
            <button
              onClick={() => setActiveTab('laboratorios')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Gestionar →
            </button>
          </div>
          <div className="space-y-3">
            {laboratorios.map(lab => (
              <div key={lab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{lab.nombre}</p>
                  <p className="text-sm text-gray-600">Capacidad: {lab.capacidad} - {lab.ubicacion}</p>
                </div>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${lab.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}>
                  {lab.disponible ? 'Disponible' : 'Mantenimiento'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReservas = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">Gestión de Reservas</h3>
        <div className="flex gap-2">
          <button
            onClick={() => abrirModal('nueva-reserva')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            + Nueva Reserva
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
            📊 Exportar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laboratorio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservas.map(reserva => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reserva.profesor}</div>
                      <div className="text-sm text-gray-500">{reserva.asignatura}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{reserva.fecha}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Bloque {reserva.bloque}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{reserva.curso}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{reserva.laboratorio}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={reserva.estado}
                      onChange={(e) => cambiarEstadoReserva(reserva.id, e.target.value)}
                      className={`
                        text-xs font-medium rounded-full px-2 py-1 border-0
                        ${reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                          reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">✏️</button>
                      <button className="text-red-600 hover:text-red-900">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProfesores = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">Gestión de Profesores</h3>
        <button
          onClick={() => abrirModal('nuevo-profesor')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Nuevo Profesor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profesores.map(profesor => (
          <div key={profesor.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {profesor.nombre.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{profesor.nombre}</h4>
                  <p className="text-sm text-gray-600">{profesor.email}</p>
                </div>
              </div>
              <button
                onClick={() => toggleProfesorActivo(profesor.id)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${profesor.activo 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'}
                `}
              >
                {profesor.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Asignaturas:</p>
              <div className="flex flex-wrap gap-1">
                {profesor.asignaturas.map(asignatura => (
                  <span key={asignatura} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {asignatura}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                Editar
              </button>
              <button className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLaboratorios = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">Gestión de Laboratorios</h3>
        <button
          onClick={() => abrirModal('nuevo-laboratorio')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Nuevo Laboratorio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {laboratorios.map(lab => (
          <div key={lab.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🔬</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{lab.nombre}</h4>
                  <p className="text-sm text-gray-600">{lab.ubicacion}</p>
                </div>
              </div>
              <button
                onClick={() => toggleLaboratorioDisponible(lab.id)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${lab.disponible 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'}
                `}
              >
                {lab.disponible ? 'Disponible' : 'Mantenimiento'}
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Capacidad:</span>
                <span className="text-sm font-medium">{lab.capacidad} estudiantes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Equipamiento:</span>
                <span className={`text-sm font-medium ${lab.equipamiento === 'Completo' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {lab.equipamiento}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                Editar
              </button>
              <button className="flex-1 px-3 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Horarios
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfiguracion = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Configuración del Sistema</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración general */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Configuración General</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Centro
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="Colegio San Francisco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario de Funcionamiento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="08:00"
                />
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="18:00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de Bloques (minutos)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="120"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Notificaciones</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Confirmación automática</h5>
                <p className="text-sm text-gray-600">Confirmar reservas automáticamente</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Recordatorios por email</h5>
                <p className="text-sm text-gray-600">Enviar recordatorios 24h antes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Límite de reservas</h5>
                <p className="text-sm text-gray-600">Máximo por profesor por día</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                <option value="1">1 reserva</option>
                <option value="2">2 reservas</option>
                <option value="3">3 reservas</option>
                <option value="999">Sin límite</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Guardar Configuración
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'reservas': return renderReservas();
      case 'profesores': return renderProfesores();
      case 'laboratorios': return renderLaboratorios();
      case 'configuracion': return renderConfiguracion();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                  Panel de Administración
                </h1>
                <p className="text-blue-100 mt-2">
                  Bienvenido, {user?.nombre || 'Administrador'}
                </p>
              </div>
              <div className="text-white text-right">
                <p className="text-sm opacity-80">Último acceso</p>
                <p className="text-lg font-medium">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <TabButton
                id="dashboard"
                label="Dashboard"
                icon="📊"
                isActive={activeTab === 'dashboard'}
                onClick={setActiveTab}
              />
              <TabButton
                id="reservas"
                label="Reservas"
                icon="📅"
                isActive={activeTab === 'reservas'}
                onClick={setActiveTab}
              />
              <TabButton
                id="profesores"
                label="Profesores"
                icon="👨‍🏫"
                isActive={activeTab === 'profesores'}
                onClick={setActiveTab}
              />
              <TabButton
                id="laboratorios"
                label="Laboratorios"
                icon="🔬"
                isActive={activeTab === 'laboratorios'}
                onClick={setActiveTab}
              />
              <TabButton
                id="configuracion"
                label="Configuración"
                icon="⚙️"
                isActive={activeTab === 'configuracion'}
                onClick={setActiveTab}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          {renderContent()}
        </div>
      </div>

      {/* Modal placeholder */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-white text-center">
                {modalTipo === 'nueva-reserva' ? 'Nueva Reserva' :
                 modalTipo === 'nuevo-profesor' ? 'Nuevo Profesor' :
                 modalTipo === 'nuevo-laboratorio' ? 'Nuevo Laboratorio' : 'Modal'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center mb-4">
                Funcionalidad de {modalTipo} en desarrollo...
              </p>
              <button
                onClick={cerrarModal}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <div>Panel desarrollado por <span className="font-semibold text-blue-600">Bit Core</span></div>
        <div>para <span className="font-semibold text-purple-600">Jorge Zúñiga U.</span></div>
      </div>
    </div>
  );
};

export default AdminPage; 