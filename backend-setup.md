# Configuración del Backend

## 📋 Pasos para configurar el backend

### 1. Crear proyecto en Supabase
- Ve a [supabase.com](https://supabase.com)
- Crea una nueva organización
- Crea un nuevo proyecto
- Guarda las credenciales de conexión

### 2. Configurar base de datos
**IMPORTANTE**: Usa el script completo `database/setup_supabase.sql` para crear todas las tablas, índices y configuraciones necesarias.

El script incluye:
- ✅ Tabla de usuarios con índices optimizados
- ✅ Tabla de laboratorios con datos predeterminados
- ✅ Tabla de reservas con constraints y validaciones
- ✅ Row Level Security (RLS) configurado
- ✅ Triggers automáticos para updated_at
- ✅ Vistas para consultas optimizadas
- ✅ Usuarios de prueba predeterminados

### 3. Variables de entorno para Vercel
En el dashboard de Vercel, configura estas variables:

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[proyecto].supabase.co:5432/postgres

# Security
JWT_SECRET=tu_jwt_secret_muy_seguro_32_caracteres_minimo
NODE_ENV=production

# Optional
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://tu-dominio.vercel.app
```

### 4. Usuarios predeterminados
El script SQL ya incluye estos usuarios de prueba:

**Administrador:**
- Email: `admin@escuela.com`
- Password: `admin123`
- Rol: `admin`

**Profesores:**
- Email: `profesor1@escuela.com` / Password: `admin123`
- Email: `profesor2@escuela.com` / Password: `admin123`
- Rol: `profesor`

### 5. Despliegue automatizado
Para hacer deploy automático, usa:

```bash
# Opción 1: Script de Windows
.\deploy_vercel.bat

# Opción 2: Comando manual
vercel --prod
```

## 🔗 Enlaces útiles
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Bcrypt Generator](https://bcrypt-generator.com/)

## 📞 Soporte
- Documentación: README_PRODUCTION.md
- Variables de entorno: env-config.md 