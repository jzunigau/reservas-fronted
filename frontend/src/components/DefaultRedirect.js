import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DefaultRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando sistema...
      </div>
    );
  }

  // Si no hay usuario, ir al login
  if (!user) {
    console.log('🔍 DefaultRedirect - No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, redirigir según su rol
  if (user.rol === 'admin') {
    console.log('🔍 DefaultRedirect - Usuario admin, redirigiendo a /admin');
    return <Navigate to="/admin" replace />;
  } else if (user.rol === 'profesor') {
    console.log('🔍 DefaultRedirect - Usuario profesor, redirigiendo a /reservas');
    return <Navigate to="/reservas" replace />;
  }

  // Fallback al login si no tiene rol válido
  console.log('🔍 DefaultRedirect - Usuario sin rol válido, redirigiendo a login');
  return <Navigate to="/login" replace />;
};

export default DefaultRedirect;
