#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║     Shutting Down All MCP Apps & ngrok    ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

# Step 1: Stop ngrok
echo "${BLUE}🔍 Step 1: Stopping ngrok tunnels...${NC}"
NGROK_PIDS=$(ps aux | grep '[n]grok' | awk '{print $2}')

if [ -z "$NGROK_PIDS" ]; then
    echo "${YELLOW}   No ngrok processes found${NC}\n"
else
    for PID in $NGROK_PIDS; do
        echo "${RED}   Killing ngrok process: ${PID}${NC}"
        kill $PID 2>/dev/null
    done
    sleep 1
    echo "${GREEN}   ✅ ngrok stopped${NC}\n"
fi

# Step 2: Stop Node.js servers (Stock Market App - port 3000)
echo "${BLUE}🔍 Step 2: Stopping Stock Market App (port 3000)...${NC}"
STOCK_PIDS=$(lsof -ti:3000 2>/dev/null)

if [ -z "$STOCK_PIDS" ]; then
    echo "${YELLOW}   No process on port 3000${NC}\n"
else
    for PID in $STOCK_PIDS; do
        echo "${RED}   Killing process on port 3000: ${PID}${NC}"
        kill $PID 2>/dev/null
    done
    sleep 1
    echo "${GREEN}   ✅ Stock Market App stopped${NC}\n"
fi

# Step 3: Stop Currency Converter (port 3001)
echo "${BLUE}🔍 Step 3: Stopping Currency Converter (port 3001)...${NC}"
CURRENCY_PIDS=$(lsof -ti:3001 2>/dev/null)

if [ -z "$CURRENCY_PIDS" ]; then
    echo "${YELLOW}   No process on port 3001${NC}\n"
else
    for PID in $CURRENCY_PIDS; do
        echo "${RED}   Killing process on port 3001: ${PID}${NC}"
        kill $PID 2>/dev/null
    done
    sleep 1
    echo "${GREEN}   ✅ Currency Converter stopped${NC}\n"
fi

# Step 4: Double check and force kill if needed
echo "${BLUE}🔍 Step 4: Final cleanup...${NC}"
sleep 1

# Force kill any remaining processes
for PORT in 3000 3001; do
    REMAINING=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$REMAINING" ]; then
        echo "${RED}   Force killing remaining process on port $PORT${NC}"
        kill -9 $REMAINING 2>/dev/null
    fi
done

# Force kill any remaining ngrok
REMAINING_NGROK=$(ps aux | grep '[n]grok' | awk '{print $2}')
if [ -n "$REMAINING_NGROK" ]; then
    for PID in $REMAINING_NGROK; do
        kill -9 $PID 2>/dev/null
    done
fi

echo "${GREEN}   ✅ All cleaned up${NC}\n"

# Summary
echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║            Shutdown Complete!              ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${GREEN}✅ All apps and tunnels stopped!${NC}\n"
echo "${YELLOW}To start fresh:${NC}"
echo "  ${BLUE}./restart-all.sh${NC}  (starts everything automatically)"
echo ""
echo "${YELLOW}Or start individually:${NC}"
echo "  ${BLUE}./start.sh${NC}          (Stock Market App - port 3000)"
echo "  ${BLUE}./start-currency.sh${NC} (Currency Converter - port 3001)"
echo "  ${BLUE}ngrok http 3000${NC}     (Expose Stock App)"
echo "  ${BLUE}ngrok http 3001${NC}     (Expose Currency App)"
echo ""

