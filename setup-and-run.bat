@echo off
REM Incident PH API - Setup and Run Script (Windows)
REM This script sets up and runs both backend and frontend servers

setlocal enabledelayedexpansion

REM Set colors (limited in Windows batch)
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Function to print header
:print_header
echo.
echo ============================================================
echo   %~1
echo ============================================================
echo.
goto :eof

REM Check if Node.js is installed
call :print_header "Checking Prerequisites"

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: Node.js is not installed!%NC%
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo %GREEN%Node.js detected: %NC%
node -v

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: npm is not installed!%NC%
    pause
    exit /b 1
)

echo %GREEN%npm detected: %NC%
npm -v

REM Install backend dependencies
call :print_header "Installing Backend Dependencies"

if not exist "node_modules\" (
    echo Installing backend packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo %RED%Failed to install backend dependencies!%NC%
        pause
        exit /b 1
    )
    echo %GREEN%Backend dependencies installed%NC%
) else (
    echo Backend dependencies already installed
)

REM Install frontend dependencies
call :print_header "Installing Frontend Dependencies"

cd frontend

if not exist "node_modules\" (
    echo Installing frontend packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo %RED%Failed to install frontend dependencies!%NC%
        cd ..
        pause
        exit /b 1
    )
    echo %GREEN%Frontend dependencies installed%NC%
) else (
    echo Frontend dependencies already installed
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo %YELLOW%Warning: .env.local not found%NC%
    if exist ".env.example" (
        echo Copying .env.example to .env.local...
        copy .env.example .env.local
        echo %YELLOW%Please edit frontend\.env.local and add your API keys:%NC%
        echo   - VITE_OPENWEATHER_KEY
        echo   - VITE_WINDY_API_KEY
        echo   - VITE_QWEATHER_KEY
    )
)

cd ..

REM Start servers
call :print_header "Starting Servers"

echo Starting backend on http://localhost:6144/api
start "Backend Server" cmd /c "npm start > backend.log 2>&1"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo %GREEN%Backend started%NC%

echo Starting frontend on http://localhost:5173
cd frontend
start "Frontend Server" cmd /c "npm run dev > ..\frontend.log 2>&1"
cd ..

echo Waiting for frontend to start...
timeout /t 3 /nobreak >nul

echo %GREEN%Frontend started%NC%

call :print_header "Servers Running"
echo.
echo %GREEN%Backend API:%NC%        http://localhost:6144/api
echo %GREEN%Swagger Docs:%NC%       http://localhost:6144/api/docs
echo %GREEN%Frontend App:%NC%       http://localhost:5173
echo.
echo %YELLOW%Logs:%NC%
echo    Backend:  type backend.log
echo    Frontend: type frontend.log
echo.
echo %BLUE%Press any key to stop all servers%NC%
echo.

pause >nul

REM Cleanup
call :print_header "Shutting Down Servers"

echo Stopping servers...
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" >nul 2>nul

echo %GREEN%Servers stopped%NC%
echo.
pause
