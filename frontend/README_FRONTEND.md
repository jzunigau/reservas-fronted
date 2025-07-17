# Frontend - Sistema de Reservas de Laboratorio

Frontend React para el sistema de reservas de laboratorios escolares, integrado con Supabase.

## 🚀 Instalación Rápida

### Prerequisitos
- Node.js 18+
- npm o yarn
- Proyecto creado en Supabase

### Configuración

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
nano .env.local
```

3. **Variables requeridas en .env.local**
```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
NODE_ENV=development
```

4. **Ejecutar en desarrollo**
```bash
npm start
```

## 🗄️ Configuración de Supabase

### 1. Crear proyecto en Supabase
- Ve a [supabase.com](https://supabase.com)
- Crea un nuevo proyecto
- Anota las credenciales

### 2. Ejecutar script de base de datos
- En Supabase SQL Editor
- Ejecutar `/database/setup_supabase.sql`

### 3. Obtener credenciales
- **Settings > API**: Project URL y anon key
- **Settings > Database**: Connection string

## 🧪 Credenciales de Prueba

Una vez configurada la base de datos:

**Administrador:**
- Email: `admin@escuela.com`
- Password: `admin123`

**Profesor:**
- Email: `profesor1@escuela.com`
- Password: `admin123`

## 📁 Estructura del Frontend

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Loading.js       # Componente de carga
│   │   ├── Navbar.js        # Barra de navegación
│   │   └── ProtectedRoute.js # Rutas protegidas
│   ├── config/              # Configuraciones
│   │   └── supabase.js      # Cliente Supabase
│   ├── context/             # Context API
│   │   └── AuthContext.js   # Contexto de autenticación
│   ├── pages/               # Páginas principales
│   │   ├── AdminPage.js     # Panel administración
│   │   ├── CalendarioPage.js # Calendario público
│   │   ├── DashboardPage.js # Dashboard principal
│   │   ├── LoginPage.js     # Página de login
│   │   └── ReservasPage.js  # Gestión de reservas
│   ├── styles/              # Estilos CSS
│   │   └── main.css
│   ├── utils/               # Utilidades
│   │   ├── reservasService.js # Servicio de reservas
│   │   └── reservasStorage.js # Almacenamiento local
│   ├── App.js               # Componente principal
│   └── index.js             # Punto de entrada
├── .env.example             # Ejemplo de variables
├── package.json             # Dependencias
└── README.md               # Esta documentación
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                    # Inicia servidor desarrollo (puerto 3000)

# Producción
npm run build               # Construye para producción
npm run serve               # Sirve build local (puerto 3000)
npm run serve:prod          # Sirve build local (puerto 8080)

# Calidad de código
npm run lint                # Ejecuta ESLint
npm run lint:fix            # Corrige errores de ESLint automáticamente

# Testing
npm test                    # Ejecuta pruebas
```

## 🌐 Integración con Supabase

### Autenticación
- Login/logout con Supabase Auth
- Gestión de roles (admin/profesor)
- Sesión persistente

### Base de Datos
- CRUD completo de reservas
- Gestión de laboratorios
- Consultas optimizadas
- Row Level Security habilitado

### Funcionalidades Tiempo Real (Futuro)
- Actualizaciones automáticas de reservas
- Notificaciones en vivo
- Chat entre usuarios

## 🎯 Funcionalidades Principales

### Para Todos los Usuarios
- ✅ Ver calendario público de reservas
- ✅ Interfaz responsive para móvil/desktop

### Para Profesores
- ✅ Crear nuevas reservas
- ✅ Ver sus propias reservas
- ✅ Cancelar/modificar reservas propias
- ✅ Dashboard con estadísticas

### Para Administradores
- ✅ Todas las funciones de profesor +
- ✅ Gestión completa de usuarios
- ✅ Gestión de laboratorios
- ✅ Ver/modificar todas las reservas
- ✅ Estadísticas completas del sistema

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales
```env
# Configuración de desarrollo
REACT_APP_DEBUG=true
REACT_APP_VERSION=1.0.0

# Configuración de API
REACT_APP_API_TIMEOUT=10000
REACT_APP_RETRY_ATTEMPTS=3

# Configuración de caché
REACT_APP_CACHE_ENABLED=true
REACT_APP_CACHE_DURATION=300000
```

### Personalización de Estilos
- Editar `/src/styles/main.css`
- Modificar colores en `/src/config/theme.js`
- Personalizar Bootstrap variables

### Desarrollo Local con Supabase Local
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto local
supabase init

# Iniciar servicios locales
supabase start

# Aplicar migraciones
supabase db reset
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configurar variables de entorno en dashboard
```

### Netlify
```bash
# Build para producción
npm run build

# Subir carpeta build/ a Netlify
```

### Hosting Manual
```bash
# Build
npm run build

# Servir archivos estáticos de build/
# Configurar servidor para SPA (redirect /* -> index.html)
```

## 📊 Performance

### Optimizaciones Implementadas
- ✅ Lazy loading de componentes
- ✅ Memoización de consultas
- ✅ Caché de respuestas API
- ✅ Compresión de assets
- ✅ Tree shaking automático

### Métricas Objetivo
- First Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB

## 🐛 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "Missing environment variables"
- Verificar que `.env.local` existe
- Confirmar que todas las variables están configuradas
- Reiniciar servidor de desarrollo

### Error: "Authentication required"
- Verificar credenciales en Supabase
- Comprobar que RLS está configurado
- Revisar políticas de seguridad

### Error: "Database connection failed"
- Verificar URL de Supabase
- Confirmar que proyecto está activo
- Revisar logs en Supabase dashboard

## 📧 Soporte

- 🐛 Issues: [GitHub Issues](https://github.com/jzunigau/reservas-fronted/issues)
- 📚 Docs: [Wiki del proyecto](https://github.com/jzunigau/reservas-fronted/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/jzunigau/reservas-fronted/discussions)

---

**Desarrollado con ❤️ para la educación** 🎓
