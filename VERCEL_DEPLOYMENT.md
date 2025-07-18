# 🚀 Guía de Deployment en Vercel

## ⚠️ CONFIGURACIÓN IMPORTANTE

El proyecto tiene una estructura monorepo, por lo que requiere configuración específica en Vercel.

## 📋 Pasos para Deployment

### 1. Configuración en Vercel Dashboard:

Cuando importes el proyecto desde GitHub, configura:

```
✅ Root Directory: frontend
✅ Framework Preset: Create React App  
✅ Build Command: npm run build
✅ Output Directory: build
✅ Install Command: npm install
```

### 2. Variables de Entorno:

En Vercel Dashboard > Settings > Environment Variables, agregar:

```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase_aqui
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase_aqui
```

### 3. Obtener Credenciales de Supabase:

1. Ve a [supabase.com](https://supabase.com)
2. Crea/accede a tu proyecto
3. Ve a Settings > API
4. Copia:
   - **Project URL** → REACT_APP_SUPABASE_URL
   - **anon/public key** → REACT_APP_SUPABASE_ANON_KEY

### 4. Setup de Base de Datos:

1. En Supabase Dashboard > SQL Editor
2. Copia y pega el contenido completo de `database/setup_supabase.sql`
3. Ejecuta el script (creará todas las tablas, usuarios y datos de ejemplo)

### 5. Re-deploy:

Después de configurar las variables de entorno, haz un re-deploy:
- Ve a Deployments en Vercel
- Busca el último deployment
- Click en "Redeploy"

## 🔧 Solución de Problemas

### Error 126 (Permission Denied):
- ✅ **RESUELTO**: Configurar Root Directory como "frontend"

### Build Exitoso pero Errores en Runtime:
- Verificar que las variables de entorno estén configuradas
- Comprobar que la base de datos esté inicializada

## 📱 Credenciales de Testing

Una vez deployado, puedes probar con:

```
Usuario: admin@escuela.com
Contraseña: admin123
Rol: Administrador
```

```
Usuario: profesor1@escuela.com  
Contraseña: admin123
Rol: Profesor
```

## 🎯 URL Final

Tu aplicación estará disponible en:
`https://tu-proyecto-name.vercel.app`

---

💡 **Nota**: Este proyecto usa Supabase como backend, por lo que no necesitas configurar API Routes en Vercel.
