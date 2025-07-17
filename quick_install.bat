@echo off
echo =======================================
echo    INSTALACIÓN RÁPIDA Y SEGURA
echo    Sistema de Reservas
echo =======================================
echo.

:: Script simple sin colgarse
echo [INFO] Iniciando instalación rápida...
echo.

:: Paso 1: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no instalado. Descarga desde: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js detectado

:: Paso 2: Verificar estructura
echo [2/4] Verificando estructura...
if not exist "frontend\package.json" (
    echo [ERROR] frontend/package.json no encontrado
    if exist "reservas-fronted\frontend\package.json" (
        echo [INFO] Detectada estructura anidada. Ejecuta: move_to_correct_location.bat
    )
    pause
    exit /b 1
)
echo [OK] Estructura correcta

:: Paso 3: Instalar dependencias
echo [3/4] Instalando dependencias...
cd frontend
echo [INFO] Esto puede tomar unos minutos...
npm install --silent
if %errorlevel% neq 0 (
    echo [WARNING] Problemas con instalación silenciosa, intentando normal...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Falló la instalación
        pause
        exit /b 1
    )
)
echo [OK] Dependencias instaladas

:: Paso 4: Configurar entorno
echo [4/4] Configurando entorno...
if not exist ".env.local" (
    (
        echo REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
        echo REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
        echo REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
        echo NODE_ENV=development
    ) > .env.local
    echo [OK] .env.local creado
) else (
    echo [OK] .env.local ya existe
)

cd ..

echo.
echo =======================================
echo       INSTALACIÓN COMPLETADA ✅
echo =======================================
echo.
echo PRÓXIMOS PASOS:
echo 1. Configurar Supabase (ver README.md)
echo 2. Editar frontend/.env.local
echo 3. Ejecutar: cd frontend && npm start
echo.
echo SCRIPTS DISPONIBLES:
echo - check_system.bat (verificar estado)
echo - deploy_vercel.bat (desplegar)
echo.
pause
