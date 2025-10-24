#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🚀 Starting MCP ChatGPT App - Top Movers Dashboard${NC}\n"

# Load API key from .zshrc if not set
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
    echo "${YELLOW}⚠️  ALPHA_VANTAGE_API_KEY not set, loading from ~/.zshrc...${NC}"
    source ~/.zshrc 2>/dev/null || true
    
    if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
        echo "${RED}❌ ALPHA_VANTAGE_API_KEY still not set${NC}"
        echo "${YELLOW}   Get your free API key at: https://www.alphavantage.co/support/#api-key${NC}"
        echo "${YELLOW}   Set it with: export ALPHA_VANTAGE_API_KEY=your_key_here${NC}\n"
        exit 1
    else
        echo "${GREEN}✅ API key loaded from ~/.zshrc${NC}\n"
    fi
else
    echo "${GREEN}✅ API key already set${NC}\n"
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

# Build if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "${YELLOW}🔨 Building TypeScript...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo "${RED}❌ Build failed${NC}"
        exit 1
    fi
    echo "${GREEN}✅ Build successful${NC}\n"
fi

# Start the server
echo "${GREEN}🌐 Starting server on http://localhost:3000${NC}"
echo "${BLUE}💡 Tip: Open another terminal and run './ngrok.sh' to expose via ngrok${NC}\n"

npm start

