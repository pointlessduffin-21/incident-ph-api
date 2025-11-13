#!/bin/bash

# Incident PH API - Setup and Run Script (Mac/Linux)
# This script sets up and runs both backend and frontend servers

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required!"
        echo "Current version: $(node -v)"
        echo "Please update Node.js from https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detected"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_success "npm $(npm -v) detected"
}

# Install backend dependencies
install_backend() {
    print_header "Installing Backend Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend packages..."
        npm install
        print_success "Backend dependencies installed"
    else
        print_info "Backend dependencies already installed"
    fi
}

# Install frontend dependencies
install_frontend() {
    print_header "Installing Frontend Dependencies"
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend packages..."
        npm install
        print_success "Frontend dependencies installed"
    else
        print_info "Frontend dependencies already installed"
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found in frontend directory"
        if [ -f ".env.example" ]; then
            print_info "Copying .env.example to .env.local..."
            cp .env.example .env.local
            print_warning "Please edit frontend/.env.local and add your API keys:"
            echo "  - VITE_OPENWEATHER_KEY"
            echo "  - VITE_WINDY_API_KEY"
            echo "  - VITE_QWEATHER_KEY"
        fi
    fi
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    print_header "Shutting Down Servers"
    
    if [ ! -z "$BACKEND_PID" ]; then
        print_info "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_info "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    print_success "Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    clear
    
    print_header "🇵🇭 Incident PH API - Setup & Run"
    echo "Starting setup process..."
    
    # Check prerequisites
    check_node
    check_npm
    
    # Install dependencies
    install_backend
    install_frontend
    
    print_header "Starting Servers"
    
    # Start backend
    print_info "Starting backend on http://localhost:6144/api"
    npm start > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_info "Waiting for backend to start..."
    sleep 5
    
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend failed to start! Check backend.log for details"
        cat backend.log
        exit 1
    fi
    
    print_success "Backend started (PID: $BACKEND_PID)"
    
    # Start frontend
    print_info "Starting frontend on http://localhost:5173"
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    print_info "Waiting for frontend to start..."
    sleep 3
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend failed to start! Check frontend.log for details"
        cat frontend.log
        cleanup
        exit 1
    fi
    
    print_success "Frontend started (PID: $FRONTEND_PID)"
    
    print_header "🎉 Servers Running"
    echo ""
    echo -e "${GREEN}✅ Backend API:${NC}        http://localhost:6144/api"
    echo -e "${GREEN}✅ Swagger Docs:${NC}       http://localhost:6144/api/docs"
    echo -e "${GREEN}✅ Frontend App:${NC}       http://localhost:5173"
    echo ""
    echo -e "${YELLOW}📝 Logs:${NC}"
    echo "   Backend:  tail -f backend.log"
    echo "   Frontend: tail -f frontend.log"
    echo ""
    echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"
    echo ""
    
    # Keep script running
    wait
}

# Run main function
main
