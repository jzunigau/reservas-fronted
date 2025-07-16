@echo off
echo ========================================
echo    INSTALACION DE PRODUCCION
echo    Sistema de Reservas de Laboratorio
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [2/5] Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)

echo [3/5] Creando build de produccion...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear build
    pause
    exit /b 1
)

echo [4/5] Configurando variables de entorno...
if not exist .env.production (
    echo REACT_APP_API_URL=https://tu-proyecto-vercel.vercel.app/api > .env.production
    echo REACT_APP_ENVIRONMENT=production >> .env.production
    echo Archivo .env.production creado
)

echo [5/5] Iniciando servidor de produccion...
echo.
echo ========================================
echo    SERVIDOR DE PRODUCCION ACTIVO
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
echo Para detener el servidor: Ctrl+C
echo.
npm run serve 