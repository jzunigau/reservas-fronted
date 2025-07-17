@echo off
echo =======================================
echo    INSTALACION AUTOMATICA - FRONTEND
echo    Sistema de Reservas de Laboratorio
echo =======================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

:: Mostrar versión de Node.js
echo [INFO] Node.js detectado:
node --version
npm --version
echo.

:: Cambiar al directorio frontend
cd /d "%~dp0frontend"
if %errorlevel% neq 0 (
    echo [ERROR] No se encontró el directorio frontend
    echo [INFO] ¿Necesitas corregir la estructura de carpetas?
    echo [INFO] Ejecuta: move_to_correct_location.bat
    pause
    exit /b 1
)

echo [PASO 1/5] Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Falló la instalación de dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas correctamente
echo.

echo [PASO 2/5] Configurando variables de entorno...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local"
        echo [INFO] Archivo .env.local creado desde .env.example
    ) else (
        echo [WARNING] No se encontró .env.example
        echo [INFO] Creando .env.local básico...
        (
            echo REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
            echo REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
            echo REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
            echo NODE_ENV=development
        ) > .env.local
    )
    echo [ACCION REQUERIDA] Edita .env.local con tus credenciales de Supabase
) else (
    echo [INFO] .env.local ya existe
)
echo.

echo [PASO 3/5] Verificando estructura de archivos...
set "missing_files="
if not exist "src\App.js" set "missing_files=%missing_files% App.js"
if not exist "src\index.js" set "missing_files=%missing_files% index.js"
if not exist "src\config\supabase.js" set "missing_files=%missing_files% supabase.js"
if not exist "src\context\AuthContext.js" set "missing_files=%missing_files% AuthContext.js"

if not "%missing_files%"=="" (
    echo [WARNING] Archivos faltantes:%missing_files%
    echo [INFO] El proyecto puede no funcionar correctamente
) else (
    echo [OK] Estructura de archivos verificada
)
echo.

echo [PASO 4/5] Compilando para verificar errores...
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Compilación exitosa
    rd /s /q build 2>nul
) else (
    echo [WARNING] Hay errores de compilación - revisar código
)
echo.

echo [PASO 5/5] Configuración completada
echo.
echo =======================================
echo         INSTALACION COMPLETADA
echo =======================================
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Configura Supabase:
echo    - Crea proyecto en https://supabase.com
echo    - Ejecuta el script /database/setup_supabase.sql
echo.
echo 2. Actualiza credenciales en .env.local:
echo    - REACT_APP_SUPABASE_URL
echo    - REACT_APP_SUPABASE_ANON_KEY
echo.
echo 3. Inicia el servidor de desarrollo:
echo    cd frontend
echo    npm start
echo.
echo 4. Accede a la aplicación:
echo    http://localhost:3000
echo.
echo Para más información, consulta:
echo - /frontend/README_FRONTEND.md
echo - /deploy_guide.md
echo.

:: Preguntar si quiere abrir el editor para configurar .env.local
echo ¿Quieres abrir .env.local para configurar las credenciales ahora? (s/n)
set /p answer=
if /i "%answer%"=="s" (
    if exist ".env.local" (
        start notepad ".env.local"
    )
)

echo.
echo ¿Quieres iniciar el servidor de desarrollo? (s/n)
set /p start_server=
if /i "%start_server%"=="s" (
    echo.
    echo Iniciando servidor de desarrollo...
    echo Presiona Ctrl+C para detener el servidor
    echo.
    npm start
)

pause
