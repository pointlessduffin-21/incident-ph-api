# 🚀 Setup & Run Scripts

Quick start scripts to get both backend and frontend servers running.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)

## Quick Start

### Mac/Linux

#### Option 1: Full Setup Script (Recommended for first run)
```bash
./setup-and-run.sh
```

This script will:
- ✅ Check Node.js and npm versions
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Create `.env.local` from example if missing
- ✅ Start both servers
- ✅ Show live status

**Press Ctrl+C to stop all servers**

#### Option 2: Quick Dev Script (For development)
```bash
./dev.sh
```

Faster startup, assumes dependencies are already installed.

### Windows

#### Option 1: Full Setup Script (Recommended for first run)
```cmd
setup-and-run.bat
```

This script will:
- ✅ Check Node.js and npm versions
- ✅ Install backend dependencies
- ✅ Install frontend dependencies  
- ✅ Create `.env.local` from example if missing
- ✅ Start both servers in separate windows
- ✅ Show server URLs

**Press any key to stop all servers**

#### Option 2: Quick Dev Script (For development)
```cmd
dev.bat
```

Faster startup, assumes dependencies are already installed.

## Manual Setup

If you prefer to run each step manually:

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Frontend Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and add your API keys:
```env
VITE_OPENWEATHER_KEY=your_key_here
VITE_WINDY_API_KEY=your_key_here
VITE_QWEATHER_KEY=your_key_here
```

### 4. Start Backend (Terminal 1)
```bash
npm start
```

### 5. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

## Server URLs

After starting, access:

- **Backend API**: http://localhost:6144/api
- **Swagger Docs**: http://localhost:6144/api/docs
- **Frontend App**: http://localhost:5173

## Scripts Comparison

| Script | Platform | Setup | Dev Mode | Auto-restart | Logs |
|--------|----------|-------|----------|--------------|------|
| `setup-and-run.sh` | Mac/Linux | ✅ | ❌ | ❌ | File |
| `dev.sh` | Mac/Linux | ❌ | ✅ | ✅ | Terminal |
| `setup-and-run.bat` | Windows | ✅ | ❌ | ❌ | File |
| `dev.bat` | Windows | ❌ | ✅ | ❌ | Window |

## Logs

### Mac/Linux (setup-and-run.sh)
Logs are saved to files:
```bash
# View backend logs
tail -f backend.log

# View frontend logs
tail -f frontend.log
```

### Windows (setup-and-run.bat)
Logs are saved to files:
```cmd
REM View backend logs
type backend.log

REM View frontend logs
type frontend.log
```

### Dev Scripts
Logs are shown directly in the terminal/window.

## Troubleshooting

### Port Already in Use

#### Mac/Linux
```bash
# Find process on port 6144 (backend)
lsof -ti:6144 | xargs kill -9

# Find process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

#### Windows
```cmd
REM Find process on port 6144 (backend)
netstat -ano | findstr :6144
taskkill /PID <PID> /F

REM Find process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Permission Denied (Mac/Linux)

Make scripts executable:
```bash
chmod +x setup-and-run.sh
chmod +x dev.sh
```

### Node Version Error

Check your Node.js version:
```bash
node -v
```

Must be 18.0.0 or higher. Update from [nodejs.org](https://nodejs.org/).

### Missing Dependencies

If you see `Cannot find module` errors:
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### Frontend Environment Variables

If frontend shows API errors, check `frontend/.env.local`:
```bash
cd frontend
cat .env.local
```

Ensure all required keys are set:
- `VITE_OPENWEATHER_KEY`
- `VITE_WINDY_API_KEY`
- `VITE_QWEATHER_KEY`

Get API keys from:
- OpenWeather: https://openweathermap.org/api
- Windy: https://api.windy.com/
- QWeather: https://dev.qweather.com/

## Development Workflow

### First Time Setup
```bash
# Mac/Linux
./setup-and-run.sh

# Windows
setup-and-run.bat
```

### Daily Development
```bash
# Mac/Linux
./dev.sh

# Windows
dev.bat
```

### Testing Changes
1. Make code changes
2. Backend auto-restarts (nest watch mode)
3. Frontend hot-reloads (Vite HMR)
4. Test in browser

### Building for Production

#### Backend
```bash
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Features

### Setup Scripts (`setup-and-run.*`)
- ✅ Dependency installation
- ✅ Environment setup
- ✅ Version checking
- ✅ Automatic server startup
- ✅ Log file creation
- ✅ Graceful shutdown

### Dev Scripts (`dev.*`)
- ✅ Fast startup
- ✅ Live reload (frontend)
- ✅ Watch mode (backend)
- ✅ Terminal output
- ✅ Parallel execution

## API Endpoints

Once running, you can test:

### Tide Forecasts
```bash
# Get locations
curl http://localhost:6144/api/tide/locations

# Get forecast
curl http://localhost:6144/api/tide/forecast/cordova-1
```

### MMDA Traffic
```bash
curl http://localhost:6144/api/mmda/traffic
```

### PAGASA Weather
```bash
curl http://localhost:6144/api/pagasa/forecast
```

### PHIVOLCS
```bash
curl http://localhost:6144/api/phivolcs/latest-earthquake
```

## Support

- **Documentation**: `/docs` folder
- **API Docs**: http://localhost:6144/api/docs
- **Issues**: GitHub Issues

## License

MIT License
