@echo off
REM Docker Deployment Script for Incident PH API (Windows)
REM This script helps deploy both frontend and backend using Docker Compose

echo 🚀 Incident PH API - Docker Deployment
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found
    echo Creating .env from env.example...
    if exist env.example (
        copy env.example .env
        echo ✅ Created .env file. Please update it with your API keys.
    ) else (
        echo ❌ env.example not found. Please create .env file manually.
        exit /b 1
    )
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Parse command line arguments
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=up

if "%COMMAND%"=="up" goto :up
if "%COMMAND%"=="start" goto :up
if "%COMMAND%"=="down" goto :down
if "%COMMAND%"=="stop" goto :down
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="clean" goto :clean
goto :usage

:up
echo 📦 Building Docker images...
docker-compose build
echo.
echo 🚀 Starting services...
docker-compose up -d
echo.
echo ✅ Services started successfully!
echo.
echo 📍 Access the application:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:3000/api
echo    API Docs:  http://localhost:3000/api/docs
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop:      docker-compose down
goto :end

:down
echo 🛑 Stopping services...
docker-compose down
echo ✅ Services stopped
goto :end

:restart
echo 🔄 Restarting services...
docker-compose restart
echo ✅ Services restarted
goto :end

:logs
echo 📊 Showing logs (Ctrl+C to exit)...
docker-compose logs -f
goto :end

:build
echo 📦 Building Docker images...
docker-compose build --no-cache
echo ✅ Build complete
goto :end

:status
echo 📊 Service Status:
docker-compose ps
goto :end

:clean
echo 🧹 Cleaning up Docker resources...
docker-compose down -v
docker system prune -f
echo ✅ Cleanup complete
goto :end

:usage
echo Usage: %0 {up^|down^|restart^|logs^|build^|status^|clean}
echo.
echo Commands:
echo   up       - Build and start services (default)
echo   down     - Stop and remove services
echo   restart  - Restart services
echo   logs     - Show service logs
echo   build    - Rebuild Docker images
echo   status   - Show service status
echo   clean    - Stop services and clean up Docker resources
exit /b 1

:end

