// Configuración del cliente Supabase para el frontend
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

let supabase

// Validar variables de entorno con mensaje de ayuda
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`
🚨 ERROR: Variables de entorno de Supabase no encontradas!

Para solucionar este problema:

1. Asegúrate de tener un archivo .env en la carpeta frontend/ 
2. Agrega las siguientes variables:

REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-publica

3. Obtén estos valores desde tu dashboard de Supabase en:
   - Settings > API > Project URL
   - Settings > API > Project API keys > anon/public

4. Si no tienes un proyecto de Supabase, crea uno en https://supabase.com
5. Luego ejecuta el script database/setup_supabase.sql en el SQL Editor

Valores actuales:
- REACT_APP_SUPABASE_URL: ${supabaseUrl || 'UNDEFINED'}
- REACT_APP_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[DEFINIDA]' : 'UNDEFINED'}
  `)
  
  // Crear cliente dummy para development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export { supabase }

// Configuración de la base de datos
export const DB_TABLES = {
  USUARIOS: 'usuarios',
  LABORATORIOS: 'laboratorios', 
  RESERVAS: 'reservas'
}

// Configuración de roles
export const USER_ROLES = {
  ADMIN: 'admin',
  PROFESOR: 'profesor'
}

// Configuración de estados de reserva
export const RESERVATION_STATES = {
  CONFIRMADA: 'confirmada',
  PENDIENTE: 'pendiente',
  CANCELADA: 'cancelada'
}

// Helper functions para autenticación
export const auth = {
  // Iniciar sesión
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Registrar usuario
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  // Cerrar sesión
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obtener usuario actual
  getCurrentUser: () => supabase.auth.getUser(),

  // Obtener sesión actual
  getSession: () => supabase.auth.getSession(),

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
}

// Helper functions para base de datos
export const db = {
  // Obtener todas las reservas
  getReservations: async () => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .select(`
        *,
        usuario:usuarios(nombre, apellido, email),
        laboratorio_data:laboratorios(nombre, capacidad, ubicacion)
      `)
      .eq('estado', RESERVATION_STATES.CONFIRMADA)
      .order('fecha', { ascending: true })
    
    return { data, error }
  },

  // Obtener reservas por fecha
  getReservationsByDate: async (fecha) => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .select('*')
      .eq('fecha', fecha)
      .in('estado', [RESERVATION_STATES.CONFIRMADA, RESERVATION_STATES.PENDIENTE])
      .order('bloque', { ascending: true })
    
    return { data, error }
  },

  // Crear nueva reserva
  createReservation: async (reservation) => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .insert([reservation])
      .select()
    
    return { data, error }
  },

  // Verificar disponibilidad
  checkAvailability: async (fecha, bloque, subBloque, diaSemana) => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .select('id')
      .eq('fecha', fecha)
      .eq('bloque', bloque)
      .eq('sub_bloque', subBloque)
      .eq('dia_semana', diaSemana)
      .in('estado', [RESERVATION_STATES.CONFIRMADA, RESERVATION_STATES.PENDIENTE])
    
    return { 
      available: error ? false : data.length === 0, 
      error 
    }
  },

  // Obtener laboratorios
  getLaboratories: async () => {
    const { data, error } = await supabase
      .from(DB_TABLES.LABORATORIOS)
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    
    return { data, error }
  },

  // Obtener usuarios
  getUsers: async () => {
    const { data, error } = await supabase
      .from(DB_TABLES.USUARIOS)
      .select('id, username, email, rol, nombre, apellido, activo, created_at')
      .order('nombre', { ascending: true })
    
    return { data, error }
  },

  // Actualizar reserva
  updateReservation: async (id, updates) => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  // Eliminar reserva (cambiar estado a cancelada)
  cancelReservation: async (id) => {
    const { data, error } = await supabase
      .from(DB_TABLES.RESERVAS)
      .update({ estado: RESERVATION_STATES.CANCELADA })
      .eq('id', id)
      .select()
    
    return { data, error }
  }
}

// Funciones de utilidad
export const utils = {
  // Formatear fecha para Supabase
  formatDate: (date) => {
    if (typeof date === 'string') return date
    return date.toISOString().split('T')[0]
  },

  // Obtener día de la semana en español
  getDayName: (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayIndex = new Date(date).getDay()
    return days[dayIndex]
  },

  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Generar ID único
  generateId: () => Date.now().toString(),

  // Verificar si es horario laboral
  isWorkingDay: (date) => {
    const dayOfWeek = new Date(date).getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5 // Lunes a Viernes
  }
}

export default supabase
