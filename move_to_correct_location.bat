@echo off
echo =======================================
echo    CORRECCIÓN RÁPIDA DE ESTRUCTURA
echo =======================================
echo.

echo INSTRUCCIONES PARA CORREGIR MANUALMENTE:
echo.
echo 1. Abre el Explorador de Windows
echo 2. Ve a: C:\Users\Jorge\Desktop\reservas-fronted\reservas-fronted\
echo 3. Selecciona TODOS los archivos y carpetas (Ctrl+A)
echo 4. Corta los archivos (Ctrl+X)
echo 5. Retrocede una carpeta (a C:\Users\Jorge\Desktop\reservas-fronted\)
echo 6. Pega los archivos (Ctrl+V)
echo 7. Elimina la carpeta vacía 'reservas-fronted'
echo.
echo ALTERNATIVAMENTE, ejecuta los siguientes comandos:
echo.

echo :: Cambiar al directorio padre
echo cd C:\Users\Jorge\Desktop\reservas-fronted\
echo.
echo :: Mover todo el contenido un nivel arriba
echo move "reservas-fronted\*" .
echo.
echo :: Mover carpetas (si el comando anterior no las movió)
echo for /d %%d in (reservas-fronted\*) do move "%%d" .
echo.
echo :: Eliminar carpeta vacía
echo rd reservas-fronted
echo.

echo =======================================
echo       COMANDOS AUTOMÁTICOS
echo =======================================
echo.
echo ¿Quieres que ejecute la corrección automáticamente? (s/n)
set /p auto=
if /i not "%auto%"=="s" (
    echo [INFO] Ejecuta los comandos manualmente
    pause
    exit /b 0
)

echo.
echo [EJECUTANDO] Corrección automática...

:: Cambiar al directorio padre
cd ..

echo [1/5] Verificando estructura...
if not exist "reservas-fronted" (
    echo [ERROR] Carpeta reservas-fronted no encontrada
    pause
    exit /b 1
)

echo [2/5] Moviendo archivos...
move "reservas-fronted\*" . >nul 2>&1

echo [3/5] Moviendo carpetas...
for /d %%d in (reservas-fronted\*) do (
    echo Moviendo carpeta: %%d
    move "%%d" . >nul 2>&1
)

echo [4/5] Verificando que la carpeta esté vacía...
dir reservas-fronted /a /b >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] La carpeta reservas-fronted no está completamente vacía
    echo Contenido restante:
    dir reservas-fronted /b
    echo.
    echo ¿Eliminar carpeta de todas formas? (s/n)
    set /p force=
    if /i not "%force%"=="s" (
        echo [CANCELADO] Carpeta no eliminada
        goto finish
    )
)

echo [5/5] Eliminando carpeta vacía...
rd /s /q reservas-fronted 2>nul
if %errorlevel% equ 0 (
    echo [OK] Carpeta eliminada exitosamente
) else (
    echo [WARNING] No se pudo eliminar la carpeta automáticamente
    echo Elimínala manualmente: rd /s /q reservas-fronted
)

:finish
echo.
echo =======================================
echo       CORRECCIÓN COMPLETADA
echo =======================================
echo.
echo Estructura actual:
dir /b

echo.
echo [ÉXITO] Proyecto movido a: %CD%
echo.
echo PRÓXIMOS PASOS:
echo 1. Verificar archivos: check_system.bat
echo 2. Instalar: install_frontend.bat
echo 3. Configurar Supabase
echo 4. Desplegar: deploy_vercel.bat
echo.

pause
