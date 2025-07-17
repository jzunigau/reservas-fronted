@echo off
echo ========================================
echo    DESPLIEGUE EN VERCEL
echo    Sistema de Reservas
echo ========================================
echo.

echo [PASO 1/5] Verificando estructura del proyecto...
if not exist "frontend\package.json" (
    echo [ERROR] No se encontró frontend/package.json
    echo [INFO] ¿Necesitas corregir la estructura de carpetas?
    echo [INFO] Ejecuta: move_to_correct_location.bat
    pause
    exit /b 1
)

if not exist "database\setup_supabase.sql" (
    echo [ERROR] No se encontró database/setup_supabase.sql
    echo [INFO] Verifica que todos los archivos estén en el lugar correcto
    pause
    exit /b 1
)

echo [OK] Estructura del proyecto verificada
echo.

echo [PASO 2/5] Verificando Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] No se pudo instalar Vercel CLI
        pause
        exit /b 1
    )
)
echo [OK] Vercel CLI disponible

echo [PASO 3/5] Login en Vercel...
vercel login

echo [PASO 4/5] Desplegando proyecto...
cd frontend
vercel --prod

echo [PASO 5/5] Configurando variables de entorno...
echo.
echo ========================================
echo         CONFIGURACIÓN FINAL
echo ========================================
echo.
echo IMPORTANTE: Ve a tu dashboard de Vercel y configura:
echo.
echo Variables de entorno requeridas:
echo - REACT_APP_SUPABASE_URL = https://tu-proyecto.supabase.co
echo - REACT_APP_SUPABASE_ANON_KEY = tu-anon-key
echo - REACT_APP_API_URL = https://tu-proyecto.supabase.co/rest/v1
echo - NODE_ENV = production
echo.
echo PRÓXIMOS PASOS:
echo 1. Configurar variables en Vercel Dashboard
echo 2. Hacer redeploy después de configurar variables
echo 3. Probar la aplicación con usuarios de prueba
echo.
echo Usuarios de prueba:
echo - Admin: admin@escuela.com / admin123
echo - Profesor: profesor1@escuela.com / admin123
echo.
echo URL de tu proyecto: https://tu-proyecto.vercel.app
echo.
pause 