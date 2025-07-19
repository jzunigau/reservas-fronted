// Configuración de emergencia para producción
// Este archivo se asegura de que las variables estén disponibles

// Debug: Mostrar todas las variables de entorno disponibles
console.log('🔍 DEBUG - Variables de entorno disponibles:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('- REACT_APP_SUPABASE_ANON_KEY disponible:', !!process.env.REACT_APP_SUPABASE_ANON_KEY)
console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL)
console.log('- Todas las variables REACT_APP_:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')))

const config = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'https://trnyhqywpioomkdhgugb.supabase.co',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybnlocXl3cGlvb21rZGhndWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ3MTAsImV4cCI6MjA2ODA0MDcxMH0.CxYnD2n4FH37lESyI2Wn3X4En9vNv9yMjzE_GHf1gk4',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
}

// Debug: Mostrar configuración final
console.log('🔧 DEBUG - Configuración final:')
console.log('- supabaseUrl:', config.supabaseUrl)
console.log('- supabaseAnonKey disponible:', !!config.supabaseAnonKey)
console.log('- apiUrl:', config.apiUrl)

// Validación en tiempo de ejecución
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('🚨 ERROR: Variables de entorno de Supabase no encontradas')
  console.log('Variables actuales:', {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? '[DEFINIDA]' : 'UNDEFINED'
  })
} else {
  console.log('✅ DEBUG - Variables de Supabase cargadas correctamente')
}

export default config
