import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

const LoginPage = () => {
  const { login, loading } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      if (!form.email || !form.password) {
        setError('Por favor completa todos los campos')
        return
      }

      const result = await login(form.email, form.password)
      
      if (result.success) {
        toast.success('¡Bienvenido! Sesión iniciada correctamente')
        navigate('/dashboard')
      } else {
        setError(result.error || 'Credenciales incorrectas')
        toast.error('Error al iniciar sesión')
      }
      
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error de conexión. Inténtalo de nuevo.')
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestCredentials = (userType) => {
    const credentials = {
      admin: { email: 'admin@escuela.com', password: 'admin123' },
      profesor: { email: 'profesor1@escuela.com', password: 'admin123' }
    }
    
    setForm(credentials[userType])
    toast.info(`Credenciales de ${userType} cargadas`)
  }

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '2rem'
    }}>
      <div style={{
        background: 'white', 
        padding: '3rem', 
        borderRadius: '12px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
        textAlign: 'center', 
        maxWidth: '400px', 
        width: '100%'
      }}>
        <h1 style={{ 
          color: '#1976d2', 
          marginBottom: '1rem', 
          fontSize: '2.5rem', 
          fontWeight: 'bold' 
        }}>
          🏫 Sistema de Reservas
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem', 
          fontSize: '1rem' 
        }}>
          Laboratorios Escolares
        </p>
        
        {/* Botones de credenciales de prueba */}
        <div style={{ 
          background: '#f0f8ff', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #e3f2fd'
        }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1976d2', fontWeight: 'bold' }}>
            🧪 Credenciales de prueba:
          </p>
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
              👨‍💼 Admin
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
              👨‍🏫 Profesor
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            name="email"
            placeholder="📧 Email"
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
            placeholder="🔒 Contraseña"
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
          
          {error && (
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '0.75rem', 
              borderRadius: '6px',
              fontSize: '0.9rem',
              border: '1px solid #ffcdd2'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || loading}
            style={{ 
              background: isLoading ? '#ccc' : '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '1rem 2rem', 
              borderRadius: '8px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease', 
              width: '100%' 
            }}
          >
            {isLoading ? '🔄 Iniciando sesión...' : '🚀 Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            📍 <strong>Instrucciones:</strong><br/>
            1. Haz clic en "Admin" o "Profesor" para cargar credenciales<br/>
            2. Haz clic en "Iniciar Sesión"<br/>
            3. ¡Disfruta del sistema! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 