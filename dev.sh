#!/bin/bash

# Quick dev script - runs both servers with live reload
# Usage: ./dev.sh

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Development Servers...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping servers...${NC}"
    kill 0
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend with watch mode
echo -e "${GREEN}Starting Backend (http://localhost:6144/api)${NC}"
npm start &

# Wait a bit for backend
sleep 3

# Start frontend dev server
echo -e "${GREEN}Starting Frontend (http://localhost:5173)${NC}"
cd frontend && npm run dev &

# Wait for all background processes
wait
