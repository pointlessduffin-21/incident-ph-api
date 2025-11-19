# Docker Quick Start Guide

## 🚀 Deploy in 3 Steps

### 1. Prepare Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env and add your API keys (optional)
nano .env
```

### 2. Deploy with Docker Compose
```bash
# Linux/Mac
./docker-deploy.sh

# Windows
docker-deploy.bat

# Or manually
docker-compose up -d
```

### 3. Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs

## 📋 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Check status
docker-compose ps

# Rebuild images
docker-compose build --no-cache
```

## 🔧 Troubleshooting

**Port already in use?**
- Edit `docker-compose.yml` and change port mappings
- Frontend: `80:80` → `8080:80`
- Backend: `3000:3000` → `3001:3000`

**Services not starting?**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

**Frontend can't connect to backend?**
- Ensure both services are on the same Docker network
- Check nginx proxy configuration in `frontend/nginx.conf`
- Verify backend is healthy: `docker-compose ps`

## 📚 Full Documentation

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete documentation.

