# 💱 Currency Converter - Quick Start

## 🚀 Get Started in 2 Steps

### Step 1: Start the Server

```bash
./start-currency.sh
```

### Step 2: Open Browser

```
http://localhost:3001
```

**That's it!** 🎉 No API key required!

---

## 💡 How It Works

1. **Auto-loads** on page open
2. **Calls** `window.openai.callTool('convertCurrency', { from: 'USD', to: 'EUR', amount: 100 })`
3. **Displays** real-time conversion results
4. **Updates** as you type or change currencies

---

## 🎯 Features

- ✅ Convert between 160+ currencies
- ✅ Real-time exchange rates
- ✅ Auto-convert as you type
- ✅ Popular currency pair shortcuts
- ✅ Live exchange rates table
- ✅ Beautiful dark mode UI
- ✅ Responsive mobile design
- ✅ No API key required (free tier)

---

## 🔄 Usage Examples

### Basic Conversion
1. Select **From** currency (e.g., USD)
2. Enter **Amount** (e.g., 100)
3. Select **To** currency (e.g., EUR)
4. See instant result!

### Quick Conversions
Click any popular pair button:
- **USD → EUR**
- **EUR → USD**
- **GBP → USD**
- **USD → JPY**

### Swap Currencies
Click the **🔄 Swap** button to reverse the conversion

---

## 📊 Example API Calls

### JavaScript (in ChatGPT app)
```javascript
// Convert 100 USD to EUR
const result = await window.openai.callTool('convertCurrency', {
  from: 'USD',
  to: 'EUR',
  amount: 100
});

console.log(result);
// { from: 'USD', to: 'EUR', amount: 100, result: 92.50, rate: 0.925, ... }
```

### cURL
```bash
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "convertCurrency",
    "arguments": { "from": "USD", "to": "EUR", "amount": 100 }
  }'
```

---

## 🌐 Expose with ngrok

**Terminal 1** (Keep running):
```bash
./start-currency.sh
```

**Terminal 2**:
```bash
ngrok http 3001
```

You'll get a public URL like: `https://abc123.ngrok.io`

---

## 🆓 Free vs Paid API

### Free Tier (Default - No Key Required)
- ✅ 1500 requests/month
- ✅ 160+ currencies
- ✅ Real-time rates
- ✅ No registration needed

### Unlimited (Optional API Key)
- ✅ Unlimited requests
- ✅ Higher reliability
- ✅ Priority support

**To upgrade:**
1. Get free key: https://www.exchangerate-api.com/
2. Set it: `export EXCHANGE_RATE_API_KEY=your_key`
3. Restart server

---

## 💱 Supported Currencies

Major currencies include:
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇬🇧 GBP - British Pound
- 🇯🇵 JPY - Japanese Yen
- 🇦🇺 AUD - Australian Dollar
- 🇨🇦 CAD - Canadian Dollar
- 🇨🇭 CHF - Swiss Franc
- 🇨🇳 CNY - Chinese Yuan
- 🇮🇳 INR - Indian Rupee
- And 150+ more!

---

## 🎨 UI Features

- **Dark Mode**: Beautiful gradient theme
- **Live Updates**: Auto-refresh every 60 seconds
- **Smooth Animations**: Anime.js transitions
- **Responsive**: Works on all devices
- **Color Coding**: Success green for results

---

## 🔧 Troubleshooting

**Port 3001 already in use?**
```bash
PORT=3002 ./start-currency.sh
```

**Dependencies missing?**
```bash
npm install
npm run build
./start-currency.sh
```

**Rate limit exceeded?**
- Get a free API key (unlimited)
- Or wait for the monthly reset

---

## 📚 Learn More

- **Full Documentation**: See `CURRENCY_README.md`
- **API Details**: https://www.exchangerate-api.com/docs
- **MCP SDK**: https://modelcontextprotocol.io/

---

**Happy Converting! 💱**

