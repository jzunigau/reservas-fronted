import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error durante logout:', error);
      navigate('/login'); // Navegar al login aún si hay error
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              📚 Sistema de Reservas
            </Link>
          </div>

          {/* Enlaces de navegación */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              
              {/* Enlaces para usuarios autenticados */}
              {user ? (
                <>
                  {/* Para ADMIN: Dashboard (Admin) → Reservas → Calendario → Mi Cuenta */}
                  {user.rol === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/admin')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        🏠 Dashboard Admin
                      </Link>
                      
                      <Link
                        to="/reservas"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/reservas')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📋 Reservas
                      </Link>
                      
                      <Link
                        to="/calendario"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/calendario')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📅 Calendario
                      </Link>

                      <Link
                        to="/mi-cuenta"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/mi-cuenta')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        👤 Mi Cuenta
                      </Link>
                    </>
                  )}
                  
                  {/* Para PROFESOR: Reservas → Calendario → Mi Cuenta */}
                  {user.rol === 'profesor' && (
                    <>
                      <Link
                        to="/reservas"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/reservas')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📋 Reservas
                      </Link>
                      
                      <Link
                        to="/calendario"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/calendario')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📅 Calendario
                      </Link>

                      <Link
                        to="/mi-cuenta"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/mi-cuenta')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        👤 Mi Cuenta
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Enlace al calendario (visible para visitantes) */}
                  <Link
                    to="/calendario"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/calendario')
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    📅 Calendario
                  </Link>
                  
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/login')
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    🔐 Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Información del usuario */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-white text-sm">
                    <span className="font-medium">👤 {user.nombre}</span>
                    <span className="text-white/80 ml-2">({user.rol})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-white/20 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-white/30 transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="text-white/80 text-sm">
                  Acceso público
                </div>
              )}
            </div>
          </div>

          {/* Menú móvil */}
          <div className="md:hidden">
            <div className="flex flex-col space-y-1">
              
              {user ? (
                <>
                  {/* Para ADMIN */}
                  {user.rol === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/admin')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        🏠 Admin
                      </Link>
                      
                      <Link
                        to="/reservas"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/reservas')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📋 Reservas
                      </Link>
                      
                      <Link
                        to="/calendario"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/calendario')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📅 Calendario
                      </Link>

                      <Link
                        to="/mi-cuenta"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/mi-cuenta')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        👤 Mi Cuenta
                      </Link>
                    </>
                  )}
                  
                  {/* Para PROFESOR */}
                  {user.rol === 'profesor' && (
                    <>
                      <Link
                        to="/reservas"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/reservas')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📋 Reservas
                      </Link>
                      
                      <Link
                        to="/calendario"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/calendario')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        📅 Calendario
                      </Link>

                      <Link
                        to="/mi-cuenta"
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive('/mi-cuenta')
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        👤 Mi Cuenta
                      </Link>
                    </>
                  )}
                  
                  {/* Botón de logout para móvil */}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white/20 text-white hover:bg-white/30 transition-colors duration-200 mt-2"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/calendario"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/calendario')
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    📅 Calendario
                  </Link>
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/login')
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    🔐 Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 