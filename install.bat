@echo on
setlocal
color 0A

echo ========================================
echo Pokrećem Plantie aplikaciju (frontend + backend)
echo ========================================

:: Postavi točne putanje do frontend i backend direktorija
set "FRONTEND_DIR=C:\Users\LENOVO\Desktop\PLANTIEKRAJ\PlantieTest\frontend\quasar-project"
set "PROJECT_ROOT_DIR=C:\Users\LENOVO\Desktop\PLANTIEKRAJ\PlantieTest"
set "BACKEND_DIR=%PROJECT_ROOT_DIR%\backend"  :: Dodana putanja za backend direktorij

:: Provjeri Node
echo Provjera Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [GREŠKA] Node.js nije instaliran.
    pause
    exit /b
)

:: Pokreni backend API
echo Pokrećem backend API...
:: Promijenjeno: Osiguravamo da se novi prozor konzole otvori direktno u backend direktoriju
start "" cmd /k "cd /d "%BACKEND_DIR%" && node Plantie.js"

:: Pričekaj 3 sekunde (daje backendu malo vremena da se pokrene)
ping 127.0.0.1 -n 4 >nul

:: Pokreni frontend Quasar app
echo Pokrećem frontend (Quasar)...
cd /d "%FRONTEND_DIR%"
start "" cmd /k "quasar dev"

echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:9000
echo ========================================
pause
