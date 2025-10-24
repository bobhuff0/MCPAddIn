#!/bin/zsh

# Units & Measurements Converter MCP Server Startup Script

echo "\033[1;36m================================================\033[0m"
echo "\033[1;36m  Units & Measurements MCP Server Startup\033[0m"
echo "\033[1;36m================================================\033[0m"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
if [ ! -f "dist/units-server.js" ]; then
    echo "${RED}❌ Build failed - dist/units-server.js not found${NC}"
    exit 1
fi

echo "${GREEN}✅ Build successful${NC}"
echo ""
echo "${GREEN}Starting Units & Measurements Converter Server on port 3003...${NC}"
echo ""
echo "${YELLOW}Available endpoints:${NC}"
echo "  - Local: http://localhost:3003"
echo "  - MCP: http://localhost:3003/mcp"
echo "  - Tools: http://localhost:3003/mcp/tools/list"
echo ""
echo "${YELLOW}Supported categories:${NC}"
echo "  - Length, Weight, Temperature, Volume, Area"
echo "  - Speed, Pressure, Energy, Power, Data"
echo ""
echo "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
node dist/units-server.js


