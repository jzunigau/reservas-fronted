// Configuración de emergencia para producción
// Este archivo se asegura de que las variables estén disponibles

const config = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'https://frnyhgywpoomkdhguph.supabase.co',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybnlocXl3cGlvb21rZGhndWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ3MTAsImV4cCI6MjA2ODA0MDcxMH0.CxYnD2n4FH37lESyI2Wn3X4En9vNv9yMjzE_GHf1gk4',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
}

// Validación en tiempo de ejecución
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('🚨 ERROR: Variables de entorno de Supabase no encontradas')
  console.log('Variables actuales:', {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? '[DEFINIDA]' : 'UNDEFINED'
  })
}

export default config
