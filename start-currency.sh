#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}💱 Starting MCP Currency Converter App${NC}\n"

# Check if API key is set (optional for this app)
if [ -z "$EXCHANGE_RATE_API_KEY" ]; then
    echo "${YELLOW}ℹ️  Using free API (no key required)${NC}"
    echo "${YELLOW}   Free tier: 1500 requests/month${NC}"
    echo "${YELLOW}   Get unlimited access at: https://www.exchangerate-api.com/${NC}\n"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo "${GREEN}✅ Dependencies installed${NC}\n"
fi

# Build if dist doesn't exist or currency-server.js is missing
if [ ! -f "dist/currency-server.js" ]; then
    echo "${YELLOW}🔨 Building TypeScript...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo "${RED}❌ Build failed${NC}"
        exit 1
    fi
    echo "${GREEN}✅ Build successful${NC}\n"
fi

# Start the server
echo "${GREEN}🌐 Starting Currency Converter on http://localhost:3001${NC}"
echo "${BLUE}💡 Tip: Open another terminal and run 'ngrok http 3001' to expose via ngrok${NC}\n"

node dist/currency-server.js

