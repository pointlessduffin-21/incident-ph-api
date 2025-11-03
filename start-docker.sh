#!/bin/bash

# Philippine Government Services API - Quick Start Script

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  SMS-APIs Docker Quick Start${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}Creating .env from env.example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Review .env for optional overrides (ports, Twitter URLs)${NC}"
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo ""

# Build and start
echo -e "${BLUE}Building Docker image...${NC}"
echo -e "${YELLOW}(This may take 5-10 minutes on first build)${NC}"
docker-compose up -d --build

echo ""
echo -e "${YELLOW}Waiting for server to be ready...${NC}"

# Wait for server
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/api > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Server failed to start${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Server Started Successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}API URL:${NC} http://localhost:3000/api"
echo ""
echo -e "${BLUE}Quick Test:${NC}"
echo "  curl http://localhost:3000/api"
echo ""
echo -e "${BLUE}Run All Tests:${NC}"
echo "  ./test-endpoints.sh"
echo ""
echo -e "${BLUE}View Logs:${NC}"
echo "  docker-compose logs -f"
echo ""
echo -e "${BLUE}Stop Server:${NC}"
echo "  docker-compose down"
echo ""
echo -e "${YELLOW}Running quick test...${NC}"
echo ""

# Quick test
curl -s http://localhost:3000/api | head -c 500
echo ""
echo "..."
echo ""

echo -e "${GREEN}✅ All done! Server is running.${NC}"
echo ""
