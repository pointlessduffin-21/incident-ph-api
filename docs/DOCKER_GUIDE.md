# 🐳 Docker Deployment Guide

Complete guide for running the Philippine Government Services API in Docker.

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 2. Build and Run with Docker CLI

```bash
# Build the image
docker build -t sms-apis:latest .

# Run the container
docker run -d \
  --name sms-apis \
  -p 3000:3000 \
  --env-file .env \
  sms-apis:latest

# View logs
docker logs -f sms-apis

# Stop and remove
docker stop sms-apis
docker rm sms-apis
```

## Prerequisites

✅ Docker installed (20.10+)  
✅ Docker Compose installed (1.29+)  
✅ `.env` file configured with `TOMTOM_API_KEY`

## Environment Configuration

Ensure your `.env` file contains:

```env
# Required
TOMTOM_API_KEY=your_tomtom_api_key_here

# Optional
PORT=3000
NODE_ENV=production
```

## Testing the Deployment

### Automated Testing

Run the comprehensive test script:

```bash
# Test local Docker container
./test-endpoints.sh

# Test specific URL
./test-endpoints.sh http://localhost:3000
```

### Manual Testing

```bash
# Wait for container to be ready
docker-compose logs -f

# Test root endpoint
curl http://localhost:3000/api

# Test MMDA traffic
curl http://localhost:3000/api/mmda/traffic

# Test PAGASA weather
curl http://localhost:3000/api/pagasa/forecast

# Test PHIVOLCS earthquakes
curl http://localhost:3000/api/phivolcs/earthquakes
```

## Docker Image Details

### Multi-Stage Build
- **Stage 1 (Builder)**: Compiles TypeScript to JavaScript
- **Stage 2 (Production)**: Minimal runtime image

### Image Size
- **Estimated size**: ~250-300 MB
- Includes Alpine Linux, Node.js 18, and Chromium

### Security Features
- ✅ Non-root user (`nestjs`)
- ✅ Minimal base image (Alpine)
- ✅ No unnecessary packages
- ✅ Health checks enabled
- ✅ Resource limits configured

## Docker Compose Configuration

### Services

#### sms-apis
- **Port**: 3000:3000
- **Restart**: unless-stopped
- **Health Check**: Every 30s
- **Memory Limit**: 512MB
- **CPU Limit**: 1 core

### Networks
- **sms-network**: Bridge network for service isolation

## Health Checks

Container includes built-in health monitoring:

```bash
# Check container health status
docker ps

# View health check logs
docker inspect sms-apis --format='{{json .State.Health}}'
```

Health check tests the `/api` endpoint every 30 seconds.

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs sms-apis

# Common issues:
# 1. Missing .env file
# 2. Invalid TOMTOM_API_KEY
# 3. Port 3000 already in use
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Check Container Status

```bash
# List running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Check resource usage
docker stats sms-apis
```

### Access Container Shell

```bash
# Access running container
docker exec -it sms-apis sh

# Check Node.js version
docker exec sms-apis node --version

# Check Chromium
docker exec sms-apis chromium-browser --version
```

## Performance Optimization

### Memory Configuration

Default limits in `docker-compose.yml`:
- **Limit**: 512MB
- **Reservation**: 256MB

Adjust based on traffic:

```yaml
deploy:
  resources:
    limits:
      memory: 1G  # Increase for high traffic
```

### CPU Configuration

Default: 1 CPU core

```yaml
deploy:
  resources:
    limits:
      cpus: '2'  # Use 2 cores
```

## Production Deployment

### Recommended Configuration

```yaml
version: '3.8'

services:
  sms-apis:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TOMTOM_API_KEY=${TOMTOM_API_KEY}
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

### With Reverse Proxy (Nginx)

```yaml
version: '3.8'

services:
  sms-apis:
    build: .
    expose:
      - "3000"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - sms-apis
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Scaling

### Multiple Instances

```bash
# Scale to 3 instances
docker-compose up -d --scale sms-apis=3

# Use a load balancer (nginx) to distribute traffic
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml sms-stack

# Scale service
docker service scale sms-stack_sms-apis=3
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t sms-apis:latest .
      
      - name: Run tests
        run: |
          docker run -d --name test-api -p 3000:3000 --env TOMTOM_API_KEY=${{ secrets.TOMTOM_API_KEY }} sms-apis:latest
          sleep 10
          ./test-endpoints.sh
          docker stop test-api
      
      - name: Push to registry
        run: |
          docker tag sms-apis:latest registry.example.com/sms-apis:latest
          docker push registry.example.com/sms-apis:latest
```

## Monitoring

### View Real-time Logs

```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f sms-apis
```

### Resource Monitoring

```bash
# Real-time stats
docker stats sms-apis

# Container processes
docker top sms-apis
```

## Backup and Restore

### Backup Container

```bash
# Export container
docker export sms-apis > sms-apis-backup.tar

# Save image
docker save sms-apis:latest > sms-apis-image.tar
```

### Restore

```bash
# Load image
docker load < sms-apis-image.tar

# Run container
docker-compose up -d
```

## Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Remove old images
docker image prune -f
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Complete cleanup
docker system prune -a -f
```

## Security Best Practices

✅ **Use specific versions** in Dockerfile  
✅ **Scan images** for vulnerabilities: `docker scan sms-apis:latest`  
✅ **Limit resources** to prevent DoS  
✅ **Run as non-root** user (already configured)  
✅ **Keep base images updated**  
✅ **Use secrets** for sensitive data  
✅ **Enable health checks**  
✅ **Monitor logs** for suspicious activity

## Environment-Specific Configs

### Development

```bash
# Use docker-compose with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Staging

```bash
# Use staging environment
docker-compose -f docker-compose.staging.yml up -d
```

### Production

```bash
# Use production config with monitoring
docker-compose -f docker-compose.prod.yml up -d
```

## FAQ

### Q: How do I update the TomTom API key?

```bash
# Update .env file, then restart
docker-compose restart
```

### Q: Container exits immediately

```bash
# Check logs for errors
docker-compose logs

# Common causes:
# - Missing environment variables
# - Build failures
# - Port conflicts
```

### Q: High memory usage

```bash
# Check memory stats
docker stats sms-apis

# Adjust limits in docker-compose.yml
# Consider enabling swap limits
```

### Q: Slow startup

```bash
# First startup downloads Playwright browsers
# Subsequent starts are faster (~5-10 seconds)

# Check startup progress
docker-compose logs -f sms-apis
```

## Support

- **Documentation**: See `docs/` folder
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Quick Start**: `docs/QUICKSTART.md`
- **Issues**: Open GitHub issue

---

**Docker Version Tested**: Docker 24.0+, Docker Compose 2.20+  
**Last Updated**: October 2, 2025
