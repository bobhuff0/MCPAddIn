#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🌐 Starting ngrok tunnel to expose local server${NC}\n"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "${RED}❌ ngrok is not installed${NC}"
    echo "${YELLOW}Install it with: brew install ngrok${NC}"
    echo "${YELLOW}Or download from: https://ngrok.com/download${NC}"
    exit 1
fi

PORT=${PORT:-3000}

echo "${GREEN}✅ ngrok found${NC}"
echo "${BLUE}📡 Exposing http://localhost:${PORT}${NC}\n"
echo "${YELLOW}⚠️  Make sure your server is running in another terminal!${NC}"
echo "${YELLOW}   Run: ./start.sh${NC}\n"

ngrok http ${PORT}

