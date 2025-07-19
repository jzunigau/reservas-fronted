import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const LoginPage = () => {
  const { login, loading, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirigir automáticamente si ya hay un usuario logueado
  useEffect(() => {
    console.log('🔍 DEBUG LOGIN - useEffect ejecutado, usuario:', user)
    
    if (user && user.rol) {
      console.log('🔍 DEBUG LOGIN - Usuario ya logueado, redirigiendo...', user.rol)
      
      if (user.rol === 'admin') {
        console.log('🔍 DEBUG LOGIN - Redirigiendo admin a /admin')
        navigate('/admin', { replace: true })
      } else if (user.rol === 'profesor') {
        console.log('🔍 DEBUG LOGIN - Redirigiendo profesor a /reservas')
        navigate('/reservas', { replace: true })
      }
    } else {
      console.log('🔍 DEBUG LOGIN - No hay usuario o no tiene rol')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Función para rellenar credenciales de prueba
  const fillTestCredentials = (userType) => {
    if (userType === 'admin') {
      setForm({ email: 'admin.coco.jezu@gmail.com', password: 'admin123' })
    } else if (userType === 'profesor') {
      setForm({ email: 'profesor.coco.jezu@gmail.com', password: 'profesor123' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    console.log('🔍 DEBUG LOGIN - Iniciando proceso de login')
    console.log('🔍 DEBUG LOGIN - Email:', form.email)
    
    try {
      console.log('🔍 DEBUG LOGIN - Llamando a login...')
      const result = await login(form.email, form.password)
      console.log('🔍 DEBUG LOGIN - Resultado del login:', result)
      
      if (result.success) {
        console.log('🔍 DEBUG LOGIN - Login exitoso, esperando redirección automática')
        // La redirección se maneja en el useEffect
      } else {
        console.log('🔍 DEBUG LOGIN - Login falló:', result.error)
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('🔍 DEBUG LOGIN - Error en handleSubmit:', error)
      setError('Error al conectar con el servidor')
    }
    
    setIsLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#333',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            Sistema de Reservas
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Laboratorios Médicos
          </p>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #ffcdd2'
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          Inicia sesión para acceder al sistema
        </p>
        
        {/* Instrucciones para usar la base de datos */}
        <div style={{ 
          background: '#e8f5e8', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #4caf50'
        }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#2e7d32', fontWeight: 'bold' }}>
            📊 Usuarios en Base de Datos:
          </p>
          <div style={{ fontSize: '0.8rem', color: '#2e7d32', marginBottom: '1rem' }}>
            <div>✅ Los usuarios ya están en la tabla de Supabase</div>
            <div>✅ Solo necesitas hacer login normal</div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillTestCredentials('admin')}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('profesor')}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Profesor
            </button>
          </div>
          
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#2e7d32', textAlign: 'center' }}>
            <strong>admin.coco.jezu@gmail.com</strong> / admin123<br/>
            <strong>profesor.coco.jezu@gmail.com</strong> / profesor123
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              padding: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            type="submit"
            disabled={isLoading || loading}
            style={{
              background: isLoading || loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading || loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        {/* Instrucciones para agregar usuarios a la base de datos */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: '#fff3e0',
          borderRadius: '8px',
          border: '1px solid #ff9800'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#e65100', fontWeight: 'bold' }}>
            🗃️ Pasos para configurar usuarios:
          </p>
          <p style={{ margin: '0', fontSize: '0.7rem', color: '#e65100' }}>
            1. Ve a Supabase → SQL Editor<br/>
            2. Ejecuta: database/insert_test_users.sql<br/>
            3. Los usuarios se crearán automáticamente<br/>
            4. Usa los botones arriba para auto-completar
          </p>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
            <strong>Flujo del Sistema:</strong>
          </p>
          <p style={{ margin: '0', fontSize: '0.75rem', color: '#888' }}>
            Admin: Login → Panel Admin → Reservas → Calendario<br/>
            Profesor: Login → Reservas → Calendario
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
