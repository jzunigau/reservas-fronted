# 🏫 Sistema de Reservas de Laboratorio Escolar

Sistema completo para gestión de reservas de laboratorios escolares con autenticación de usuarios, roles diferenciados y base de datos en la nube.

## 📋 Descripción General

Este proyecto permite a profesores reservar laboratorios escolares de manera eficiente, con un panel administrativo para gestión completa del sistema. Incluye calendario público, autenticación segura y almacenamiento en Supabase.

### ✨ Características Principales

- **🔐 Autenticación Segura**: Login diferenciado para admin y profesores
- **📅 Calendario Público**: Vista de disponibilidad en tiempo real
- **👥 Gestión de Roles**: Administradores y profesores con permisos específicos
- **🏢 Multi-laboratorio**: Soporte para múltiples espacios
- **📱 Responsive**: Optimizado para móvil y desktop
- **☁️ Cloud Ready**: Base de datos en Supabase, deploy en Vercel
- **🔄 Tiempo Real**: Actualizaciones automáticas de disponibilidad

## 🚀 Inicio Rápido

### ⚠️ **Si el script se cuelga o tienes problemas:**
```bash
# Diagnóstico completo del sistema
diagnose.bat

# Verificación de rutas después de corrección
verify_paths.bat

# Instalación rápida y simple
quick_install.bat
```

### ⚠️ **Corrección de Estructura de Carpetas**
Si clonaste el proyecto y se creó una carpeta anidada `reservas-fronted/reservas-fronted/`, ejecuta:
```bash
# Corregir estructura automáticamente
move_to_correct_location.bat

# O diagnóstico completo que detecta el problema
diagnose.bat
```

### Opción 1: Instalación Rápida (Recomendada)
```bash
# Instalación simple sin colgarse
quick_install.bat

# Verificar que todo esté bien
diagnose.bat
```

### Opción 2: Instalación Completa Avanzada
```bash
# Instalación completa con todas las verificaciones
setup_complete.bat

# Si hay problemas, usar la rápida:
quick_install.bat
```

### Opción 3: Instalación Manual
```bash
# 1. Corregir estructura (si es necesario)
move_to_correct_location.bat

# 2. Instalar dependencias
cd frontend
npm install

# 3. Configurar entorno
cp .env.example .env.local
# Editar .env.local con credenciales de Supabase

# 4. Configurar base de datos
# Ejecutar database/setup_supabase.sql en Supabase

# 5. Iniciar desarrollo
npm start
```

## 🧪 Datos de Prueba

### Usuarios Pre-configurados
```sql
-- Administrador
Email: admin@escuela.com
Password: admin123

-- Profesor de prueba
Email: profesor1@escuela.com  
Password: admin123
```

## 🏗️ Arquitectura del Sistema

```
Sistema de Reservas
├── Frontend (React)
│   ├── Autenticación (Supabase Auth)
│   ├── Interfaz de Usuario (Bootstrap + CSS)
│   ├── Gestión de Estado (Context API)
│   └── Servicios (API Supabase)
├── Backend (Supabase)
│   ├── Base de Datos (PostgreSQL)
│   ├── Autenticación (JWT + RLS)
│   ├── API REST (Auto-generada)
│   └── Políticas de Seguridad
└── Deploy (Vercel)
    ├── Frontend Estático
    ├── Variables de Entorno
    └── CI/CD Automático
```

## 🗄️ Estructura de la Base de Datos

### Tabla `usuarios`
```sql
- id (uuid, PK)
- email (text, unique)
- nombre_completo (text)
- rol (admin|profesor)
- activo (boolean)
- created_at (timestamp)
```

### Tabla `laboratorios`
```sql
- id (uuid, PK)
- nombre (text)
- capacidad (integer)
- equipamiento (text[])
- activo (boolean)
- created_at (timestamp)
```

### Tabla `reservas`
```sql
- id (uuid, PK)
- usuario_id (uuid, FK)
- laboratorio_id (uuid, FK)
- fecha_inicio (timestamp)
- fecha_fin (timestamp)
- asignatura (text)
- descripcion (text)
- estado (pendiente|confirmada|cancelada)
- created_at (timestamp)
```

## 👤 Roles y Permisos

### 🔧 Administrador
- ✅ Gestión completa de usuarios
- ✅ CRUD de laboratorios
- ✅ Ver/modificar todas las reservas
- ✅ Estadísticas del sistema
- ✅ Configuración global

### 👨‍🏫 Profesor
- ✅ Crear reservas propias
- ✅ Ver/modificar sus reservas
- ✅ Calendario público
- ✅ Dashboard personal
- ❌ Gestión de otros usuarios

### 👁️ Público (Sin autenticación)
- ✅ Ver calendario público
- ❌ Crear reservas
- ❌ Ver detalles privados

## 📁 Estructura del Proyecto

```
reservas-fronted/
├── 📄 README.md                    # Este archivo
├── 🔧 package.json                 # Configuración principal
├── ⚙️ vercel.json                  # Configuración Vercel
├── 🚀 deploy_vercel.bat           # Script de deploy
├── 📦 install_frontend.bat        # Instalador automático
├── 🔍 check_system.bat           # Verificador sistema
├── 🗃️ database/
│   └── setup_supabase.sql         # Script completo DB
├── 🎨 frontend/                    # Aplicación React
│   ├── 📋 README_FRONTEND.md      # Docs específicos
│   ├── ⚙️ package.json           # Dependencias frontend
│   ├── 🔧 .env.example           # Variables de entorno
│   ├── 🌐 public/               # Archivos públicos
│   └── 💻 src/                   # Código fuente
│       ├── 📱 components/       # Componentes React
│       ├── ⚙️ config/           # Configuraciones
│       ├── 🔄 context/          # Context API
│       ├── 📄 pages/            # Páginas principales
│       ├── 🎨 styles/           # Estilos CSS
│       └── 🛠️ utils/           # Utilidades
└── 📚 docs/                      # Documentación adicional
```

## 🔧 Configuración Detallada

### Variables de Entorno Requeridas
```env
# Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1

# Desarrollo
NODE_ENV=development
REACT_APP_DEBUG=true
```

## 🚀 Despliegue

### Deploy Automático a Vercel
```bash
# Ejecutar script de deploy
deploy_vercel.bat

# O manualmente
vercel --prod
```

## 🔍 Debugging y Troubleshooting

### Problemas Comunes

1. **Error: "Cannot find module '@supabase/supabase-js'"**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Error: "Missing environment variables"**
   - Verificar `.env.local` existe
   - Confirmar todas las variables están configuradas
   - Reiniciar servidor desarrollo

3. **Error: "Authentication required"**
   - Verificar credenciales Supabase
   - Comprobar RLS configurado
   - Revisar políticas de seguridad

### Herramientas de Debug
```bash
# Verificar sistema completo
check_system.bat

# Ver logs en tiempo real
npm start # Frontend logs
```

---

**Desarrollado con ❤️ para mejorar la educación** 🎓

---

### Quick Links
- [🚀 Instalación Rápida](#inicio-rápido)
- [📁 Estructura Proyecto](#estructura-del-proyecto)
- [🔧 Configuración](#configuración-detallada)
- [🚀 Deploy](#despliegue)
- [🐛 Troubleshooting](#debugging-y-troubleshooting)

1. **Click en el botón "Deploy with Vercel"** ⬆️
2. **Crea proyecto en Supabase** → [supabase.com](https://supabase.com)
3. **Ejecuta el script SQL** → Copia `/database/setup_supabase.sql` en Supabase SQL Editor
4. **Configura variables de entorno** en Vercel (ver sección abajo)
5. **¡Listo!** Tu app estará online 🎉

### 🔧 **Variables de entorno requeridas**

En Vercel Project Settings → Environment Variables:

```bash
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres:[password]@db.[proyecto].supabase.co:5432/postgres
JWT_SECRET=tu-secreto-jwt-de-32-caracteres-minimo
NODE_ENV=production
```

---

## 📋 **Características principales**

### ✨ **Para Profesores**
- 📅 **Reservar laboratorios** con interfaz visual semanal
- 🔍 **Ver disponibilidad** en tiempo real
- 📊 **Calendario mensual** para consultar reservas
- 👤 **Gestión de perfil** personal

### 🛠️ **Para Administradores**
- 👥 **Gestión de usuarios** (profesores y admins)
- 🏢 **Gestión de laboratorios** (crear, editar, eliminar)
- 📈 **Dashboard con estadísticas** del sistema
- 🎛️ **Control total** sobre todas las reservas

### 🎯 **Funcionalidades técnicas**
- 🔐 **Autenticación segura** con roles
- 📱 **Responsive design** para móvil y desktop
- ⚡ **Tiempo real** - actualizaciones instantáneas
- 🔄 **Offline support** con localStorage fallback
- 🔒 **Row Level Security** en base de datos

---

## 🏗️ **Arquitectura del proyecto**

```
📁 reservas-fronted/
├── 📄 ANALISIS_PROYECTO.md          # Análisis completo del sistema
├── 📁 database/                     # Scripts y configuración de DB
│   ├── 🗃️ setup_supabase.sql       # Script completo de Supabase
│   ├── 📋 DEPLOYMENT_GUIDE.md      # Guía paso a paso
│   └── ⚙️ env-template.env         # Template de variables
├── 📁 frontend/                     # Frontend React
│   ├── 📁 src/
│   │   ├── ⚙️ config/supabase.js   # Cliente Supabase
│   │   ├── 📁 pages/               # Páginas principales
│   │   ├── 📁 components/          # Componentes reutilizables
│   │   └── 📁 utils/               # Servicios y utilidades
│   └── 📦 package.json
└── 📁 api/                          # Backend Express (opcional)
```

---

## 🎨 **Capturas de pantalla**

### 📅 Interfaz de reservas
![Interfaz de reservas](docs/screenshots/reservas.png)

### 📊 Dashboard administrativo  
![Dashboard admin](docs/screenshots/admin.png)

### 📱 Vista móvil
![Vista móvil](docs/screenshots/mobile.png)

---

## 🏃‍♂️ **Desarrollo local**

### 📋 **Prerequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

### ⚙️ **Instalación**

```bash
# Clonar repositorio
git clone https://github.com/jzunigau/reservas-fronted.git
cd reservas-fronted

# Instalar dependencias del frontend
cd frontend
npm install

# Crear archivo de configuración
cp ../database/env-template.env .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar desarrollo
npm start
```

### 🗄️ **Configurar base de datos**
1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar el contenido de `database/setup_supabase.sql`
3. Ejecutar en Supabase SQL Editor
4. Configurar variables de entorno

---

## 🧪 **Credenciales de prueba**

Una vez desplegado, puedes usar estas credenciales:

**👨‍💼 Administrador:**
- Email: `admin@escuela.com`
- Password: `admin123`

**👨‍🏫 Profesor:**
- Email: `profesor1@escuela.com`
- Password: `admin123`

---

## 📚 **Documentación adicional**

- 📖 [Guía completa de deployment](database/DEPLOYMENT_GUIDE.md)
- 🔍 [Análisis técnico del proyecto](ANALISIS_PROYECTO.md)
- ⚙️ [Configuración de backend](backend-setup.md)
- 🚨 [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas!

1. 🍴 Fork el proyecto
2. 🌿 Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. 💾 Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. 📤 Push a la rama: `git push origin feature/nueva-funcionalidad`
5. 🔄 Abre un Pull Request

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 🆘 **Soporte**

- 📧 **Email**: admin@escuela.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/jzunigau/reservas-fronted/issues)
- 📚 **Wiki**: [Documentación completa](https://github.com/jzunigau/reservas-fronted/wiki)

---

## 🎯 **Roadmap**

### ✅ **Completado**
- ✅ Sistema básico de reservas
- ✅ Autenticación y roles
- ✅ Panel administrativo
- ✅ Interfaz responsive
- ✅ Deploy automatizado

### 🔄 **En desarrollo**
- 🔄 Notificaciones push
- 🔄 Exportación de reportes
- 🔄 Integración con Google Calendar
- 🔄 App móvil nativa

### 🔮 **Futuro**
- 🔮 Multi-tenancy
- 🔮 API pública
- 🔮 Plugins y extensiones
- 🔮 Analytics avanzados

---

## ⭐ **¿Te gusta el proyecto?**

¡Dale una estrella ⭐ al repositorio para apoyar el desarrollo!

[![GitHub stars](https://img.shields.io/github/stars/jzunigau/reservas-fronted?style=social)](https://github.com/jzunigau/reservas-fronted/stargazers)

---

**Desarrollado con ❤️ para la educación**

*Sistema de Reservas de Laboratorio Escolar - 2025*
