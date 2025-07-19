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
        
        // Primero verificar si hay datos de usuario en localStorage (login directo)
        const savedUserData = localStorage.getItem('user_data')
        const authToken = localStorage.getItem('auth_token')
        
        if (savedUserData && authToken) {
          console.log('🔍 DEBUG AUTH - Encontrados datos de login directo en localStorage')
          try {
            const userData = JSON.parse(savedUserData)
            console.log('✅ DEBUG AUTH - Restaurando sesión de login directo:', userData)
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              nombre: userData.nombre,
              apellido: userData.apellido,
              rol: userData.rol,
              activo: userData.activo,
              isDirectLogin: true
            })
            setLoading(false)
            return
          } catch (error) {
            console.log('⚠️ DEBUG AUTH - Error parseando datos guardados:', error)
            localStorage.removeItem('user_data')
            localStorage.removeItem('auth_token')
          }
        }
        
        // Si no hay login directo, verificar Supabase Auth (funcionalidad legacy)
        console.log('🔍 DEBUG AUTH - Supabase auth exists:', !!supabase?.auth)
        
        if (!supabase?.auth) {
          console.log('⚠️ DEBUG AUTH - Supabase auth no disponible, usando modo dummy')
          setLoading(false)
          return
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 DEBUG AUTH - Sesión de Supabase Auth obtenida:', !!session)
        
        if (session) {
          console.log('🔍 DEBUG AUTH - Cargando datos de usuario desde Supabase Auth...')
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
        console.log('🔍 DEBUG AUTH - Usuario no encontrado en tabla usuarios, creando entrada básica...')
        
        // Determinar rol basado en email o metadata
        let userRole = 'profesor' // rol por defecto
        if (authUser.email.includes('admin')) {
          userRole = 'admin'
        } else if (authUser.user_metadata?.role) {
          userRole = authUser.user_metadata.role
        } else if (authUser.email === 'coco.jezu@gmail.com') {
          // Para el email específico, usar la metadata del signup para determinar el rol
          userRole = authUser.user_metadata?.role || 'profesor'
        }
        
        // Crear entrada básica si el usuario no existe en la tabla
        const basicUser = {
          id: authUser.id,
          email: authUser.email,
          username: authUser.email.split('@')[0],
          nombre: authUser.user_metadata?.nombre || (authUser.email.includes('admin') ? 'Administrador' : 'Profesor de Prueba'),
          apellido: authUser.user_metadata?.apellido || 'Sistema',
          rol: userRole,
          activo: true,
        }
        
        console.log('🔍 DEBUG AUTH - Usando datos básicos:', basicUser)
        setUser(basicUser)
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
      console.log('🔍 DEBUG AUTH - Iniciando login con email:', email)
      
      if (!supabase?.from) {
        console.log('⚠️ DEBUG AUTH - Supabase from no disponible para consulta de usuarios')
        return { success: false, error: 'Servicio de base de datos no disponible' }
      }
      
      // Buscar usuario en la tabla usuarios
      console.log('🔍 DEBUG AUTH - Buscando usuario en tabla usuarios...')
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, username, email, password, rol, nombre, apellido, activo')
        .eq('email', email)
        .eq('activo', true)
        .single()
      
      if (userError || !userData) {
        console.log('❌ DEBUG AUTH - Usuario no encontrado o error:', userError)
        return { success: false, error: 'Usuario no encontrado o inactivo' }
      }
      
      // Verificar contraseña (en producción esto debería usar hash)
      if (userData.password !== password) {
        console.log('❌ DEBUG AUTH - Contraseña incorrecta')
        return { success: false, error: 'Credenciales incorrectas' }
      }
      
      console.log('✅ DEBUG AUTH - Usuario autenticado correctamente:', userData)
      
      // Establecer el usuario en el estado
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: userData.rol,
        activo: userData.activo,
        isDirectLogin: true // Marcar como login directo (sin Supabase Auth)
      })
      
      // Guardar token simulado para consistencia
      localStorage.setItem('auth_token', `direct_login_${userData.id}_${Date.now()}`)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      console.log('✅ DEBUG AUTH - Login directo completado')
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ DEBUG AUTH - Error en login:', error)
      return { success: false, error: 'Error al conectar con la base de datos: ' + error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG AUTH - Iniciando logout...')
      
      // Limpiar estado de usuario
      setUser(null)
      
      // Limpiar localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('dev_mode')
      localStorage.removeItem('dev_user_type')
      
      // Si hay una sesión de Supabase Auth activa, cerrarla también
      if (supabase?.auth) {
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.log('⚠️ DEBUG AUTH - Error cerrando sesión de Supabase Auth (ignorando):', error)
        }
      }
      
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