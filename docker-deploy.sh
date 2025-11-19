#!/bin/bash

# Docker Deployment Script for Incident PH API
# This script helps deploy both frontend and backend using Docker Compose

set -e

echo "🚀 Incident PH API - Docker Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating .env from env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Created .env file. Please update it with your API keys.${NC}"
    else
        echo -e "${RED}❌ env.example not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose.${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check ports
if check_port 80; then
    echo -e "${YELLOW}⚠️  Port 80 is already in use. Frontend may not start correctly.${NC}"
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Backend may not start correctly.${NC}"
fi

# Parse command line arguments
COMMAND=${1:-up}

case $COMMAND in
    up|start)
        echo "📦 Building Docker images..."
        docker-compose build
        
        echo ""
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✅ Services started successfully!${NC}"
        echo ""
        echo "📍 Access the application:"
        echo "   Frontend:  http://localhost"
        echo "   Backend:   http://localhost:3000/api"
        echo "   API Docs:  http://localhost:3000/api/docs"
        echo ""
        echo "📊 View logs: docker-compose logs -f"
        echo "🛑 Stop:      docker-compose down"
        ;;
    
    down|stop)
        echo "🛑 Stopping services..."
        docker-compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
    
    restart)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo -e "${GREEN}✅ Services restarted${NC}"
        ;;
    
    logs)
        echo "📊 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    
    build)
        echo "📦 Building Docker images..."
        docker-compose build --no-cache
        echo -e "${GREEN}✅ Build complete${NC}"
        ;;
    
    status)
        echo "📊 Service Status:"
        docker-compose ps
        echo ""
        echo "🏥 Health Checks:"
        docker inspect incident-ph-api-backend --format='{{.State.Health.Status}}' 2>/dev/null || echo "Backend: Not running"
        docker inspect incident-ph-api-frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "Frontend: Not running"
        ;;
    
    clean)
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
        ;;
    
    *)
        echo "Usage: $0 {up|down|restart|logs|build|status|clean}"
        echo ""
        echo "Commands:"
        echo "  up       - Build and start services (default)"
        echo "  down     - Stop and remove services"
        echo "  restart  - Restart services"
        echo "  logs     - Show service logs"
        echo "  build    - Rebuild Docker images"
        echo "  status   - Show service status"
        echo "  clean    - Stop services and clean up Docker resources"
        exit 1
        ;;
esac

