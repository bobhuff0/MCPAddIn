#!/bin/zsh

# Start All MCP Servers Script

echo "\033[1;36m================================================\033[0m"
echo "\033[1;36m       Starting All MCP Servers\033[0m"
echo "\033[1;36m================================================\033[0m"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "${RED}❌ node_modules not found${NC}"
    echo "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build TypeScript
echo "${YELLOW}Building TypeScript...${NC}"
npm run build

# Check if build was successful
if [ ! -f "dist/server.js" ] || [ ! -f "dist/currency-server.js" ] || [ ! -f "dist/time-server.js" ] || [ ! -f "dist/units-server.js" ]; then
    echo "${RED}❌ Build failed - some server files not found${NC}"
    exit 1
fi

echo "${GREEN}✅ Build successful${NC}"
echo ""

# Function to start a server in background
start_server() {
    local name=$1
    local port=$2
    local script=$3
    
    echo "${BLUE}Starting ${name} on port ${port}...${NC}"
    node $script > logs/${name}.log 2>&1 &
    local pid=$!
    echo $pid > .pids/${name}.pid
    echo "${GREEN}✅ ${name} started (PID: ${pid})${NC}"
}

# Create directories for logs and PIDs
mkdir -p logs
mkdir -p .pids

# Start all servers
start_server "Stock Market MCP" "3000" "dist/server.js"
start_server "Currency Converter MCP" "3001" "dist/currency-server.js"
start_server "World Time MCP" "3002" "dist/time-server.js"
start_server "Units Converter MCP" "3003" "dist/units-server.js"

echo ""
echo "${GREEN}================================================${NC}"
echo "${GREEN}   All MCP Servers Started Successfully!${NC}"
echo "${GREEN}================================================${NC}"
echo ""
echo "${YELLOW}Server URLs:${NC}"
echo "  📊 Stock Market:        http://localhost:3000"
echo "  💱 Currency Converter:  http://localhost:3001"
echo "  🌍 World Time:          http://localhost:3002"
echo "  📏 Units Converter:     http://localhost:3003"
echo ""
echo "${YELLOW}Logs are being written to: ./logs/${NC}"
echo ""
echo "${YELLOW}To stop all servers, run:${NC}"
echo "  ./stop-all-servers.sh"
echo ""


