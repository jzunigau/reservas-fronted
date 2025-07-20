import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav style={{ backgroundColor: '#1f2937', padding: '1rem' }}>
      <div style={{ color: 'white' }}>
        <h2>Sistema de Reservas</h2>
        <p>Usuario: {user ? user.email : 'No logueado'}</p>
        <p>Ruta actual: {location.pathname}</p>
      </div>
    </nav>
  );
};

export default Navbar;
