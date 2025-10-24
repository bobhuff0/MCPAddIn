# MCP Servers Quick Reference

## 🚀 Quick Commands

### Start All Servers
```bash
./start-all-servers.sh
```

### Stop All Servers
```bash
./stop-all-servers.sh
```

### Individual Server Scripts
```bash
./start.sh           # Stock Market (Port 3000)
./start-currency.sh  # Currency (Port 3001)
./start-time.sh      # Time (Port 3002)
./start-units.sh     # Units (Port 3003)
```

### Build & Development
```bash
npm run build              # Build all TypeScript
npm run dev               # Dev: Stock Market
npm run dev-currency      # Dev: Currency
npm run dev-time          # Dev: Time
npm run dev-units         # Dev: Units
```

---

## 📊 Stock Market MCP (Port 3000)

**Tools:**
- `topMovers` - Get top gainers, losers, and most active stocks

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":5}}'
```

**Requires:** `ALPHA_VANTAGE_API_KEY`

---

## 💱 Currency Converter MCP (Port 3001)

**Tools:**
- `convertCurrency` - Convert between currencies
- `getSupportedCurrencies` - List all currencies
- `getExchangeRates` - Get rates for a base currency

**Example:**
```bash
# Convert 100 USD to EUR
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertCurrency","arguments":{"from":"USD","to":"EUR","amount":100}}'
```

**No API key required** (uses free API)

---

## 🌍 World Time MCP (Port 3002)

**Tools:**
- `convertTime` - Convert time between timezones
- `getCurrentTime` - Get current time in timezone
- `getSupportedTimezones` - List all timezones
- `getWorldClocks` - Get multiple timezone clocks

**Examples:**
```bash
# Get current time in New York
curl -X POST http://localhost:3002/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"getCurrentTime","arguments":{"timezone":"America/New_York"}}'

# Convert time between timezones
curl -X POST http://localhost:3002/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertTime","arguments":{"fromTimezone":"America/New_York","toTimezone":"Europe/London"}}'
```

**No API key required**

---

## 📏 Units Converter MCP (Port 3003)

**Tools:**
- `convertUnits` - Convert between units
- `getSupportedUnits` - List units by category
- `getCategories` - List all categories

**Categories:**
- length, weight, temperature, volume, area
- speed, pressure, energy, power, data

**Examples:**
```bash
# Convert 100 meters to feet
curl -X POST http://localhost:3003/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertUnits","arguments":{"from":"meter","to":"foot","value":100}}'

# Convert temperature
curl -X POST http://localhost:3003/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertUnits","arguments":{"from":"celsius","to":"fahrenheit","value":0}}'
```

**No API key required**

---

## 🌐 Web Interfaces

- Stock Market: http://localhost:3000
- Currency: http://localhost:3001
- Time: http://localhost:3002
- Units: http://localhost:3003

---

## 🔌 Common MCP Endpoints

All servers support:

- `GET /mcp` - Server info and capabilities
- `POST /mcp` - MCP JSON-RPC endpoint (for ChatGPT)
- `GET /mcp/tools/list` - List available tools
- `POST /mcp/tools/call` - Call a tool directly

---

## 🔑 Environment Variables

### Required:
- `ALPHA_VANTAGE_API_KEY` - Stock Market server only

### Optional:
- `EXCHANGE_RATE_API_KEY` - Currency converter (free tier works without)
- `PORT` - Override default port

### Setup:
```bash
export ALPHA_VANTAGE_API_KEY="your-key-here"
```

---

## 🐛 Common Issues

### Port in use:
```bash
lsof -i :3000        # Find process
kill <PID>           # Stop it
```

### Build errors:
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Dependencies missing:
```bash
npm install
```

---

## 📦 Project Structure

```
src/
  ├── server.ts           # Stock Market
  ├── currency-server.ts  # Currency
  ├── time-server.ts      # Time
  └── units-server.ts     # Units

dist/                     # Built JavaScript files

public/                   # Stock Market UI
public-currency/          # Currency UI
public-time/              # Time UI
public-units/             # Units UI

start-*.sh                # Startup scripts
```

---

## 🎯 ChatGPT Integration

1. Start a server
2. Expose with ngrok: `ngrok http 3001`
3. Add ngrok URL to ChatGPT: `https://your-url.ngrok.io/mcp`
4. Use in ChatGPT: "Convert 100 USD to EUR"

---

## 📚 Full Documentation

- [MCP_SERVERS_GUIDE.md](MCP_SERVERS_GUIDE.md) - Complete guide
- [README.md](README.md) - Main documentation
- [CHATGPT_INTEGRATION.md](CHATGPT_INTEGRATION.md) - ChatGPT setup

---

## ⚡ Pro Tips

1. **Run all servers:** Use `./start-all-servers.sh` to start everything
2. **Check logs:** When using start-all-servers.sh, logs are in `./logs/`
3. **Build once:** `npm run build` builds all servers at once
4. **Dev mode:** Use `npm run dev-*` for development with auto-reload
5. **Stop gracefully:** Use `./stop-all-servers.sh` to stop all servers properly


