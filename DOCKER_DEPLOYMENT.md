# Docker Deployment Guide

This guide explains how to deploy both the frontend and backend of Incident PH API using Docker.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- `.env` file with required environment variables

### 1. Prepare Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
CACHE_TTL=300

# Data Source URLs
MMDA_TWITTER_URL=https://x.com/mmda
PAGASA_TWITTER_URL=https://x.com/dost_pagasa
PAGASA_BASE_URL=https://www.pagasa.dost.gov.ph
PHIVOLCS_BASE_URL=https://earthquake.phivolcs.dost.gov.ph
TWITTER_PROXY_BASE=https://r.jina.ai/https://x.com

# Optional: Third-party API keys
OPENWEATHER_API_KEY=your_key_here
WINDY_API_KEY=your_key_here
QWEATHER_API_KEY=your_key_here
ACLED_API_EMAIL=your_email
ACLED_API_KEY=your_key
```

### 2. Build and Start Services

```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **Frontend (direct)**: http://localhost (nginx proxies `/api` to backend)

## 📦 Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network                 │
│     (incident-ph-network)               │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │   (Nginx)    │───▶│   (NestJS)   │  │
│  │   Port 80    │    │   Port 3000  │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
└─────────┼────────────────────┼──────────┘
          │                    │
    ┌─────┴─────┐        ┌─────┴─────┐
    │ Port 80   │        │ Port 3000  │
    │ (Host)    │        │ (Host)     │
    └───────────┘        └────────────┘
```

## 🔧 Configuration

### Backend Service

- **Image**: Built from `Dockerfile` in root
- **Port**: 3000 (mapped to host)
- **Health Check**: `/api` endpoint
- **Volumes**: `./data` mounted for persistent storage
- **Resources**: 512M-1G RAM, 0.5-2 CPUs

### Frontend Service

- **Image**: Built from `frontend/Dockerfile`
- **Port**: 80 (mapped to host)
- **Web Server**: Nginx Alpine
- **API Proxy**: `/api` requests forwarded to backend
- **Resources**: 128M-256M RAM, 0.25-0.5 CPUs

### Network

- **Type**: Bridge network
- **Name**: `incident-ph-network`
- **Services**: Frontend and backend can communicate by service name

## 🛠️ Docker Commands

### Build Images

```bash
# Build both services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d backend
docker-compose up -d frontend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Services

```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Check health
docker inspect incident-ph-api-backend | grep -A 10 Health
docker inspect incident-ph-api-frontend | grep -A 10 Health
```

### Execute Commands

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Run npm commands in backend
docker-compose exec backend npm run <command>
```

## 🔍 Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Check if port is in use
lsof -i :3000

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend Not Connecting to Backend

1. **Check network connectivity**:
   ```bash
   docker-compose exec frontend ping backend
   ```

2. **Check nginx configuration**:
   ```bash
   docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

3. **Test API proxy**:
   ```bash
   docker-compose exec frontend wget -O- http://backend:3000/api
   ```

### Port Conflicts

If ports 80 or 3000 are already in use, modify `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Change host port
  frontend:
    ports:
      - "8080:80"    # Change host port
```

### Environment Variables Not Loading

1. **Check `.env` file exists** in root directory
2. **Verify syntax** (no spaces around `=`)
3. **Restart services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Data Persistence

Data files are stored in `./data` directory on the host:
- `mmda-alerts.json`
- `pagasa-updates.json`

This directory is mounted as a volume, so data persists across container restarts.

## 📊 Resource Usage

### Default Limits

**Backend**:
- CPU: 0.5-2 cores
- Memory: 512M-1G

**Frontend**:
- CPU: 0.25-0.5 cores
- Memory: 128M-256M

### Adjusting Resources

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '4'      # Increase CPU
          memory: 2G     # Increase memory
```

## 🔒 Security

### Current Security Features

- ✅ Non-root users in containers
- ✅ `no-new-privileges` security option
- ✅ Resource limits
- ✅ Health checks
- ✅ Network isolation

### Production Recommendations

1. **Use secrets management** (Docker Secrets, Vault)
2. **Enable HTTPS** (add reverse proxy with SSL)
3. **Implement rate limiting**
4. **Add authentication**
5. **Regular security updates**

## 🚀 Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml incident-ph

# View services
docker service ls

# Scale services
docker service scale incident-ph_backend=3
```

### Using Kubernetes

Convert `docker-compose.yml` to Kubernetes manifests:

```bash
# Install kompose
npm install -g kompose

# Convert
kompose convert

# Deploy
kubectl apply -f .
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Backend port |
| `NODE_ENV` | No | production | Node environment |
| `CACHE_TTL` | No | 300 | Cache TTL in seconds |
| `OPENWEATHER_API_KEY` | Optional | - | OpenWeather API key |
| `WINDY_API_KEY` | Optional | - | Windy API key |
| `QWEATHER_API_KEY` | Optional | - | QWeather API key |
| `ACLED_API_EMAIL` | Optional | - | ACLED email |
| `ACLED_API_KEY` | Optional | - | ACLED API key |

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Backup Data

```bash
# Backup data directory
tar -czf data-backup-$(date +%Y%m%d).tar.gz data/
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)

---

**Last Updated**: December 2024  
**Version**: 1.2.0

