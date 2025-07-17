# INSTRUCCIONES PARA CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## 🔧 Variables Requeridas

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

### Variables de Supabase:
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Cómo obtener estas variables:

1. Ve a tu proyecto en Supabase (https://supabase.com/dashboard)
2. Click en Settings → API  
3. Copia los valores:
   - URL → usar como REACT_APP_SUPABASE_URL
   - anon public → usar como REACT_APP_SUPABASE_ANON_KEY

### Variables adicionales (opcionales):
NODE_ENV=production
REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
GENERATE_SOURCEMAP=false
CI=false

## 🗄️ Base de Datos

IMPORTANTE: También debes ejecutar el script SQL en Supabase:

1. Ve a tu proyecto Supabase → SQL Editor
2. Copia y pega todo el contenido de database/setup_supabase.sql
3. Ejecuta el script

## 👤 Usuarios de Prueba

Después de ejecutar el script SQL, puedes usar:
- Admin: admin@escuela.com / admin123
- Profesor: profesor1@escuela.com / admin123
