# 🚀 Guía de Deployment - Sistema de Reservas de Laboratorio

## 📋 Pasos para hacer el proyecto visible en la web

### 🗄️ **PASO 1: Configurar Supabase**

#### 1.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Elige tu organización
5. Completa:
   - **Name**: `reservas-laboratorio`
   - **Database Password**: (genera una segura)
   - **Region**: Closest to your users
6. Click "Create new project"
7. ⏰ Espera 2-3 minutos mientras se crea

#### 1.2 Ejecutar script de base de datos
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido completo del archivo `database/setup_supabase.sql`
3. Click en **Run** para ejecutar
4. ✅ Verificar que se crearon las tablas correctamente

#### 1.3 Obtener credenciales
1. Ve a **Settings > API**
2. Copia estos valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Project API keys > anon/public**: `eyJhbGciOiJIUzI1NiIs...`
3. Ve a **Settings > Database**
4. Copia la **Connection string** (URI format)

---

### 🌐 **PASO 2: Configurar Vercel**

#### 2.1 Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta con GitHub
3. Conecta tu repositorio `reservas-fronted`

#### 2.2 Configurar deployment
1. **Import Project** desde GitHub
2. Configurar:
   - **Project Name**: `reservas-laboratorio`
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./` (raíz)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

#### 2.3 Configurar variables de entorno
En **Project Settings > Environment Variables**, agregar:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[proyecto].supabase.co:5432/postgres

# Security
JWT_SECRET=genera-un-secreto-fuerte-de-32-caracteres-minimo

# Environment
NODE_ENV=production
```

#### 2.4 Hacer deploy
1. Click **Deploy**
2. ⏰ Esperar 2-3 minutos
3. ✅ Tu app estará disponible en `https://tu-proyecto.vercel.app`

---

### 🔧 **PASO 3: Configurar el Frontend para Supabase**

Necesitamos actualizar el frontend para usar Supabase directamente:

#### 3.1 Instalar cliente de Supabase
```bash
cd frontend
npm install @supabase/supabase-js
```

#### 3.2 Configurar cliente Supabase
Crear archivo `frontend/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 🧪 **PASO 4: Verificar la instalación**

#### 4.1 Probar credenciales por defecto
- **Admin**: 
  - Email: `admin@escuela.com`
  - Password: `admin123`
- **Profesor**: 
  - Email: `profesor1@escuela.com`
  - Password: `admin123`

#### 4.2 Funcionalidades a probar
1. ✅ Login con admin/profesor
2. ✅ Crear nueva reserva
3. ✅ Ver calendario mensual
4. ✅ Panel de administración (solo admin)
5. ✅ Gestión de usuarios/laboratorios (solo admin)

---

### 📱 **PASO 5: Configuración adicional (Opcional)**

#### 5.1 Dominio personalizado
1. En Vercel: **Project Settings > Domains**
2. Agregar tu dominio personalizado
3. Configurar DNS según instrucciones

#### 5.2 Configurar autenticación social (Opcional)
1. En Supabase: **Authentication > Settings**
2. Habilitar Google/GitHub/etc.
3. Configurar OAuth URLs

#### 5.3 Configurar email templates
1. En Supabase: **Authentication > Email Templates**
2. Personalizar emails de confirmación/reset

---

### 🔒 **PASO 6: Seguridad y optimización**

#### 6.1 Configurar RLS (Row Level Security)
- ✅ Ya configurado en el script SQL
- Usuarios solo ven sus datos
- Admins tienen acceso completo

#### 6.2 Configurar CORS
```javascript
// En Supabase, configurar CORS para tu dominio
const corsOrigins = [
  'https://tu-dominio.vercel.app',
  'http://localhost:3000' // Para desarrollo
]
```

#### 6.3 Backup automático
- ✅ Supabase hace backup automático
- Configurar backup adicional si es crítico

---

### 🚨 **Troubleshooting Common Issues**

#### Build Errors
```bash
# Si hay errores de build, verificar:
cd frontend
npm install
npm run build

# Verificar variables de entorno
echo $REACT_APP_SUPABASE_URL
```

#### Connection Errors
1. Verificar que DATABASE_URL esté correcta
2. Verificar que las tablas existan en Supabase
3. Revisar los logs en Vercel

#### Auth Errors
1. Verificar JWT_SECRET en variables de entorno
2. Verificar que RLS esté configurado correctamente
3. Probar con las credenciales por defecto

---

### 📞 **Soporte y recursos**

- 📚 [Documentación Supabase](https://supabase.com/docs)
- 📚 [Documentación Vercel](https://vercel.com/docs)
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md)
- 📧 Contacto: admin@escuela.com

---

### ✅ **Checklist de deployment**

- [ ] Proyecto creado en Supabase
- [ ] Script SQL ejecutado correctamente
- [ ] Credenciales de Supabase obtenidas
- [ ] Proyecto conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Primer deploy exitoso
- [ ] Login funcionando
- [ ] Creación de reservas funcionando
- [ ] Calendario público visible
- [ ] Panel admin accesible

**¡Tu sistema de reservas ya está ONLINE! 🎉**

URL de la aplicación: `https://tu-proyecto.vercel.app`
