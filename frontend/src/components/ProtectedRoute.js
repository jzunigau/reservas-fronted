import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
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
        Verificando autenticación...
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('🔍 ProtectedRoute - No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Si hay roles específicos requeridos, verificar
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    console.log('🔍 ProtectedRoute - Usuario sin permisos para esta ruta');
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado y con permisos, renderizar contenido
  return children;
};

export default ProtectedRoute; 