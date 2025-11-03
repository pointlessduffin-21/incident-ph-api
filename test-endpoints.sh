#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Philippine Government Services API Tests${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Testing against: ${BASE_URL}${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${BLUE}Testing: ${name}${NC}"
    echo -e "Endpoint: ${endpoint}"
    echo -e "Description: ${description}"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo ""
        echo "Response (first 500 chars):"
        echo "$body" | head -c 500
        echo ""
        echo "..."
        echo ""
        
        # Parse success field if JSON
        success=$(echo "$body" | grep -o '"success":\s*true' || echo "")
        if [ -n "$success" ]; then
            echo -e "${GREEN}✅ API returned success:true${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "Response:"
        echo "$body"
    fi
    
    echo ""
    echo -e "${BLUE}------------------------------------------${NC}"
    echo ""
}

# Wait for server to be ready
echo -e "${YELLOW}Waiting for server to be ready...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s "${BASE_URL}/api" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        echo ""
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Server failed to start after $max_attempts attempts${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Starting Endpoint Tests${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Test Root Endpoint
test_endpoint \
    "Root API" \
    "/api" \
    "API information and available endpoints"

# Test MMDA Endpoints
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   MMDA Traffic Tests (Twitter/X)       ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

test_endpoint \
    "MMDA - All Traffic" \
    "/api/mmda/traffic" \
    "Latest MMDA alert tweets for all highways"

test_endpoint \
    "MMDA - Highways List" \
    "/api/mmda/highways" \
    "List of monitored highways"

test_endpoint \
    "MMDA - EDSA Traffic" \
    "/api/mmda/traffic/EDSA" \
    "Traffic incidents on EDSA"

test_endpoint \
    "MMDA - C5 Traffic" \
    "/api/mmda/traffic/C5" \
    "Traffic alerts mentioning C5 Road"

# Test PAGASA Endpoints
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   PAGASA Weather Tests (Playwright)   ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

test_endpoint \
    "PAGASA - Weather Forecast" \
    "/api/pagasa/forecast" \
    "Weather updates from PAGASA Twitter"

test_endpoint \
    "PAGASA - Severe Weather" \
    "/api/pagasa/severe-weather" \
    "Severe weather warnings and advisories"

test_endpoint \
    "PAGASA - Tropical Cyclones" \
    "/api/pagasa/tropical-cyclones" \
    "Typhoon and tropical cyclone updates"

# Test PHIVOLCS Endpoints
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   PHIVOLCS Seismic Tests (Cheerio)    ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

test_endpoint \
    "PHIVOLCS - All Earthquakes" \
    "/api/phivolcs/earthquakes" \
    "Recent earthquakes (24-hour history)"

test_endpoint \
    "PHIVOLCS - Latest Earthquake" \
    "/api/phivolcs/latest-earthquake" \
    "Most recent earthquake data"

test_endpoint \
    "PHIVOLCS - Volcanoes" \
    "/api/phivolcs/volcanoes" \
    "Active volcano monitoring"

# Summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}✅ All endpoint tests completed!${NC}"
echo ""
echo -e "${YELLOW}Note: Some endpoints may show 'Data temporarily unavailable'${NC}"
echo -e "${YELLOW}if the source (Twitter, PHIVOLCS website) is unreachable.${NC}"
echo -e "${YELLOW}This is expected behavior with proper error handling.${NC}"
echo ""
echo -e "${BLUE}For detailed API documentation, see:${NC}"
echo -e "  - README.md"
echo -e "  - docs/API_DOCUMENTATION.md"
echo -e "  - docs/QUICKSTART.md"
echo ""
