@echo off
echo ========================================
echo    DESPLIEGUE EN VERCEL
echo    Sistema de Reservas
echo ========================================
echo.

echo [1/4] Verificando Vercel CLI...
vercel --version
if %errorlevel% neq 0 (
    echo Instalando Vercel CLI...
    npm install -g vercel
)

echo [2/4] Login en Vercel...
vercel login

echo [3/4] Desplegando proyecto...
cd frontend
vercel --prod

echo [4/4] Configurando variables de entorno...
echo.
echo IMPORTANTE: Ve a tu dashboard de Vercel y configura:
echo - REACT_APP_API_URL = https://tu-proyecto.vercel.app/api
echo - REACT_APP_ENVIRONMENT = production
echo.
echo URL de tu proyecto: https://tu-proyecto.vercel.app
echo.
pause 