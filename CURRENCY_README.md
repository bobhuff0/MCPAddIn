# 💱 MCP Currency Converter App

A minimal TypeScript ChatGPT App using the Model Context Protocol (MCP) SDK with Express to provide real-time currency conversion for 160+ currencies.

## ✨ Features

- 💱 **Real-time Currency Conversion**: Convert between 160+ currencies
- 🔄 **Live Exchange Rates**: Up-to-date rates from exchangerate-api.com
- 🎨 **Beautiful UI**: Dark mode with DaisyUI, Tailwind CSS, and Anime.js
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🚀 **MCP Integration**: Uses @modelcontextprotocol/sdk
- 🆓 **Free to Use**: No API key required (free tier: 1500 requests/month)
- ⚡ **Auto-convert**: Real-time conversion as you type
- 📊 **Live Rates Table**: View exchange rates for major currencies

## 🎯 Quick Start

### 1. Start the Server

```bash
chmod +x start-currency.sh
./start-currency.sh
```

### 2. Open in Browser

```
http://localhost:3001
```

That's it! No API key required for basic usage.

## 🔧 Optional: Use API Key for Unlimited Access

To remove the 1500 requests/month limit:

1. Get a free API key at: https://www.exchangerate-api.com/
2. Set the environment variable:
   ```bash
   export EXCHANGE_RATE_API_KEY=your_key_here
   ```
3. Restart the server

## 📊 MCP Tools Available

### 1. `convertCurrency`
Converts an amount from one currency to another.

**Parameters:**
- `from` (string): Source currency code (e.g., "USD")
- `to` (string): Target currency code (e.g., "EUR")
- `amount` (number): Amount to convert

**Example:**
```javascript
await window.openai.callTool('convertCurrency', {
  from: 'USD',
  to: 'EUR',
  amount: 100
});
// Returns: { from: 'USD', to: 'EUR', amount: 100, result: 92.50, rate: 0.925, timestamp: '...' }
```

### 2. `getSupportedCurrencies`
Gets a list of all supported currency codes.

**Example:**
```javascript
await window.openai.callTool('getSupportedCurrencies', {});
// Returns: { currencies: { USD: 'US Dollar', EUR: 'Euro', ... }, count: 161 }
```

### 3. `getExchangeRates`
Gets all exchange rates for a base currency.

**Parameters:**
- `base` (string): Base currency code (e.g., "USD")

**Example:**
```javascript
await window.openai.callTool('getExchangeRates', { base: 'USD' });
// Returns: { base: 'USD', rates: { EUR: 0.925, GBP: 0.79, ... }, timestamp: '...' }
```

## 🎨 Features Breakdown

### Auto-load Functionality
- Page automatically calls `window.openai.callTool('convertCurrency', ...)` on load
- Real-time conversion as you type or change currencies
- Instant results with smooth animations

### Converter Interface
- Select from/to currencies from dropdown
- Enter amount to convert
- See instant results
- Swap currencies with one click
- Popular conversion shortcuts

### Live Exchange Rates Table
- Shows rates for major currencies
- Updates every 60 seconds
- Based on selected "from" currency

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adapts to any screen size

## 🏗️ Architecture

```
Browser
  └─► window.openai.callTool('convertCurrency', { from, to, amount })
        └─► POST http://localhost:3001/mcp/tools/call
              └─► MCP Server (currency-server.ts)
                    └─► GET https://open.er-api.com/v6/latest/{currency}
                          └─► Exchange Rate API
                                └─► Returns real-time rates
```

## 📁 Files

- **src/currency-server.ts**: MCP server with currency conversion tools
- **public-currency/index.html**: ChatGPT app frontend
- **start-currency.sh**: Startup script
- **dist/currency-server.js**: Compiled JavaScript

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Serve currency converter UI |
| GET | /mcp/tools/list | List available MCP tools |
| POST | /mcp/tools/call | Execute MCP tool |

## 📝 Example Request

```bash
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "convertCurrency",
    "arguments": {
      "from": "USD",
      "to": "EUR",
      "amount": 100
    }
  }'
```

**Response:**
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "result": 92.50,
  "rate": 0.925,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 💡 Popular Currency Pairs

The app includes quick-access buttons for:
- USD → EUR
- EUR → USD
- GBP → USD
- USD → JPY
- USD → CNY
- EUR → GBP
- AUD → USD
- USD → INR

## 🎯 Supported Currencies

160+ currencies including:
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **JPY** - Japanese Yen
- **AUD** - Australian Dollar
- **CAD** - Canadian Dollar
- **CHF** - Swiss Franc
- **CNY** - Chinese Yuan
- **INR** - Indian Rupee
- And 150+ more!

## 🔧 Development

### Build TypeScript
```bash
npm run build
```

### Run in Development Mode
```bash
npm run dev-currency
```

### Expose with ngrok
```bash
ngrok http 3001
```

## 🐛 Troubleshooting

### Port 3001 in use
```bash
PORT=3002 node dist/currency-server.js
```

### API rate limit exceeded
- Get a free API key at https://www.exchangerate-api.com/
- Set `EXCHANGE_RATE_API_KEY` environment variable

### Currency not found
- Check that you're using 3-letter ISO currency codes (e.g., USD, EUR)
- Use `getSupportedCurrencies` to see all available currencies

## 📚 Technologies Used

### Backend
- TypeScript
- Express.js
- @modelcontextprotocol/sdk
- Axios
- exchangerate-api.com

### Frontend
- HTML5
- Tailwind CSS
- DaisyUI
- Anime.js
- Vanilla JavaScript

## 🌟 Future Enhancements

- [ ] Historical exchange rate charts
- [ ] Favorite currency pairs
- [ ] Offline mode with cached rates
- [ ] Currency converter calculator
- [ ] Multi-currency conversion (convert to multiple currencies at once)
- [ ] Rate alerts

## 📄 License

MIT

---

**Built with ❤️ using TypeScript, Express, and the Model Context Protocol**

