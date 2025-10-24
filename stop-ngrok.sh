#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🔍 Stopping all ngrok tunnels...${NC}\n"

# Find and kill all ngrok processes
NGROK_PIDS=$(ps aux | grep '[n]grok' | awk '{print $2}')

if [ -z "$NGROK_PIDS" ]; then
    echo "${YELLOW}No ngrok processes found running${NC}\n"
    exit 0
fi

echo "${YELLOW}Found ngrok processes:${NC}"
ps aux | grep '[n]grok' | awk '{print "  PID: " $2 " - " $11 " " $12 " " $13}'
echo ""

for PID in $NGROK_PIDS; do
    echo "${RED}Killing ngrok process: ${PID}${NC}"
    kill $PID 2>/dev/null
done

sleep 1

# Check if any are still running
REMAINING=$(ps aux | grep '[n]grok' | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    echo "${RED}Some processes didn't stop, using force kill...${NC}"
    for PID in $NGROK_PIDS; do
        kill -9 $PID 2>/dev/null
    done
fi

echo ""
echo "${GREEN}✅ All ngrok tunnels stopped!${NC}"
echo "${BLUE}You can now start a new tunnel with: ngrok http 3001${NC}\n"

