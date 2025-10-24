#!/bin/zsh

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${BLUE}🔍 Checking for active ngrok tunnels...${NC}\n"

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "${RED}❌ ngrok is not running${NC}\n"
    echo "${YELLOW}To start ngrok:${NC}"
    echo "  ${BLUE}For Stock Market App (port 3000):${NC}"
    echo "    ngrok http 3000"
    echo ""
    echo "  ${BLUE}For Currency Converter (port 3001):${NC}"
    echo "    ngrok http 3001"
    echo ""
    exit 1
fi

echo "${GREEN}✅ ngrok is running!${NC}\n"

# Get tunnel info from ngrok API
TUNNELS=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null)

if [ -z "$TUNNELS" ]; then
    echo "${RED}❌ Could not connect to ngrok API${NC}"
    echo "${YELLOW}ngrok might be starting up. Wait a few seconds and try again.${NC}\n"
    exit 1
fi

# Parse and display public URLs
echo "${GREEN}🌐 Your Public URLs:${NC}\n"
echo "$TUNNELS" | grep -o '"public_url":"[^"]*"' | while read -r line; do
    URL=$(echo "$line" | grep -o 'https://[^"]*')
    if [ -n "$URL" ]; then
        echo "  ${BLUE}→${NC} ${GREEN}${URL}${NC}"
    fi
done

echo ""
echo "${YELLOW}💡 Web Dashboard:${NC} ${BLUE}http://127.0.0.1:4040${NC}"
echo ""

