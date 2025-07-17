@echo off
echo =======================================
echo    VERIFICACION DEL SISTEMA
echo    Sistema de Reservas de Laboratorio
echo =======================================
echo.

:: Variables de estado
set "errors=0"
set "warnings=0"

echo [VERIFICACION 1/8] Entorno de desarrollo...
:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no instalado
    set /a errors+=1
) else (
    echo [OK] Node.js instalado:
    node --version
)

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no disponible
    set /a errors+=1
) else (
    echo [OK] npm disponible:
    npm --version
)
echo.

echo [VERIFICACION 2/8] Estructura del proyecto...
cd /d "%~dp0"

:: Verificar archivos principales
if exist "package.json" (
    echo [OK] package.json encontrado
) else (
    echo [ERROR] package.json no encontrado
    echo [INFO] ¿Necesitas corregir la estructura? Ejecuta: move_to_correct_location.bat
    set /a errors+=1
)

if exist "frontend\package.json" (
    echo [OK] frontend/package.json encontrado
) else (
    echo [ERROR] frontend/package.json no encontrado
    echo [INFO] ¿Necesitas corregir la estructura? Ejecuta: move_to_correct_location.bat
    set /a errors+=1
)

if exist "database\setup_supabase.sql" (
    echo [OK] Script de base de datos encontrado
) else (
    echo [ERROR] database/setup_supabase.sql no encontrado
    echo [INFO] ¿Necesitas corregir la estructura? Ejecuta: move_to_correct_location.bat
    set /a errors+=1
)
echo.

echo [VERIFICACION 3/8] Dependencias frontend...
cd frontend 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Directorio frontend no existe
    set /a errors+=1
    goto skip_frontend_check
)

if exist "node_modules" (
    echo [OK] Dependencias instaladas
) else (
    echo [WARNING] Dependencias no instaladas - ejecuta 'npm install'
    set /a warnings+=1
)

if exist "node_modules\react" (
    echo [OK] React instalado
) else (
    echo [ERROR] React no encontrado
    set /a errors+=1
)

if exist "node_modules\@supabase\supabase-js" (
    echo [OK] Supabase cliente instalado
) else (
    echo [ERROR] Cliente Supabase no instalado
    set /a errors+=1
)

:skip_frontend_check
echo.

echo [VERIFICACION 4/8] Configuración de entorno...
if exist ".env.local" (
    echo [OK] .env.local encontrado
    findstr /C:"REACT_APP_SUPABASE_URL" .env.local >nul
    if %errorlevel% equ 0 (
        echo [OK] REACT_APP_SUPABASE_URL configurado
    ) else (
        echo [WARNING] REACT_APP_SUPABASE_URL no configurado
        set /a warnings+=1
    )
    
    findstr /C:"REACT_APP_SUPABASE_ANON_KEY" .env.local >nul
    if %errorlevel% equ 0 (
        echo [OK] REACT_APP_SUPABASE_ANON_KEY configurado
    ) else (
        echo [WARNING] REACT_APP_SUPABASE_ANON_KEY no configurado
        set /a warnings+=1
    )
) else (
    echo [WARNING] .env.local no encontrado
    set /a warnings+=1
    if exist ".env.example" (
        echo [INFO] .env.example disponible para copiar
    )
)
echo.

echo [VERIFICACION 5/8] Archivos core del frontend...
set "core_files=src\App.js src\index.js src\config\supabase.js src\context\AuthContext.js"
for %%f in (%core_files%) do (
    if exist "%%f" (
        echo [OK] %%f
    ) else (
        echo [ERROR] %%f no encontrado
        set /a errors+=1
    )
)
echo.

echo [VERIFICACION 6/8] Componentes principales...
set "components=src\components\Navbar.js src\components\Loading.js src\components\ProtectedRoute.js"
for %%f in (%components%) do (
    if exist "%%f" (
        echo [OK] %%f
    ) else (
        echo [WARNING] %%f no encontrado
        set /a warnings+=1
    )
)
echo.

echo [VERIFICACION 7/8] Páginas del sistema...
set "pages=src\pages\LoginPage.js src\pages\DashboardPage.js src\pages\ReservasPage.js src\pages\AdminPage.js src\pages\CalendarioPage.js"
for %%f in (%pages%) do (
    if exist "%%f" (
        echo [OK] %%f
    ) else (
        echo [WARNING] %%f no encontrado
        set /a warnings+=1
    )
)
echo.

echo [VERIFICACION 8/8] Compilación del proyecto...
if exist "node_modules" (
    echo [INFO] Verificando compilación...
    npm run build >build_check.log 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Proyecto compila sin errores
        rd /s /q build 2>nul
        del build_check.log 2>nul
    ) else (
        echo [ERROR] Errores de compilación detectados
        echo [INFO] Ver build_check.log para detalles
        set /a errors+=1
    )
) else (
    echo [SKIP] No se puede verificar compilación sin dependencias
)
echo.

cd /d "%~dp0"

echo =======================================
echo           RESUMEN DE VERIFICACION
echo =======================================
echo.
if %errors% equ 0 if %warnings% equ 0 (
    echo [EXCELENTE] Sistema completamente funcional ✓
    echo.
    echo El proyecto está listo para:
    echo - Desarrollo local: npm start
    echo - Deploy a producción: npm run build
    echo.
) else (
    if %errors% gtr 0 (
        echo [CRITICO] %errors% error^(s^) encontrado^(s^) ✗
        echo El sistema NO funcionará correctamente
        echo.
    )
    if %warnings% gtr 0 (
        echo [ATENCION] %warnings% advertencia^(s^) encontrada^(s^) ⚠
        echo El sistema puede tener problemas menores
        echo.
    )
)

echo ACCIONES RECOMENDADAS:
echo.
if %errors% gtr 0 (
    echo 1. URGENTE - Corregir errores críticos:
    echo    - Instalar dependencias: npm install
    echo    - Verificar archivos core faltantes
    echo    - Configurar variables de entorno
    echo.
)
if %warnings% gtr 0 (
    echo 2. Resolver advertencias:
    echo    - Completar configuración .env.local
    echo    - Verificar componentes opcionales
    echo.
)

echo 3. Para iniciar desarrollo:
echo    cd frontend
echo    npm start
echo.
echo 4. Para desplegar:
echo    - Configurar Supabase
echo    - Ejecutar deploy_vercel.bat
echo.

echo =======================================
pause
