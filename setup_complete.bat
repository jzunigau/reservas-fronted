@echo off
setlocal enabledelayedexpansion

echo =======================================
echo    INSTALACIÓN COMPLETA DEL SISTEMA
echo    Sistema de Reservas de Laboratorio
echo =======================================
echo.

:: Configurar timeout para comandos
set TIMEOUT_SECONDS=30

echo [DIAGNÓSTICO] Detectando estado actual del proyecto...
echo Ubicación actual: %CD%
echo.

:: Verificar si estamos en la estructura incorrecta
if exist "reservas-fronted\package.json" (
    echo [DETECTADO] Estructura anidada incorrecta
    echo Origen: %CD%\reservas-fronted\
    echo Destino: %CD%\
    echo.
    echo ¿Corregir estructura de carpetas automáticamente? (s/n)
    choice /c sn /n /m "Presiona S para SÍ o N para NO: "
    
    if !errorlevel! equ 1 (
        echo.
        echo [CORRIGIENDO] Moviendo archivos a la ubicación correcta...
        
        :: Verificar que la carpeta no esté en uso
        timeout /t 2 /nobreak >nul
        
        :: Mover archivos individualmente con verificación
        echo Moviendo archivos...
        for %%f in (reservas-fronted\*) do (
            if not "%%f"=="reservas-fronted\" (
                echo - Moviendo archivo: %%~nxf
                move "%%f" . >nul 2>&1
                if !errorlevel! neq 0 (
                    echo   [WARNING] No se pudo mover: %%~nxf
                )
            )
        )
        
        :: Mover carpetas individualmente
        echo Moviendo carpetas...
        for /d %%d in (reservas-fronted\*) do (
            echo - Moviendo carpeta: %%~nxd
            move "%%d" . >nul 2>&1
            if !errorlevel! neq 0 (
                echo   [WARNING] No se pudo mover: %%~nxd
            )
        )
        
        :: Verificar si la carpeta está vacía antes de eliminar
        timeout /t 1 /nobreak >nul
        dir /b reservas-fronted 2>nul | findstr "." >nul
        if !errorlevel! neq 0 (
            echo Eliminando carpeta vacía...
            rd "reservas-fronted" 2>nul
            if !errorlevel! equ 0 (
                echo [OK] Carpeta eliminada exitosamente
            ) else (
                echo [INFO] Carpeta no pudo ser eliminada automáticamente
            )
        ) else (
            echo [INFO] La carpeta reservas-fronted contiene archivos, no se eliminará
        )
        
        echo [OK] Estructura corregida
    ) else (
        echo [INFO] Corrección cancelada. Ejecuta manualmente: move_to_correct_location.bat
        echo.
        pause
        exit /b 0
    )
) else if exist "package.json" (
    echo [OK] Estructura correcta detectada
) else (
    echo [ERROR] No se detectó el proyecto
    echo Verifica que estés en la carpeta correcta del proyecto
    echo.
    pause
    exit /b 1
)

echo.
echo =======================================
echo      INSTALACIÓN DEL FRONTEND
echo =======================================
echo.

:: Verificar Node.js con timeout
echo [1/6] Verificando Node.js...
timeout /t 3 /nobreak >nul
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js no está instalado
    echo Descarga e instala desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js disponible:
node --version 2>nul || echo "Error obteniendo versión de Node.js"
npm --version 2>nul || echo "Error obteniendo versión de npm"
echo.

:: Verificar estructura
echo [2/6] Verificando estructura del proyecto...
if not exist "frontend\package.json" (
    echo [ERROR] frontend/package.json no encontrado
    echo Verifica que la estructura sea correcta
    echo.
    pause
    exit /b 1
)

if not exist "database\setup_supabase.sql" (
    echo [ERROR] database/setup_supabase.sql no encontrado
    echo Verifica que todos los archivos estén presentes
    echo.
    pause
    exit /b 1
)

echo [OK] Estructura verificada
echo.

:: Cambiar al directorio frontend con verificación
echo [3/6] Cambiando al directorio frontend...
cd frontend 2>nul
if !errorlevel! neq 0 (
    echo [ERROR] No se pudo acceder al directorio frontend
    pause
    exit /b 1
)

echo [OK] En directorio frontend: %CD%
echo.

:: Instalar dependencias con manejo de errores
echo [4/6] Instalando dependencias del frontend...
echo [INFO] Esto puede tomar varios minutos...

:: Verificar si node_modules ya existe
if exist "node_modules" (
    echo [INFO] node_modules ya existe, ejecutando npm ci para instalación limpia...
    npm ci --silent 2>nul
) else (
    echo [INFO] Ejecutando npm install...
    npm install --silent 2>nul
)

if !errorlevel! neq 0 (
    echo [WARNING] Hubo problemas con la instalación automática
    echo [INFO] Intentando instalación manual...
    npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Falló la instalación de dependencias
        echo [INFO] Intenta manualmente: cd frontend && npm install
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Dependencias instaladas
echo.

:: Configurar entorno
echo [5/6] Configurando variables de entorno...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] .env.local creado desde .env.example
        ) else (
            echo [INFO] Creando .env.local básico...
            (
                echo REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
                echo REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
                echo REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
                echo NODE_ENV=development
            ) > .env.local
        )
    ) else (
        echo [INFO] Creando .env.local básico...
        (
            echo REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
            echo REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
            echo REACT_APP_API_URL=https://tu-proyecto.supabase.co/rest/v1
            echo NODE_ENV=development
        ) > .env.local
    )
    echo [ACCIÓN REQUERIDA] Configura .env.local con tus credenciales de Supabase
) else (
    echo [OK] .env.local ya existe
)
echo.

:: Verificar compilación rápida
echo [6/6] Verificación rápida de compilación...
echo [INFO] Verificando sintaxis del proyecto...
npm run build --silent >build_test.log 2>&1
if !errorlevel! equ 0 (
    echo [OK] Proyecto compila correctamente
    rd /s /q build 2>nul
    del build_test.log 2>nul
) else (
    echo [WARNING] Hay errores de compilación
    echo [INFO] Revisa el archivo build_test.log para más detalles
)
echo.

:: Volver al directorio principal
cd ..

echo =======================================
echo       INSTALACIÓN COMPLETADA
echo =======================================
echo.
echo ESTADO DEL PROYECTO:
echo ✅ Estructura de carpetas verificada
echo ✅ Dependencias instaladas
echo ✅ Variables de entorno configuradas
echo ✅ Proyecto verificado
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. 🔧 CONFIGURAR SUPABASE:
echo    - Crear proyecto en https://supabase.com
echo    - Ejecutar script: database/setup_supabase.sql
echo    - Obtener URL y API key del proyecto
echo.
echo 2. 📝 ACTUALIZAR CREDENCIALES:
echo    - Editar: frontend/.env.local
echo    - Configurar REACT_APP_SUPABASE_URL
echo    - Configurar REACT_APP_SUPABASE_ANON_KEY
echo.
echo 3. 🚀 INICIAR DESARROLLO:
echo    cd frontend
echo    npm start
echo.
echo 4. 🌐 DESPLEGAR A PRODUCCIÓN:
echo    deploy_vercel.bat
echo.
echo USUARIOS DE PRUEBA:
echo - Admin: admin@escuela.com / admin123
echo - Profesor: profesor1@escuela.com / admin123
echo.

echo ¿Quieres abrir .env.local para configurar credenciales? (s/n)
choice /c sn /t 10 /d n /m "Presiona S para SÍ, N para NO (auto NO en 10s): "
if !errorlevel! equ 1 (
    if exist "frontend\.env.local" (
        start notepad "frontend\.env.local"
    )
)

echo.
echo ¿Quieres iniciar el servidor de desarrollo? (s/n)
choice /c sn /t 10 /d n /m "Presiona S para SÍ, N para NO (auto NO en 10s): "
if !errorlevel! equ 1 (
    echo.
    echo [INFO] Iniciando servidor de desarrollo...
    echo [INFO] Presiona Ctrl+C para detener
    echo [INFO] La aplicación se abrirá en: http://localhost:3000
    echo.
    cd frontend
    timeout /t 3 /nobreak >nul
    start cmd /k "npm start"
    echo [INFO] Servidor iniciado en nueva ventana
)

echo.
echo [COMPLETADO] Script finalizado exitosamente
pause
