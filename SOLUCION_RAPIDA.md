# 🚨 Solución rápida para errores de configuración

## Problema
Tu aplicación está mostrando errores porque falta la configuración de Supabase.

## ✅ Solución rápida (2 minutos)

### Opción 1: Usar datos de demostración (RECOMENDADO para testing)

1. Abre el archivo `frontend/.env`
2. Reemplaza el contenido con:

```bash
# Configuración temporal para testing
REACT_APP_SUPABASE_URL=https://demo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=demo-key

# URL de la API (para compatibilidad con backend local)
REACT_APP_API_URL=http://localhost:5000/api

# Configuración de entorno
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
NODE_ENV=development

# Configuración adicional
GENERATE_SOURCEMAP=false
```

3. Guarda el archivo
4. Reinicia la aplicación:
   ```bash
   cd frontend
   npm start
   ```

### Opción 2: Configurar Supabase real

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia tu Project URL y API Key
5. Actualiza el archivo `frontend/.env` con tus credenciales reales
6. Ejecuta el script `database/setup_supabase.sql` en tu proyecto

## 🔧 Verificar que funciona

Después de hacer los cambios:
1. La página debería cargar sin errores
2. Verás el mensaje de "Supabase no configurado" en la consola (esto es normal en modo demo)
3. La interfaz funcionará con datos simulados

## 📞 ¿Necesitas ayuda?

Si sigues teniendo problemas:
1. Verifica que el archivo `.env` esté en la carpeta `frontend/`
2. Reinicia completamente la aplicación (Ctrl+C y npm start)
3. Revisa la consola del navegador para mensajes de ayuda

## 🚀 Para producción

Para poner la aplicación en línea:
1. Sigue la guía completa en `database/DEPLOYMENT_GUIDE.md`
2. Configura Supabase real
3. Sube a Vercel o tu plataforma preferida
