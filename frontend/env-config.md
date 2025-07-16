# Configuración de Variables de Entorno

## Archivos de Variables de Entorno

### 1. Desarrollo Local (.env.development)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

### 2. Producción (.env.production)
```bash
REACT_APP_API_URL=https://tu-proyecto-vercel.vercel.app/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

### 3. Testing (.env.test)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=test
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

## Variables Disponibles

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL de la API backend | `http://localhost:5000/api` (dev) / `https://tu-proyecto.vercel.app/api` (prod) |
| `REACT_APP_ENVIRONMENT` | Entorno de ejecución | `development`, `production`, `test` |
| `REACT_APP_VERSION` | Versión de la aplicación | `1.0.0` |
| `REACT_APP_DEBUG` | Modo debug | `true` (dev) / `false` (prod) |

## Cómo Crear los Archivos

### En Windows (PowerShell):
```powershell
# Desarrollo
New-Item -Path ".env.development" -ItemType File
Add-Content -Path ".env.development" -Value "REACT_APP_API_URL=http://localhost:5000/api"
Add-Content -Path ".env.development" -Value "REACT_APP_ENVIRONMENT=development"

# Producción
New-Item -Path ".env.production" -ItemType File
Add-Content -Path ".env.production" -Value "REACT_APP_API_URL=https://tu-proyecto-vercel.vercel.app/api"
Add-Content -Path ".env.production" -Value "REACT_APP_ENVIRONMENT=production"
```

### En Linux/Mac:
```bash
# Desarrollo
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.development
echo "REACT_APP_ENVIRONMENT=development" >> .env.development

# Producción
echo "REACT_APP_API_URL=https://tu-proyecto-vercel.vercel.app/api" > .env.production
echo "REACT_APP_ENVIRONMENT=production" >> .env.production
```

## Uso en el Código

```javascript
// En cualquier archivo .js
const API_URL = process.env.REACT_APP_API_URL;
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT;
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

console.log('API URL:', API_URL);
console.log('Environment:', ENVIRONMENT);
console.log('Debug mode:', DEBUG);
```

## Configuración en Vercel

En el dashboard de Vercel, configura estas variables:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `REACT_APP_API_URL` = `https://tu-proyecto-vercel.vercel.app/api`
   - `REACT_APP_ENVIRONMENT` = `production`
   - `REACT_APP_VERSION` = `1.0.0`
   - `REACT_APP_DEBUG` = `false`

## Notas Importantes

- **Prefijo REACT_APP_**: Todas las variables de entorno en React deben comenzar con `REACT_APP_`
- **Reinicio necesario**: Después de cambiar variables de entorno, reinicia el servidor de desarrollo
- **Build time**: Las variables se incluyen en el build, no en runtime
- **Seguridad**: Nunca incluyas secretos en variables de entorno del frontend 