#!/bin/zsh

# Stop All MCP Servers Script

echo "\033[1;36m================================================\033[0m"
echo "\033[1;36m       Stopping All MCP Servers\033[0m"
echo "\033[1;36m================================================\033[0m"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop a server
stop_server() {
    local name=$1
    local pid_file=".pids/${name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if ps -p $pid > /dev/null 2>&1; then
            echo "${YELLOW}Stopping ${name} (PID: ${pid})...${NC}"
            kill $pid
            rm $pid_file
            echo "${GREEN}✅ ${name} stopped${NC}"
        else
            echo "${YELLOW}${name} is not running${NC}"
            rm $pid_file
        fi
    else
        echo "${YELLOW}No PID file found for ${name}${NC}"
    fi
}

# Stop all servers
stop_server "Stock Market MCP"
stop_server "Currency Converter MCP"
stop_server "World Time MCP"
stop_server "Units Converter MCP"

echo ""
echo "${GREEN}All servers stopped${NC}"

# Clean up PIDs directory
if [ -d ".pids" ] && [ -z "$(ls -A .pids)" ]; then
    rmdir .pids
fi


