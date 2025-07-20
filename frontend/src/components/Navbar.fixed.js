import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error durante logout:', error);
      navigate('/login');
    }
  };

  if (!user) {
    return null; // No mostrar navbar si no hay usuario
  }

  return (
    <nav style={{ 
      background: 'linear-gradient(to right, #2563eb, #9333ea)', // azul a púrpura como el original
      padding: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        {/* Logo y info */}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            📚 Sistema de Reservas
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
            {user.email} ({user.rol})
          </p>
        </div>

        {/* Navegación */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user.rol === 'admin' && (
            <Link 
              to="/admin" 
              style={{ 
                color: location.pathname === '/admin' ? '#93c5fd' : 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                backgroundColor: location.pathname === '/admin' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              🏠 Dashboard
            </Link>
          )}
          
          <Link 
            to="/mi-cuenta" 
            style={{ 
              color: location.pathname === '/mi-cuenta' ? '#93c5fd' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              backgroundColor: location.pathname === '/mi-cuenta' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            👤 Mi Cuenta
          </Link>
          
          <Link 
            to="/reservas" 
            style={{ 
              color: location.pathname === '/reservas' ? '#93c5fd' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              backgroundColor: location.pathname === '/reservas' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            📋 Reservas
          </Link>
          
          <Link 
            to="/calendario" 
            style={{ 
              color: location.pathname === '/calendario' ? '#93c5fd' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              backgroundColor: location.pathname === '/calendario' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            📅 Calendario
          </Link>

          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
