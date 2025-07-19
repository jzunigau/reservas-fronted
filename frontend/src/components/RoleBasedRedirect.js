import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';

const RoleBasedRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  console.log('🔍 DEBUG REDIRECT - Estado:', { 
    user: user ? { rol: user.rol, email: user.email } : null, 
    loading 
  });

  if (loading) {
    console.log('🔍 DEBUG REDIRECT - Mostrando loading...');
    return <Loading />;
  }

  if (!user) {
    console.log('🔍 DEBUG REDIRECT - No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Redirección basada en el rol del usuario
  console.log('🔍 DEBUG REDIRECT - Usuario encontrado, rol:', user.rol);
  
  switch (user.rol) {
    case 'admin':
      console.log('🔍 DEBUG REDIRECT - Redirigiendo admin a /admin');
      return <Navigate to="/admin" replace />;
    case 'profesor':
      console.log('🔍 DEBUG REDIRECT - Redirigiendo profesor a /reservas');
      return <Navigate to="/reservas" replace />;
    default:
      console.log('🔍 DEBUG REDIRECT - Rol no reconocido, redirigiendo a login');
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
