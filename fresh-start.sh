#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║         MCP Apps - Fresh Start Guide      ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${GREEN}This will give you a complete fresh start!${NC}\n"

# Step 1: Shutdown
echo "${YELLOW}Step 1: Shutting down all existing processes...${NC}"
./shutdown-all.sh

echo ""
echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║            Apps Available                  ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${BLUE}📊 Stock Market App${NC}"
echo "   Port: 3000"
echo "   Tools: topMovers"
echo "   Requires: ALPHA_VANTAGE_API_KEY"
echo ""

echo "${BLUE}💱 Currency Converter${NC}"
echo "   Port: 3001"
echo "   Tools: convertCurrency, getSupportedCurrencies, getExchangeRates"
echo "   Requires: Nothing (free tier available)"
echo ""

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║         Next Steps - Choose One            ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${YELLOW}Option A: Start Stock Market App${NC}"
echo "  ${BLUE}Terminal 1:${NC}"
echo "    export ALPHA_VANTAGE_API_KEY=your_key"
echo "    ./start.sh"
echo "  ${BLUE}Terminal 2 (optional - for ngrok):${NC}"
echo "    ngrok http 3000"
echo "  ${BLUE}Browser:${NC}"
echo "    http://localhost:3000"
echo ""

echo "${YELLOW}Option B: Start Currency Converter${NC}"
echo "  ${BLUE}Terminal 1:${NC}"
echo "    ./start-currency.sh"
echo "  ${BLUE}Terminal 2 (optional - for ngrok):${NC}"
echo "    ngrok http 3001"
echo "  ${BLUE}Browser:${NC}"
echo "    http://localhost:3001"
echo ""

echo "${YELLOW}Option C: Start Both Apps${NC}"
echo "  ${BLUE}Terminal 1:${NC}"
echo "    ./start.sh"
echo "  ${BLUE}Terminal 2:${NC}"
echo "    ./start-currency.sh"
echo "  ${BLUE}Terminal 3 (optional):${NC}"
echo "    ngrok http 3000"
echo "  ${BLUE}Terminal 4 (optional):${NC}"
echo "    ngrok http 3001"
echo ""

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║           Ready for Fresh Start!          ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${GREEN}✨ Everything is shut down and ready!${NC}"
echo "${YELLOW}Choose an option above and start your app(s)!${NC}\n"

