import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Credenciales de prueba para desarrollo
  const testUsers = {
    'admin': { password: 'admin123', rol: 'admin', nombre: 'Administrador', email: 'admin@escuela.com' },
    'profesor': { password: 'prof123', rol: 'profesor', nombre: 'Profesor', email: 'profesor@escuela.com' },
    'demo': { password: 'demo123', rol: 'profesor', nombre: 'Usuario Demo', email: 'demo@escuela.com' }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Modo desarrollo: verificar credenciales localmente
      const user = testUsers[form.usuario];
      
      if (user && user.password === form.password) {
        // Simular respuesta de API
        const userData = {
          id: 1,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        };
        
        // Simular token
        const token = 'dev_token_' + Date.now();
        
        login(userData, token);
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas. Usa: admin/admin123, profesor/prof123, o demo/demo123');
      }
    } catch (err) {
      setError('Error de conexión. Usando modo desarrollo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem'
    }}>
      <div style={{
        background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center', maxWidth: '400px', width: '100%'
      }}>
        <h1 style={{ color: '#1976d2', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Sistema de Reservas</h1>
        <h2 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Iniciar Sesión</h2>
        
        {/* Información de credenciales de prueba */}
        <div style={{ 
          background: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#1976d2'
        }}>
          <strong>Credenciales de Prueba:</strong><br/>
          <strong>Admin:</strong> admin / admin123<br/>
          <strong>Profesor:</strong> profesor / prof123<br/>
          <strong>Demo:</strong> demo / demo123
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            value={form.usuario}
            onChange={handleChange}
            required
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#4caf50', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', width: '100%' }}
            onMouseEnter={e => e.target.style.background = '#45a049'}
            onMouseLeave={e => e.target.style.background = '#4caf50'}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage; 