# 🚀 Configuración de Producción - Sistema de Reservas

## 📋 Requisitos Previos

- Node.js 16+ instalado
- Cuenta en Vercel
- Cuenta en Supabase
- Git configurado

## 🔧 Configuración Local para Producción

### 1. Variables de Entorno

Crea un archivo `.env.production` en la raíz del proyecto:

```bash
REACT_APP_API_URL=https://tu-proyecto-vercel.vercel.app/api
REACT_APP_ENVIRONMENT=production
```

### 2. Build de Producción

```bash
# Instalar dependencias
npm install

# Crear build optimizada
npm run build

# Servir localmente para pruebas
npm run serve
```

### 3. Scripts Disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run serve` - Servir build en puerto 3000
- `npm run serve:prod` - Servir build en puerto 8080

## 🌐 Despliegue en Vercel

### 1. Preparar el Proyecto

```bash
# Asegúrate de estar en el directorio frontend
cd frontend

# Verificar que el build funciona
npm run build
```

### 2. Desplegar en Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel --prod
```

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel:
1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega:
   - `REACT_APP_API_URL` = `https://tu-proyecto-vercel.vercel.app/api`

## 🗄️ Configuración de Base de Datos

### 1. Supabase

1. Crea un nuevo proyecto en Supabase
2. Ejecuta el script SQL en `database/schema.sql`
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 2. Variables de Entorno del Backend

En Vercel, configura estas variables para las funciones API:

```bash
DATABASE_URL=postgresql://usuario:password@host:puerto/database
JWT_SECRET=tu_jwt_secret_muy_seguro
NODE_ENV=production
```

## 🔐 Configuración de Autenticación

### 1. Crear Usuario Admin

```sql
-- Conectar a tu base de datos Supabase
INSERT INTO usuarios (username, email, password, rol, nombre, apellido)
VALUES (
  'admin',
  'admin@escuela.com',
  '$2b$10$...', -- Hash bcrypt de tu contraseña
  'admin',
  'Administrador',
  'Sistema'
);
```

### 2. Generar Hash de Contraseña

```bash
# Usar bcrypt para generar hash
node -e "console.log(require('bcrypt').hashSync('tu_contraseña', 10))"
```

## 📱 URLs de Producción

Una vez desplegado:

- **Frontend**: `https://tu-proyecto-vercel.vercel.app`
- **API**: `https://tu-proyecto-vercel.vercel.app/api`
- **Login**: `https://tu-proyecto-vercel.vercel.app/login`
- **Admin**: `https://tu-proyecto-vercel.vercel.app/admin`

## 🛠️ Troubleshooting

### Error: API no responde
- Verificar variables de entorno en Vercel
- Revisar logs en Vercel Dashboard
- Verificar conexión a Supabase

### Error: Build falla
- Verificar que todas las dependencias estén instaladas
- Revisar errores de ESLint
- Verificar que no haya imports faltantes

### Error: Base de datos no conecta
- Verificar `DATABASE_URL` en Vercel
- Revisar configuración de Supabase
- Verificar que las tablas existan

## 📊 Monitoreo

### Logs de Vercel
```bash
# Ver logs en tiempo real
vercel logs --follow
```

### Métricas
- Revisar Analytics en Vercel Dashboard
- Monitorear errores en Function Logs
- Verificar rendimiento en Speed Insights

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# Hacer cambios en el código
git add .
git commit -m "Actualización"
git push

# Vercel se actualiza automáticamente
# O manualmente:
vercel --prod
```

## 📞 Soporte

- **Documentación**: README.md
- **Issues**: GitHub Issues
- **Logs**: Vercel Dashboard → Functions → Logs 