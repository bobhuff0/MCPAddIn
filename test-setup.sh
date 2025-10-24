#!/bin/zsh

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║  MCP ChatGPT App - Setup Verification     ║${NC}"
echo "${CYAN}╔════════════════════════════════════════════╗${NC}\n"

SUCCESS=0
WARNINGS=0
ERRORS=0

# Check Node.js
echo "${BLUE}🔍 Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "${GREEN}✅ Node.js installed: ${NODE_VERSION}${NC}\n"
    ((SUCCESS++))
else
    echo "${RED}❌ Node.js not found${NC}"
    echo "${YELLOW}   Install from: https://nodejs.org/${NC}\n"
    ((ERRORS++))
fi

# Check npm
echo "${BLUE}🔍 Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "${GREEN}✅ npm installed: v${NPM_VERSION}${NC}\n"
    ((SUCCESS++))
else
    echo "${RED}❌ npm not found${NC}\n"
    ((ERRORS++))
fi

# Check TypeScript
echo "${BLUE}🔍 Checking TypeScript...${NC}"
if [ -f "node_modules/.bin/tsc" ]; then
    echo "${GREEN}✅ TypeScript installed${NC}\n"
    ((SUCCESS++))
else
    echo "${RED}❌ TypeScript not found in node_modules${NC}"
    echo "${YELLOW}   Run: npm install${NC}\n"
    ((ERRORS++))
fi

# Check dependencies
echo "${BLUE}🔍 Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo "${GREEN}✅ node_modules found${NC}\n"
    ((SUCCESS++))
else
    echo "${RED}❌ node_modules not found${NC}"
    echo "${YELLOW}   Run: npm install${NC}\n"
    ((ERRORS++))
fi

# Check compiled output
echo "${BLUE}🔍 Checking build output...${NC}"
if [ -f "dist/server.js" ]; then
    echo "${GREEN}✅ TypeScript compiled${NC}\n"
    ((SUCCESS++))
else
    echo "${YELLOW}⚠️  Build output not found${NC}"
    echo "${YELLOW}   Run: npm run build${NC}\n"
    ((WARNINGS++))
fi

# Check API key
echo "${BLUE}🔍 Checking Alpha Vantage API key...${NC}"
if [ -n "$ALPHA_VANTAGE_API_KEY" ]; then
    # Mask the key for security
    MASKED_KEY="${ALPHA_VANTAGE_API_KEY:0:4}...${ALPHA_VANTAGE_API_KEY: -4}"
    echo "${GREEN}✅ API key set: ${MASKED_KEY}${NC}\n"
    ((SUCCESS++))
else
    echo "${YELLOW}⚠️  ALPHA_VANTAGE_API_KEY not set${NC}"
    echo "${YELLOW}   Get your free key at: https://www.alphavantage.co/support/#api-key${NC}"
    echo "${YELLOW}   Then run: export ALPHA_VANTAGE_API_KEY=your_key${NC}\n"
    ((WARNINGS++))
fi

# Check ngrok
echo "${BLUE}🔍 Checking ngrok...${NC}"
if command -v ngrok &> /dev/null; then
    NGROK_VERSION=$(ngrok version 2>&1 | head -n 1)
    echo "${GREEN}✅ ngrok installed: ${NGROK_VERSION}${NC}\n"
    ((SUCCESS++))
else
    echo "${YELLOW}⚠️  ngrok not found (optional)${NC}"
    echo "${YELLOW}   Install with: brew install ngrok${NC}\n"
    ((WARNINGS++))
fi

# Check source files
echo "${BLUE}🔍 Checking source files...${NC}"
if [ -f "src/server.ts" ] && [ -f "public/index.html" ]; then
    echo "${GREEN}✅ Source files present${NC}\n"
    ((SUCCESS++))
else
    echo "${RED}❌ Source files missing${NC}\n"
    ((ERRORS++))
fi

# Check scripts
echo "${BLUE}🔍 Checking startup scripts...${NC}"
if [ -x "start.sh" ] && [ -x "ngrok.sh" ]; then
    echo "${GREEN}✅ Scripts are executable${NC}\n"
    ((SUCCESS++))
else
    echo "${YELLOW}⚠️  Scripts not executable${NC}"
    echo "${YELLOW}   Run: chmod +x start.sh ngrok.sh${NC}\n"
    ((WARNINGS++))
fi

# Summary
echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo "${CYAN}║              Summary                       ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"

echo "${GREEN}✅ Passed:   ${SUCCESS}${NC}"
echo "${YELLOW}⚠️  Warnings: ${WARNINGS}${NC}"
echo "${RED}❌ Errors:   ${ERRORS}${NC}\n"

if [ $ERRORS -eq 0 ]; then
    echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo "${CYAN}║         🎉 Ready to Start! 🎉             ║${NC}"
    echo "${CYAN}╚════════════════════════════════════════════╝${NC}\n"
    
    echo "${GREEN}Next steps:${NC}"
    if [ $WARNINGS -gt 0 ] && [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
        echo "${YELLOW}1. Set your API key:${NC}"
        echo "   ${BLUE}export ALPHA_VANTAGE_API_KEY=your_key_here${NC}\n"
        echo "${YELLOW}2. Start the server:${NC}"
        echo "   ${BLUE}./start.sh${NC}\n"
    else
        echo "${YELLOW}1. Start the server:${NC}"
        echo "   ${BLUE}./start.sh${NC}\n"
    fi
    echo "${YELLOW}3. Open in browser:${NC}"
    echo "   ${BLUE}http://localhost:3000${NC}\n"
    
    if command -v ngrok &> /dev/null; then
        echo "${YELLOW}4. (Optional) Expose via ngrok:${NC}"
        echo "   ${BLUE}./ngrok.sh${NC}\n"
    fi
else
    echo "${RED}╔════════════════════════════════════════════╗${NC}"
    echo "${RED}║      ⚠️  Setup Issues Detected ⚠️         ║${NC}"
    echo "${RED}╚════════════════════════════════════════════╝${NC}\n"
    
    echo "${YELLOW}Please fix the errors above before starting the app.${NC}\n"
    exit 1
fi

