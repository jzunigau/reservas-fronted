@echo off
echo =======================================
echo    VERIFICACION FINAL DE RUTAS
echo    Sistema de Reservas
echo =======================================
echo.

echo [VERIFICACION] Rutas del proyecto después de corrección...
echo.

:: Verificar estructura principal
echo [1/5] Estructura principal:
echo ----------------------------------------
if exist "package.json" (
    echo ✅ package.json (raíz)
) else (
    echo ❌ package.json NO encontrado
)

if exist "frontend\package.json" (
    echo ✅ frontend/package.json
) else (
    echo ❌ frontend/package.json NO encontrado
)

if exist "database\setup_supabase.sql" (
    echo ✅ database/setup_supabase.sql
) else (
    echo ❌ database/setup_supabase.sql NO encontrado
)

echo.
echo [2/5] Archivos obsoletos (deben estar ausentes):
echo ----------------------------------------
if exist "api\" (
    echo ❌ PROBLEMA: Carpeta api/ obsoleta aún existe
) else (
    echo ✅ Carpeta api/ obsoleta eliminada correctamente
)

if exist "frontend\api\" (
    echo ❌ PROBLEMA: Carpeta frontend/api/ obsoleta aún existe
) else (
    echo ✅ Carpeta frontend/api/ obsoleta eliminada correctamente
)

echo.
echo [3/5] Archivos de configuración clave:
echo ----------------------------------------
if exist "frontend\src\config\supabase.js" (
    echo ✅ frontend/src/config/supabase.js (configuración Supabase)
) else (
    echo ❌ frontend/src/config/supabase.js NO encontrado
)

if exist "frontend\.env.example" (
    echo ✅ frontend/.env.example (plantilla de entorno)
) else (
    echo ❌ frontend/.env.example NO encontrado
)

if exist "vercel.json" (
    echo ✅ vercel.json (configuración deploy raíz)
) else (
    echo ❌ vercel.json NO encontrado
)

if exist "frontend\vercel.json" (
    echo ✅ frontend/vercel.json (configuración deploy frontend)
) else (
    echo ❌ frontend/vercel.json NO encontrado
)

echo.
echo [4/5] Scripts de automatización:
echo ----------------------------------------
if exist "quick_install.bat" (
    echo ✅ quick_install.bat
) else (
    echo ❌ quick_install.bat NO encontrado
)

if exist "diagnose.bat" (
    echo ✅ diagnose.bat
) else (
    echo ❌ diagnose.bat NO encontrado
)

if exist "move_to_correct_location.bat" (
    echo ✅ move_to_correct_location.bat
) else (
    echo ❌ move_to_correct_location.bat NO encontrado
)

if exist "deploy_vercel.bat" (
    echo ✅ deploy_vercel.bat
) else (
    echo ❌ deploy_vercel.bat NO encontrado
)

echo.
echo [5/5] Verificación de imports en código fuente:
echo ----------------------------------------

:: Verificar que no haya imports problemáticos
findstr /S /C:"from '../../backend" frontend\src\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ PROBLEMA: Imports a backend obsoleto encontrados
    echo    Archivos con problemas:
    findstr /S /C:"from '../../backend" frontend\src\*.*
) else (
    echo ✅ No hay imports a backend obsoleto
)

findstr /S /C:"localhost:3001" frontend\src\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ PROBLEMA: Referencias a localhost:3001 encontradas
    echo    Archivos con problemas:
    findstr /S /C:"localhost:3001" frontend\src\*.*
) else (
    echo ✅ No hay referencias a localhost obsoleto
)

findstr /S /C:"../config/supabase" frontend\src\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Imports a Supabase correctos encontrados
) else (
    echo ⚠️  No se encontraron imports a Supabase (puede ser normal)
)

echo.
echo =======================================
echo           RESUMEN FINAL
echo =======================================
echo.

:: Contar archivos verificados
set /a total_checks=0
set /a passed_checks=0

:: Estructura principal (3 checks)
if exist "package.json" set /a passed_checks+=1
if exist "frontend\package.json" set /a passed_checks+=1
if exist "database\setup_supabase.sql" set /a passed_checks+=1
set /a total_checks+=3

:: Archivos obsoletos ausentes (2 checks)
if not exist "api\" set /a passed_checks+=1
if not exist "frontend\api\" set /a passed_checks+=1
set /a total_checks+=2

:: Configuración clave (4 checks)
if exist "frontend\src\config\supabase.js" set /a passed_checks+=1
if exist "frontend\.env.example" set /a passed_checks+=1
if exist "vercel.json" set /a passed_checks+=1
if exist "frontend\vercel.json" set /a passed_checks+=1
set /a total_checks+=4

:: Scripts (4 checks)
if exist "quick_install.bat" set /a passed_checks+=1
if exist "diagnose.bat" set /a passed_checks+=1
if exist "move_to_correct_location.bat" set /a passed_checks+=1
if exist "deploy_vercel.bat" set /a passed_checks+=1
set /a total_checks+=4

echo Verificaciones pasadas: %passed_checks%/%total_checks%
echo.

if %passed_checks% equ %total_checks% (
    echo 🎉 ¡PERFECTO! Todas las rutas están correctas
    echo.
    echo ✅ Estructura de carpetas corregida
    echo ✅ Archivos obsoletos eliminados
    echo ✅ Configuraciones actualizadas
    echo ✅ Scripts de automatización listos
    echo.
    echo PROYECTO LISTO PARA:
    echo 1. Configurar Supabase
    echo 2. Ejecutar: quick_install.bat
    echo 3. Desarrollar: cd frontend && npm start
    echo 4. Desplegar: deploy_vercel.bat
) else (
    set /a missing_checks=%total_checks%-%passed_checks%
    echo ⚠️  Se encontraron %missing_checks% problema(s) de rutas
    echo.
    echo ACCIONES RECOMENDADAS:
    echo 1. Revisar archivos faltantes listados arriba
    echo 2. Ejecutar: move_to_correct_location.bat (si hay estructura anidada)
    echo 3. Verificar que todos los archivos se movieron correctamente
    echo 4. Volver a ejecutar esta verificación
)

echo.
echo =======================================
pause
