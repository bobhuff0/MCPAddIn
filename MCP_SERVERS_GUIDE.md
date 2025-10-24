# MCP Servers Guide

This project contains **four MCP (Model Context Protocol) servers** that can be used with ChatGPT or other AI assistants:

## 📊 1. Stock Market MCP Server (Port 3000)

**Purpose**: Get real-time top gainers, losers, and most actively traded stocks from Alpha Vantage.

**Tools:**
- `topMovers` - Get top gaining, losing, and most actively traded stocks

**Requirements:**
- `ALPHA_VANTAGE_API_KEY` environment variable

**Start:**
```bash
./start.sh
# or
npm run start
```

**Files:**
- Source: `src/server.ts`
- Build: `dist/server.js`
- Public: `public/index.html`

---

## 💱 2. Currency Converter MCP Server (Port 3001)

**Purpose**: Convert between all major world currencies using real-time exchange rates.

**Tools:**
- `convertCurrency` - Convert an amount from one currency to another
- `getSupportedCurrencies` - Get list of all supported currency codes
- `getExchangeRates` - Get all exchange rates for a base currency

**Features:**
- 160+ world currencies supported
- Real-time exchange rates
- Free API (no key required) or use API key for higher limits
- Optional: `EXCHANGE_RATE_API_KEY` environment variable

**Start:**
```bash
./start-currency.sh
# or
npm run start-currency
```

**Files:**
- Source: `src/currency-server.ts`
- Build: `dist/currency-server.js`
- Public: `public-currency/index.html`

**Supported Currencies Include:**
- USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, CHF
- And 150+ more world currencies

---

## 🌍 3. World Time Converter MCP Server (Port 3002)

**Purpose**: Convert time between timezones and get current time anywhere in the world.

**Tools:**
- `convertTime` - Convert time from one timezone to another
- `getCurrentTime` - Get current time in a specific timezone
- `getSupportedTimezones` - Get list of all supported timezones
- `getWorldClocks` - Get current time in multiple timezones at once

**Features:**
- 30+ major world timezones
- DST (Daylight Saving Time) detection
- UTC offset calculation
- No API key required

**Start:**
```bash
./start-time.sh
# or
npm run start-time
```

**Files:**
- Source: `src/time-server.ts`
- Build: `dist/time-server.js`
- Public: `public-time/index.html`

**Supported Timezones Include:**
- US: New York, Chicago, Denver, Los Angeles, Alaska, Hawaii
- Europe: London, Paris, Berlin, Rome, Madrid, Moscow
- Asia: Dubai, India, Bangkok, Singapore, Hong Kong, Tokyo, Seoul, Shanghai
- Oceania: Sydney, Melbourne, Auckland
- Americas: Toronto, Vancouver, Mexico City, São Paulo, Buenos Aires
- Africa: Cairo, Johannesburg

---

## 📏 4. Units & Measurements Converter MCP Server (Port 3003)

**Purpose**: Convert between different units of measurement across 10 categories.

**Tools:**
- `convertUnits` - Convert between different units of measurement
- `getSupportedUnits` - Get list of supported units for a category
- `getCategories` - Get list of all available unit categories

**Categories:**
1. **Length**: meter, kilometer, mile, foot, inch, yard, etc.
2. **Weight**: kilogram, gram, pound, ounce, ton, stone, etc.
3. **Temperature**: Celsius, Fahrenheit, Kelvin
4. **Volume**: liter, gallon, milliliter, cup, tablespoon, etc.
5. **Area**: square meter, square mile, hectare, acre, etc.
6. **Speed**: m/s, km/h, mph, knot, etc.
7. **Pressure**: pascal, bar, psi, atmosphere, etc.
8. **Energy**: joule, calorie, kilowatt-hour, BTU, etc.
9. **Power**: watt, kilowatt, horsepower, etc.
10. **Data**: byte, kilobyte, megabyte, gigabyte, terabyte, bit, etc.

**Features:**
- 70+ different units
- Automatic category detection
- No API key required

**Start:**
```bash
./start-units.sh
# or
npm run start-units
```

**Files:**
- Source: `src/units-server.ts`
- Build: `dist/units-server.js`
- Public: `public-units/index.html`

---

## 🚀 Quick Start - All Servers

### Start All Servers at Once:
```bash
./start-all-servers.sh
```

This will start all four MCP servers in the background:
- Stock Market on port 3000
- Currency Converter on port 3001
- World Time on port 3002
- Units Converter on port 3003

### Stop All Servers:
```bash
./stop-all-servers.sh
```

### Individual Server Commands:
```bash
# Build all servers
npm run build

# Development mode (with auto-reload)
npm run dev              # Stock Market
npm run dev-currency     # Currency
npm run dev-time         # Time
npm run dev-units        # Units

# Production mode
npm run start            # Stock Market
npm run start-currency   # Currency
npm run start-time       # Time
npm run start-units      # Units
```

---

## 🔌 MCP Protocol Endpoints

All servers implement the MCP protocol with these endpoints:

### Discovery:
- `GET /mcp` - Get server info and capabilities

### Tools:
- `GET /mcp/tools/list` - List available tools
- `POST /mcp/tools/call` - Call a specific tool

### ChatGPT Integration:
- `POST /mcp` - MCP JSON-RPC endpoint for ChatGPT

---

## 📝 Using with ChatGPT

1. **Expose via ngrok:**
   ```bash
   ngrok http 3001  # or 3002, 3003
   ```

2. **Add to ChatGPT:**
   - Go to ChatGPT Settings > Actions
   - Add your ngrok URL: `https://your-ngrok-url.ngrok.io/mcp`
   - The server will auto-register its tools

3. **Use the tools:**
   - "Convert 100 USD to EUR"
   - "What time is it in Tokyo?"
   - "Convert 10 miles to kilometers"

---

## 🛠️ Development

### File Structure:
```
src/
  ├── server.ts           # Stock Market MCP
  ├── currency-server.ts  # Currency Converter MCP
  ├── time-server.ts      # World Time MCP
  └── units-server.ts     # Units Converter MCP

dist/
  ├── server.js
  ├── currency-server.js
  ├── time-server.js
  └── units-server.js

public/                   # Stock Market UI
public-currency/          # Currency Converter UI
public-time/              # World Time UI
public-units/             # Units Converter UI
```

### Build:
```bash
npm run build
```

This compiles all TypeScript files in `src/` to JavaScript in `dist/`.

---

## 🌐 Web Interfaces

Each server comes with a beautiful DaisyUI + Tailwind dark mode interface:

- **Stock Market**: http://localhost:3000
- **Currency**: http://localhost:3001
- **Time**: http://localhost:3002
- **Units**: http://localhost:3003

All interfaces include:
- Beautiful gradient backgrounds
- Animated UI elements (using anime.js)
- Dark mode by default
- Responsive design
- Interactive forms and results

---

## 📦 Dependencies

```json
{
  "@modelcontextprotocol/sdk": "MCP SDK for protocol implementation",
  "express": "Web server framework",
  "cors": "Cross-origin resource sharing",
  "axios": "HTTP client (for stock and currency APIs)",
  "typescript": "TypeScript compiler",
  "ts-node": "TypeScript execution for development"
}
```

---

## 🔑 Environment Variables

### Required:
- `ALPHA_VANTAGE_API_KEY` - For Stock Market server only

### Optional:
- `EXCHANGE_RATE_API_KEY` - For higher limits on currency API (free tier works without it)
- `PORT` - Override default port for any server

### Setup:
```bash
# Copy example
cp env.example .env

# Edit with your keys
nano .env

# Or set in shell
export ALPHA_VANTAGE_API_KEY="your-key-here"
```

---

## 📊 API Examples

### Currency Converter:
```bash
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertCurrency","arguments":{"from":"USD","to":"EUR","amount":100}}'
```

### World Time:
```bash
curl -X POST http://localhost:3002/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"getCurrentTime","arguments":{"timezone":"America/New_York"}}'
```

### Units Converter:
```bash
curl -X POST http://localhost:3003/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertUnits","arguments":{"from":"meter","to":"foot","value":100}}'
```

---

## 🐛 Troubleshooting

### Server won't start:
- Check if port is already in use: `lsof -i :3001`
- Make sure dependencies are installed: `npm install`
- Build TypeScript: `npm run build`

### Build errors:
- Delete `dist/` and `node_modules/`, then:
  ```bash
  npm install
  npm run build
  ```

### Can't access from ngrok:
- Make sure server is running locally first
- Check ngrok is forwarding to correct port
- Verify CORS is enabled (it is by default)

---

## 📄 License

ISC

---

## 👨‍💻 Author

Created as part of the MCP AddIn project for ChatGPT integration.


