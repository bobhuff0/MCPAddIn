# MCP ChatGPT App - Multi-Server Suite

A comprehensive TypeScript ChatGPT App suite using the Model Context Protocol (MCP) SDK with Express. This project includes **four powerful MCP servers** for different use cases.

## 🎯 Available MCP Servers

1. **📊 Stock Market MCP** (Port 3000) - Real-time top movers from Alpha Vantage
2. **💱 Currency Converter MCP** (Port 3001) - Convert between 160+ world currencies
3. **🌍 World Time MCP** (Port 3002) - Convert time across global timezones
4. **📏 Units Converter MCP** (Port 3003) - Convert measurements across 10 categories

## Features

- 🚀 **MCP Server Integration**: Uses @modelcontextprotocol/sdk to expose tools
- 🎨 **Beautiful UI**: Dark mode with DaisyUI, Tailwind CSS, and Anime.js animations
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔄 **Real-time Data**: Live data from various APIs
- 🌐 **Ngrok Ready**: Easy to expose via ngrok for external access
- ⚡ **Multi-Server Support**: Run all servers simultaneously or individually

## Prerequisites

- Node.js (v16 or higher)
- Alpha Vantage API key (free at https://www.alphavantage.co/support/#api-key) - **Required for Stock Market server only**
- ngrok (for external access) - optional

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Alpha Vantage API key
   # Or set it as a system environment variable
   export ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

3. **Build the TypeScript project:**
   ```bash
   npm run build
   ```

## Running the Servers

### Quick Start - All Servers

Start all four servers at once:

```bash
./start-all-servers.sh
```

This starts:
- Stock Market MCP on http://localhost:3000
- Currency Converter MCP on http://localhost:3001
- World Time MCP on http://localhost:3002
- Units Converter MCP on http://localhost:3003

Stop all servers:

```bash
./stop-all-servers.sh
```

### Individual Servers

Start servers individually using their dedicated scripts:

```bash
./start.sh           # Stock Market (Port 3000)
./start-currency.sh  # Currency Converter (Port 3001)
./start-time.sh      # World Time (Port 3002)
./start-units.sh     # Units Converter (Port 3003)
```

### Using NPM Scripts

Development mode (with auto-reload):

```bash
npm run dev              # Stock Market
npm run dev-currency     # Currency Converter
npm run dev-time         # World Time
npm run dev-units        # Units Converter
```

Production mode:

```bash
npm run start            # Stock Market
npm run start-currency   # Currency Converter
npm run start-time       # World Time
npm run start-units      # Units Converter
```

## Exposing with ngrok

To make your servers accessible externally (e.g., for ChatGPT integration):

```bash
ngrok http 3000  # Stock Market
ngrok http 3001  # Currency Converter
ngrok http 3002  # World Time
ngrok http 3003  # Units Converter
```

ngrok will provide you with a public URL that you can use to access your server.

## Architecture

### 1. Stock Market MCP Server (`src/server.ts`)

**MCP Tools:**
- `topMovers` - Fetches top gainers, losers, and most actively traded stocks

**Endpoints:**
- `GET /` - Serves the web interface
- `POST /mcp` - MCP JSON-RPC endpoint
- `GET /mcp/tools/list` - Lists available tools
- `POST /mcp/tools/call` - Calls MCP tools

**Frontend:** `public/index.html`

### 2. Currency Converter MCP Server (`src/currency-server.ts`)

**MCP Tools:**
- `convertCurrency` - Convert between currencies
- `getSupportedCurrencies` - List all supported currencies
- `getExchangeRates` - Get all rates for a base currency

**Features:**
- 160+ world currencies
- Real-time exchange rates
- Free API (no key required)

**Frontend:** `public-currency/index.html`

### 3. World Time MCP Server (`src/time-server.ts`)

**MCP Tools:**
- `convertTime` - Convert time between timezones
- `getCurrentTime` - Get current time in a timezone
- `getSupportedTimezones` - List all supported timezones
- `getWorldClocks` - Get time in multiple timezones

**Features:**
- 30+ major world timezones
- DST detection
- UTC offset calculation

**Frontend:** `public-time/index.html`

### 4. Units Converter MCP Server (`src/units-server.ts`)

**MCP Tools:**
- `convertUnits` - Convert between different units
- `getSupportedUnits` - List units by category
- `getCategories` - List all unit categories

**Features:**
- 10 categories (length, weight, temperature, volume, area, speed, pressure, energy, power, data)
- 70+ different units
- Automatic category detection

**Frontend:** `public-units/index.html`

### Common Features

All servers include:
- **Express Server**: Serves the frontend and handles API requests
- **MCP Protocol**: Full MCP JSON-RPC 2.0 implementation
- **CORS Enabled**: Ready for cross-origin requests
- **Beautiful UI**: Dark mode with DaisyUI, Tailwind CSS, and Anime.js
- **ChatGPT Ready**: Compatible with ChatGPT Actions

## API Usage Examples

### Stock Market MCP

```bash
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":5}}'
```

### Currency Converter MCP

```bash
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertCurrency","arguments":{"from":"USD","to":"EUR","amount":100}}'
```

### World Time MCP

```bash
curl -X POST http://localhost:3002/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"getCurrentTime","arguments":{"timezone":"America/New_York"}}'
```

### Units Converter MCP

```bash
curl -X POST http://localhost:3003/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertUnits","arguments":{"from":"meter","to":"foot","value":100}}'
```

### MCP JSON-RPC Format

All servers support the MCP protocol via POST to `/mcp`:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "convertCurrency",
      "arguments": {"from": "USD", "to": "EUR", "amount": 100}
    }
  }'
```

## Technologies Used

- **Backend**:
  - TypeScript
  - Express.js
  - @modelcontextprotocol/sdk
  - Axios
  - Alpha Vantage API

- **Frontend**:
  - HTML5
  - Tailwind CSS
  - DaisyUI
  - Anime.js
  - Vanilla JavaScript

## 📚 Documentation

For detailed information about each server:

- **[MCP_SERVERS_GUIDE.md](MCP_SERVERS_GUIDE.md)** - Comprehensive guide for all servers
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[CHATGPT_INTEGRATION.md](CHATGPT_INTEGRATION.md)** - ChatGPT integration guide

## Troubleshooting

### API Key Issues

If you see a warning about `ALPHA_VANTAGE_API_KEY not set`:
- This only affects the Stock Market server
- Make sure you've set the environment variable
- Check that your `.env` file is in the project root
- Verify the API key is valid at https://www.alphavantage.co/

### Port Already in Use

If a port is already in use, you can either:
1. Stop the process using that port: `lsof -i :3000` then `kill <PID>`
2. Set a different port: `PORT=3005 npm run dev`

### Build Errors

If you encounter build errors:
```bash
rm -rf dist node_modules
npm install
npm run build
```

### CORS Issues

All servers are configured with CORS enabled. If you still experience issues, check your browser console for specific CORS errors.

### Server Won't Start

Make sure all dependencies are installed and TypeScript is built:
```bash
npm install
npm run build
./start-all-servers.sh
```

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

ISC

