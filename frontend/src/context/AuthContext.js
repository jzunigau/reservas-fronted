import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

console.log('🔍 DEBUG AUTH - Iniciando AuthContext...')
console.log('🔍 DEBUG AUTH - Supabase client:', !!supabase)

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 DEBUG AUTH - useEffect iniciado')
    
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log('🔍 DEBUG AUTH - Obteniendo sesión inicial...')
        console.log('🔍 DEBUG AUTH - Supabase auth exists:', !!supabase?.auth)
        
        if (!supabase?.auth) {
          console.log('⚠️ DEBUG AUTH - Supabase auth no disponible, usando modo dummy')
          setLoading(false)
          return
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 DEBUG AUTH - Sesión obtenida:', !!session)
        
        if (session) {
          console.log('🔍 DEBUG AUTH - Cargando datos de usuario...')
          await loadUserData(session.user)
        }
      } catch (error) {
        console.error('🚨 DEBUG AUTH - Error al obtener sesión inicial:', error)
      } finally {
        console.log('🔍 DEBUG AUTH - Finalizando carga inicial')
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    if (!supabase?.auth) {
      console.log('⚠️ DEBUG AUTH - Supabase auth no disponible para listener')
      setLoading(false)
      return
    }

    console.log('🔍 DEBUG AUTH - Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 DEBUG AUTH - Cambio de estado:', event, !!session)
      
      if (event === 'SIGNED_IN' && session) {
        await loadUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Cargar datos del usuario desde la tabla usuarios
  const loadUserData = async (authUser) => {
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('id, username, email, rol, nombre, apellido, activo')
        .eq('email', authUser.email)
        .single()

      if (error || !userData) {
        console.error('Error al cargar datos del usuario:', error)
        setUser(null)
        return
      }

      // Combinar datos de auth con datos de la tabla usuarios
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: userData.rol,
        activo: userData.activo,
        authId: authUser.id
      })
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error)
      setUser(null)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      if (!supabase?.auth) {
        console.log('⚠️ DEBUG AUTH - Supabase auth no disponible para login')
        return { success: false, error: 'Servicio de autenticación no disponible' }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (error) {
        throw error
      }

      // Los datos del usuario se cargarán automáticamente por el listener
      return { success: true, data }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      if (!supabase?.auth) {
        console.log('⚠️ DEBUG AUTH - Supabase auth no disponible para logout')
        setUser(null)
        localStorage.removeItem('auth_token')
        return { success: true }
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      setUser(null)
      // Limpiar localStorage
      localStorage.removeItem('auth_token')
      
      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      if (!supabase?.auth) {
        console.log('⚠️ DEBUG AUTH - Supabase auth no disponible para registro')
        return { success: false, error: 'Servicio de autenticación no disponible' }
      }
      
      // Primero crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email, 
        password: userData.password,
        options: {
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido,
            rol: userData.rol || 'profesor'
          }
        }
      })

      if (authError) {
        throw authError
      }

      // Luego crear el registro en la tabla usuarios
      const { data: dbData, error: dbError } = await supabase
        .from('usuarios')
        .insert([{
          username: userData.username || userData.email.split('@')[0],
          email: userData.email,
          password: 'managed_by_supabase_auth', // Placeholder
          rol: userData.rol || 'profesor',
          nombre: userData.nombre,
          apellido: userData.apellido,
          activo: true
        }])
        .select()

      if (dbError) {
        console.error('Error al crear usuario en DB:', dbError)
        // No lanzar error aquí para no interrumpir el flujo
      }

      return { success: true, data: authData }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.rol === role
  }

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    return hasRole('admin')
  }

  // Función para verificar si el usuario es profesor
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 