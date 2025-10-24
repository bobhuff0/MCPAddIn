#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║        Starting ngrok with OAuth          ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

# Check if email is provided
if [ -z "$1" ]; then
    echo "${RED}❌ Error: Email address required${NC}"
    echo "${YELLOW}Usage: $0 your@email.com [port]${NC}"
    echo ""
    echo "${BLUE}Examples:${NC}"
    echo "  $0 your@email.com 3000    # Stock Market App"
    echo "  $0 your@email.com 3001    # Currency Converter"
    echo ""
    exit 1
fi

EMAIL=$1
PORT=${2:-3000}

echo "${BLUE}🔐 Setting up OAuth protection for:${NC}"
echo "  Email: ${GREEN}$EMAIL${NC}"
echo "  Port:  ${GREEN}$PORT${NC}"
echo ""

# Stop existing ngrok
echo "${YELLOW}🛑 Stopping existing ngrok tunnels...${NC}"
./stop-ngrok.sh

echo ""
echo "${BLUE}🚀 Starting ngrok with OAuth...${NC}"
echo "${YELLOW}⚠️  Only $EMAIL will be able to access your server${NC}\n"

# Start ngrok with OAuth
ngrok http $PORT --oauth=google --oauth-allow-email=$EMAIL

