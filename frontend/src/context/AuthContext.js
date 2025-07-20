import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

console.log('🔍 DEBUG AUTH - Iniciando AuthContext simple...')

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Cambiar a true para mostrar loading inicial

  useEffect(() => {
    console.log('🔍 DEBUG AUTH - useEffect iniciado')
    
    // Verificar si hay datos de usuario en localStorage
    const savedUserData = localStorage.getItem('user_data')
    const authToken = localStorage.getItem('auth_token')
    
    if (savedUserData && authToken) {
      console.log('🔍 DEBUG AUTH - Datos encontrados en localStorage, verificando...')
      try {
        const userData = JSON.parse(savedUserData)
        
        // Verificar que los datos sean válidos y tengan rol
        if (userData && userData.rol && userData.email) {
          setUser(userData)
          console.log('✅ DEBUG AUTH - Sesión restaurada:', userData)
        } else {
          console.log('⚠️ DEBUG AUTH - Datos de sesión inválidos, limpiando localStorage')
          localStorage.removeItem('user_data')
          localStorage.removeItem('auth_token')
        }
      } catch (error) {
        console.log('⚠️ DEBUG AUTH - Error parseando datos guardados, limpiando localStorage')
        localStorage.removeItem('user_data')
        localStorage.removeItem('auth_token')
      }
    } else {
      console.log('🔍 DEBUG AUTH - No hay sesión guardada')
    }
    
    setLoading(false) // Terminar loading después de verificar
    console.log('🔍 DEBUG AUTH - Inicialización completada')
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG AUTH - Iniciando login con email:', email)
      
      if (!supabase?.from) {
        console.log('⚠️ DEBUG AUTH - Supabase no disponible, usando login de desarrollo')
        
        // Login de desarrollo sin base de datos
        const devUser = {
          id: Date.now(),
          email: email,
          username: email.split('@')[0],
          nombre: email.includes('admin') ? 'Administrador' : 'Profesor de Prueba',
          apellido: 'Desarrollo',
          rol: email.includes('admin') ? 'admin' : 'profesor',
          activo: true,
          isDevelopmentMode: true
        }
        
        setUser(devUser)
        localStorage.setItem('auth_token', `dev_token_${Date.now()}`)
        localStorage.setItem('user_data', JSON.stringify(devUser))
        
        console.log('✅ DEBUG AUTH - Login de desarrollo completado')
        return { success: true, user: devUser }
      }
      
      // Intentar login con base de datos
      console.log('🔍 DEBUG AUTH - Consultando base de datos...')
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, username, email, password, rol, nombre, apellido, activo')
        .eq('email', email)
        .eq('activo', true)
        .single()
      
      if (userError || !userData) {
        console.log('❌ DEBUG AUTH - Usuario no encontrado, usando login de desarrollo')
        
        // Fallback a login de desarrollo
        const devUser = {
          id: Date.now(),
          email: email,
          username: email.split('@')[0],
          nombre: email.includes('admin') ? 'Administrador' : 'Profesor de Prueba',
          apellido: 'Desarrollo',
          rol: email.includes('admin') ? 'admin' : 'profesor',
          activo: true,
          isDevelopmentMode: true
        }
        
        setUser(devUser)
        localStorage.setItem('auth_token', `dev_token_${Date.now()}`)
        localStorage.setItem('user_data', JSON.stringify(devUser))
        
        return { success: true, user: devUser }
      }
      
      // Verificar contraseña
      if (userData.password !== password) {
        console.log('❌ DEBUG AUTH - Contraseña incorrecta')
        return { success: false, error: 'Credenciales incorrectas' }
      }
      
      console.log('✅ DEBUG AUTH - Usuario autenticado desde base de datos:', userData)
      
      setUser(userData)
      localStorage.setItem('auth_token', `db_token_${userData.id}_${Date.now()}`)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ DEBUG AUTH - Error en login:', error)
      
      // Fallback final a login de desarrollo
      const devUser = {
        id: Date.now(),
        email: email,
        username: email.split('@')[0],
        nombre: email.includes('admin') ? 'Administrador' : 'Profesor de Prueba',
        apellido: 'Desarrollo',
        rol: email.includes('admin') ? 'admin' : 'profesor',
        activo: true,
        isDevelopmentMode: true
      }
      
      setUser(devUser)
      localStorage.setItem('auth_token', `fallback_token_${Date.now()}`)
      localStorage.setItem('user_data', JSON.stringify(devUser))
      
      return { success: true, user: devUser }
      
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG AUTH - Iniciando logout...')
      
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      console.log('✅ DEBUG AUTH - Logout completado')
      return { success: true }
      
    } catch (error) {
      console.error('❌ DEBUG AUTH - Error en logout:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    // Función placeholder
    console.log('📝 DEBUG AUTH - Register llamado:', userData)
    return { success: false, error: 'Registro no implementado' }
  }

  const hasRole = (role) => {
    return user?.rol === role
  }

  const isAdmin = () => {
    return hasRole('admin')
  }

  const isProfesor = () => {
    return hasRole('profesor')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    hasRole,
    isAdmin,
    isProfesor
  }

  console.log('🔍 DEBUG AUTH - Contexto renderizando, usuario actual:', user)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
