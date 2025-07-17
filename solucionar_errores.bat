@echo off
echo ================================================
echo 🔧 SOLUCIONANDO ERRORES DE CONFIGURACION
echo ================================================
echo.
echo Este script solucionara los errores de configuracion de Supabase
echo.

set ENV_FILE=frontend\.env

echo 📝 Creando archivo de configuracion temporal...

echo # Configuracion temporal para testing > %ENV_FILE%
echo REACT_APP_SUPABASE_URL=https://demo.supabase.co >> %ENV_FILE%
echo REACT_APP_SUPABASE_ANON_KEY=demo-key >> %ENV_FILE%
echo. >> %ENV_FILE%
echo # URL de la API (para compatibilidad con backend local) >> %ENV_FILE%
echo REACT_APP_API_URL=http://localhost:5000/api >> %ENV_FILE%
echo. >> %ENV_FILE%
echo # Configuracion de entorno >> %ENV_FILE%
echo REACT_APP_ENVIRONMENT=development >> %ENV_FILE%
echo REACT_APP_VERSION=1.0.0 >> %ENV_FILE%
echo NODE_ENV=development >> %ENV_FILE%
echo. >> %ENV_FILE%
echo # Configuracion adicional >> %ENV_FILE%
echo GENERATE_SOURCEMAP=false >> %ENV_FILE%

echo ✅ Archivo .env configurado correctamente
echo.
echo 🚀 Iniciando la aplicacion...
echo.
echo ⚠️  NOTA: Verás mensajes de "Supabase no configurado" en la consola.
echo    Esto es normal en modo demo. La aplicacion funcionara con datos simulados.
echo.

cd frontend
npm start

pause
