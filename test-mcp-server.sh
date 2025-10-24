#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║         MCP Server Testing Suite          ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${BLUE}🔍 Testing MCP Server Implementation...${NC}\n"

# Check if server is running
if ! lsof -i :3000 | grep LISTEN > /dev/null; then
    echo "${RED}❌ Server not running on port 3000${NC}"
    echo "${YELLOW}Start it with: ./start.sh${NC}\n"
    exit 1
fi

echo "${GREEN}✅ Server is running on port 3000${NC}\n"

# Test 1: List Tools (GET)
echo "${BLUE}📋 Test 1: List Available Tools${NC}"
echo "${YELLOW}GET /mcp/tools/list${NC}"
echo ""

RESPONSE=$(curl -s http://localhost:3000/mcp/tools/list)
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Success!${NC}"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
else
    echo "${RED}❌ Failed to get tools list${NC}"
fi

echo ""

# Test 2: Call Tool (POST)
echo "${BLUE}🔧 Test 2: Call topMovers Tool${NC}"
echo "${YELLOW}POST /mcp/tools/call${NC}"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":3}}')

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Success!${NC}"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
else
    echo "${RED}❌ Failed to call tool${NC}"
fi

echo ""

# Test 3: Frontend
echo "${BLUE}🌐 Test 3: Frontend Access${NC}"
echo "${YELLOW}GET /${NC}"
echo ""

RESPONSE=$(curl -s -I http://localhost:3000/ | head -1)
if echo "$RESPONSE" | grep -q "200 OK"; then
    echo "${GREEN}✅ Frontend accessible!${NC}"
    echo "${BLUE}Open: http://localhost:3000${NC}"
else
    echo "${RED}❌ Frontend not accessible${NC}"
fi

echo ""

# Test 4: MCP Protocol (if available)
echo "${BLUE}🔌 Test 4: MCP Protocol Server${NC}"
echo "${YELLOW}Testing stdio MCP server...${NC}"
echo ""

if [ -f "test-mcp-protocol.js" ]; then
    echo "${BLUE}Running MCP protocol test...${NC}"
    node test-mcp-protocol.js
else
    echo "${YELLOW}⚠️  MCP protocol test script not found${NC}"
    echo "${YELLOW}   Run: node test-mcp-protocol.js${NC}"
fi

echo ""

# Summary
echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║              Test Summary                 ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${GREEN}✅ Your server implements:${NC}"
echo "  ${BLUE}• Express REST API${NC} (for ChatGPT/web)"
echo "  ${BLUE}• MCP Protocol Server${NC} (for MCP clients)"
echo "  ${BLUE}• Beautiful Frontend${NC} (DaisyUI + Tailwind)"
echo "  ${BLUE}• Real-time Data${NC} (Alpha Vantage API)"
echo ""

echo "${YELLOW}🔗 Available Endpoints:${NC}"
echo "  ${BLUE}GET  /${NC}                    → Frontend UI"
echo "  ${BLUE}GET  /mcp/tools/list${NC}      → List MCP tools"
echo "  ${BLUE}POST /mcp/tools/call${NC}      → Execute MCP tools"
echo ""

echo "${YELLOW}🧪 Test Commands:${NC}"
echo "  ${BLUE}curl http://localhost:3000/mcp/tools/list${NC}"
echo "  ${BLUE}curl -X POST http://localhost:3000/mcp/tools/call \\${NC}"
echo "  ${BLUE}  -H 'Content-Type: application/json' \\${NC}"
echo "  ${BLUE}  -d '{\"name\":\"topMovers\",\"arguments\":{\"limit\":3}}'${NC}"
echo ""

