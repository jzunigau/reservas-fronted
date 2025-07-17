@echo off
echo =======================================
echo    DIAGNÓSTICO DEL SISTEMA
echo    Sistema de Reservas
echo =======================================
echo.

echo [INFO] Analizando el estado actual del proyecto...
echo Fecha y hora: %date% %time%
echo Ubicación: %CD%
echo Usuario: %USERNAME%
echo.

echo [DIAGNÓSTICO 1] Estructura de archivos:
echo ----------------------------------------
if exist "package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NO encontrado
)

if exist "frontend\" (
    echo ✅ Carpeta frontend/ encontrada
    if exist "frontend\package.json" (
        echo ✅ frontend/package.json encontrado
    ) else (
        echo ❌ frontend/package.json NO encontrado
    )
    if exist "frontend\src\" (
        echo ✅ frontend/src/ encontrado
        if exist "frontend\src\App.js" (
            echo ✅ frontend/src/App.js encontrado
        ) else (
            echo ❌ frontend/src/App.js NO encontrado
        )
    ) else (
        echo ❌ frontend/src/ NO encontrado
    )
) else (
    echo ❌ Carpeta frontend/ NO encontrada
)

if exist "database\" (
    echo ✅ Carpeta database/ encontrada
    if exist "database\setup_supabase.sql" (
        echo ✅ database/setup_supabase.sql encontrado
    ) else (
        echo ❌ database/setup_supabase.sql NO encontrado
    )
) else (
    echo ❌ Carpeta database/ NO encontrada
)

:: Verificar archivos obsoletos
if exist "api\" (
    echo ⚠️  ADVERTENCIA: Carpeta 'api' obsoleta detectada
    echo    Esta carpeta ya no es necesaria (ahora usamos Supabase)
    echo    🔧 SOLUCIÓN: Eliminar carpeta api/
) else (
    echo ✅ No hay carpetas API obsoletas
)

if exist "frontend\api\" (
    echo ⚠️  ADVERTENCIA: Carpeta 'frontend/api' obsoleta detectada
    echo    Esta carpeta ya no es necesaria (ahora usamos Supabase)
    echo    🔧 SOLUCIÓN: Eliminar carpeta frontend/api/
) else (
    echo ✅ No hay APIs obsoletas en frontend
)

echo.
echo [DIAGNÓSTICO 2] Estructura anidada:
echo ----------------------------------------
if exist "reservas-fronted\" (
    echo ⚠️  PROBLEMA: Carpeta anidada 'reservas-fronted' detectada
    echo    Ubicación: %CD%\reservas-fronted\
    if exist "reservas-fronted\package.json" (
        echo    ✅ Contiene package.json
        echo    🔧 SOLUCIÓN: Ejecuta move_to_correct_location.bat
    )
) else (
    echo ✅ No hay estructura anidada
)

echo.
echo [DIAGNÓSTICO 3] Node.js y npm:
echo ----------------------------------------
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js instalado: 
    node --version
) else (
    echo ❌ Node.js NO instalado
    echo    🔧 SOLUCIÓN: Descargar de https://nodejs.org
)

npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm disponible: 
    npm --version
) else (
    echo ❌ npm NO disponible
)

echo.
echo [DIAGNÓSTICO 4] Dependencias:
echo ----------------------------------------
if exist "frontend\node_modules\" (
    echo ✅ Dependencias instaladas (node_modules existe)
    if exist "frontend\node_modules\react\" (
        echo ✅ React instalado
    ) else (
        echo ⚠️  React NO encontrado en node_modules
    )
) else (
    echo ❌ Dependencias NO instaladas
    echo    🔧 SOLUCIÓN: cd frontend && npm install
)

echo.
echo [DIAGNÓSTICO 5] Configuración:
echo ----------------------------------------
if exist "frontend\.env.local" (
    echo ✅ .env.local existe
    findstr "REACT_APP_SUPABASE_URL" frontend\.env.local >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Variable SUPABASE_URL configurada
    ) else (
        echo ⚠️  Variable SUPABASE_URL NO configurada
    )
) else (
    echo ❌ .env.local NO existe
    echo    🔧 SOLUCIÓN: Copiar .env.example o ejecutar quick_install.bat
)

echo.
echo [DIAGNÓSTICO 6] Procesos que pueden causar problemas:
echo ----------------------------------------
tasklist /fi "imagename eq node.exe" /fo table /nh 2>nul | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Procesos Node.js en ejecución detectados:
    tasklist /fi "imagename eq node.exe" /fo table /nh 2>nul | findstr "node.exe"
    echo    Esto puede causar conflictos. Considera cerrarlos.
) else (
    echo ✅ No hay procesos Node.js conflictivos
)

tasklist /fi "imagename eq npm.exe" /fo table /nh 2>nul | find "npm.exe" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Procesos npm en ejecución detectados:
    tasklist /fi "imagename eq npm.exe" /fo table /nh 2>nul | findstr "npm.exe"
) else (
    echo ✅ No hay procesos npm en ejecución
)

echo.
echo =======================================
echo           RESUMEN Y SOLUCIONES
echo =======================================
echo.

:: Contar problemas
set /a problems=0

if not exist "package.json" set /a problems+=1
if not exist "frontend\package.json" set /a problems+=1
if exist "reservas-fronted\" set /a problems+=1

node --version >nul 2>&1
if %errorlevel% neq 0 set /a problems+=1

if not exist "frontend\node_modules\" set /a problems+=1
if not exist "frontend\.env.local" set /a problems+=1

if %problems% equ 0 (
    echo 🎉 ¡EXCELENTE! No se detectaron problemas críticos
    echo    El proyecto está listo para usar
    echo.
    echo    COMANDOS PARA INICIAR:
    echo    cd frontend
    echo    npm start
) else (
    echo ⚠️  Se detectaron %problems% problema(s) que necesitan atención
    echo.
    echo    SOLUCIONES RECOMENDADAS:
    
    if exist "reservas-fronted\" (
        echo    1. Corregir estructura: move_to_correct_location.bat
    )
    
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo    2. Instalar Node.js desde https://nodejs.org
    )
    
    if not exist "frontend\node_modules\" (
        echo    3. Instalar dependencias: quick_install.bat
    )
    
    if not exist "frontend\.env.local" (
        echo    4. Configurar entorno: copiar .env.example
    )
)

echo.
echo =======================================
pause
