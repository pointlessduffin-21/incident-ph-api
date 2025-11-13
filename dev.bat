@echo off
REM Quick dev script - runs both servers with live reload
REM Usage: dev.bat

echo Starting Development Servers...
echo.

echo Starting Backend (http://localhost:6144/api)
start "Backend Dev" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend (http://localhost:5173)
cd frontend
start "Frontend Dev" cmd /k "npm run dev"
cd ..

echo.
echo Servers started!
echo Backend:  http://localhost:6144/api
echo Frontend: http://localhost:5173
echo.
echo Close the server windows to stop them.
pause
