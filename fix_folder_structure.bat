@echo off
echo =======================================
echo    CORRECTOR DE ESTRUCTURA DE CARPETAS
echo    Sistema de Reservas de Laboratorio
echo =======================================
echo.

echo [INFO] Detectando estructura actual...
echo Carpeta actual: %CD%
echo.

:: Verificar que estamos en la carpeta correcta
if not exist "package.json" (
    echo [ERROR] No se encontró package.json
    echo [ERROR] Ejecuta este script desde la carpeta del proyecto
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] No se encontró la carpeta frontend
    echo [ERROR] Ejecuta este script desde la carpeta del proyecto
    pause
    exit /b 1
)

echo [INFO] Estructura actual detectada:
echo - Proyecto está en: %CD%
echo - Debería estar en: C:\Users\Jorge\Desktop\reservas-fronted\
echo.

:: Cambiar al directorio padre
cd ..

echo [PASO 1/4] Verificando estructura de carpetas...
if not exist "reservas-fronted" (
    echo [ERROR] No se encontró la carpeta reservas-fronted
    pause
    exit /b 1
)

echo [INFO] Carpetas encontradas:
dir /B

echo.
echo [ADVERTENCIA] Se va a reorganizar la estructura de carpetas
echo.
echo CAMBIO QUE SE REALIZARÁ:
echo Origen: C:\Users\Jorge\Desktop\reservas-fronted\reservas-fronted\*
echo Destino: C:\Users\Jorge\Desktop\reservas-fronted\*
echo.
echo ¿Continuar? (s/n)
set /p confirm=
if /i not "%confirm%"=="s" (
    echo [CANCELADO] Operación cancelada por el usuario
    pause
    exit /b 0
)

echo.
echo [PASO 2/4] Creando carpeta temporal...
if exist "temp_backup" (
    echo [INFO] Eliminando carpeta temporal existente...
    rd /s /q "temp_backup"
)

mkdir temp_backup
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo crear carpeta temporal
    pause
    exit /b 1
)

echo [PASO 3/4] Moviendo archivos a temporal...
cd reservas-fronted

:: Mover todos los archivos y carpetas excepto este script
for /f "delims=" %%i in ('dir /b /a ^| findstr /v "fix_folder_structure.bat"') do (
    echo Moviendo: %%i
    move "%%i" "..\temp_backup\" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] No se pudo mover: %%i
    )
)

cd ..

echo [PASO 4/4] Reorganizando estructura final...

:: Mover todo de temp_backup al directorio actual
echo Moviendo archivos al directorio principal...
for /f "delims=" %%i in ('dir temp_backup /b /a') do (
    echo Restaurando: %%i
    move "temp_backup\%%i" "." >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] No se pudo restaurar: %%i
    )
)

:: Limpiar
echo Limpiando archivos temporales...
rd /s /q "temp_backup" 2>nul
rd /s /q "reservas-fronted" 2>nul

echo.
echo =======================================
echo       REORGANIZACIÓN COMPLETADA
echo =======================================
echo.
echo Nueva estructura:
echo %CD%\
dir /b

echo.
echo [ÉXITO] Estructura corregida correctamente
echo.
echo PRÓXIMOS PASOS:
echo 1. Verificar que todos los archivos están presentes
echo 2. Ejecutar: install_frontend.bat
echo 3. Configurar variables de entorno
echo 4. Desplegar con: deploy_vercel.bat
echo.

echo ¿Quieres verificar la instalación ahora? (s/n)
set /p verify=
if /i "%verify%"=="s" (
    if exist "check_system.bat" (
        echo.
        echo Ejecutando verificación del sistema...
        call check_system.bat
    ) else (
        echo [WARNING] check_system.bat no encontrado
    )
)

pause
