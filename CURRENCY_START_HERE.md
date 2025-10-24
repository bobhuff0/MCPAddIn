# 💱 Currency Converter App - START HERE

## 🎉 Your Currency Converter is Ready!

A fully functional **TypeScript ChatGPT App** using the **Model Context Protocol SDK** for real-time currency conversion.

---

## 🚀 Quick Start (2 Steps)

### Step 1: Start Server
```bash
./start-currency.sh
```

### Step 2: Open Browser
```
http://localhost:3001
```

**Done!** 🎉 No API key needed!

---

## ✨ What You Get

### 💱 Currency Converter
- **Real-time conversion** between 160+ currencies
- **Auto-convert** as you type
- **Popular pairs** quick-access buttons
- **Swap** currencies with one click
- **No API key required** (free tier: 1500 req/month)

### 📊 Live Exchange Rates
- **Real-time rates** for major currencies
- **Auto-refresh** every 60 seconds
- **Base currency** selector

### 🎨 Beautiful UI
- **Dark mode** with gradient theme
- **Responsive design** works on all devices
- **Smooth animations** with Anime.js
- **Color-coded results** in success green

---

## 🛠️ MCP Tools Available

### 1. `convertCurrency`
```javascript
await window.openai.callTool('convertCurrency', {
  from: 'USD',
  to: 'EUR',
  amount: 100
});
// Returns: { from: 'USD', to: 'EUR', amount: 100, result: 92.50, rate: 0.925, ... }
```

### 2. `getSupportedCurrencies`
```javascript
await window.openai.callTool('getSupportedCurrencies', {});
// Returns: { currencies: {...}, count: 161 }
```

### 3. `getExchangeRates`
```javascript
await window.openai.callTool('getExchangeRates', { base: 'USD' });
// Returns: { base: 'USD', rates: {...}, timestamp: '...' }
```

---

## 💡 How It Works

1. **Page loads** → Frontend auto-calls `window.openai.callTool('convertCurrency', ...)`
2. **MCP Server** receives request via Express
3. **Exchange Rate API** provides real-time rates
4. **Results displayed** in beautiful responsive tables

---

## 🌐 Expose with ngrok

**Terminal 1:**
```bash
./start-currency.sh
```

**Terminal 2:**
```bash
ngrok http 3001
```

Share the public URL!

---

## 📚 Documentation

- **CURRENCY_QUICKSTART.md** - Quick start guide
- **CURRENCY_README.md** - Full documentation
- **APPS_OVERVIEW.md** - Compare with stock market app

---

## 🎯 Popular Features

### Quick Conversions
One-click buttons for:
- USD → EUR
- EUR → USD  
- GBP → USD
- USD → JPY
- USD → CNY
- And more!

### Supported Currencies
160+ currencies including:
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇬🇧 GBP - British Pound
- 🇯🇵 JPY - Japanese Yen
- 🇦🇺 AUD - Australian Dollar
- 🇨🇦 CAD - Canadian Dollar
- 🇨🇭 CHF - Swiss Franc
- 🇨🇳 CNY - Chinese Yuan
- 🇮🇳 INR - Indian Rupee

---

## 🔧 Optional: Unlimited Access

**Free tier:** 1500 requests/month (no key required)

**Upgrade to unlimited:**
1. Get free API key: https://www.exchangerate-api.com/
2. Set environment variable:
   ```bash
   export EXCHANGE_RATE_API_KEY=your_key_here
   ```
3. Restart server

---

## 📁 Files

```
MCPAddIn/
├── src/currency-server.ts      # MCP server with 3 tools
├── public-currency/index.html  # ChatGPT app frontend
├── start-currency.sh           # Easy startup
├── CURRENCY_README.md          # Full docs
└── CURRENCY_QUICKSTART.md      # Quick guide
```

---

## 🎨 UI Screenshot Preview

```
┌─────────────────────────────────────────┐
│  💱 Currency Converter                  │
│  Real-time exchange rates for 160+...  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Convert Currency                       │
│                                         │
│  From: [USD ▼]     To: [EUR ▼]        │
│  Amount: [100]     Result: 92.50 EUR   │
│                                         │
│  [🔄 Swap]        [Convert]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Exchange Rate: 0.925000                │
│  100.00 USD = 92.50 EUR                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Popular Conversions                    │
│  [USD→EUR] [EUR→USD] [GBP→USD] [USD→JPY]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Live Exchange Rates (Base: USD)        │
│  EUR: 0.925  |  1 USD = 0.9250 EUR     │
│  GBP: 0.790  |  1 USD = 0.7900 GBP     │
│  JPY: 149.50 |  1 USD = 149.50 JPY     │
└─────────────────────────────────────────┘
```

---

## 🔥 Features Summary

✅ **3 MCP Tools** - convertCurrency, getSupportedCurrencies, getExchangeRates  
✅ **Auto-load** - Calls `window.openai.callTool()` on page load  
✅ **Real-time rates** - Up-to-date exchange rates  
✅ **160+ currencies** - Comprehensive coverage  
✅ **No API key** - Free tier works out of the box  
✅ **Beautiful UI** - Dark mode with DaisyUI + Tailwind  
✅ **Responsive** - Mobile-friendly design  
✅ **Animations** - Smooth Anime.js transitions  
✅ **Popular pairs** - Quick-access buttons  
✅ **Live rates table** - Auto-refresh every 60s  
✅ **Swap function** - Reverse conversion easily  
✅ **TypeScript** - Type-safe code  
✅ **Express** - Clean REST API  
✅ **MCP SDK** - Standard protocol  

---

## 🆚 Compare with Stock Market App

| Feature | Currency | Stock Market |
|---------|----------|--------------|
| **Port** | 3001 | 3000 |
| **API Key** | Optional | Required |
| **Tools** | 3 | 1 |
| **Free Tier** | 1500/mo | 5/min |
| **Startup** | ./start-currency.sh | ./start.sh |

---

## 💪 What's Next?

1. ✅ App is running
2. 🎨 Customize the UI (edit `public-currency/index.html`)
3. 🛠️ Add more MCP tools (edit `src/currency-server.ts`)
4. 🚀 Deploy to production
5. 📊 Add charts for historical rates
6. ⭐ Add favorite currency pairs

---

## 🐛 Troubleshooting

**Port in use?**
```bash
PORT=3002 ./start-currency.sh
```

**Dependencies missing?**
```bash
npm install
npm run build
```

**Rate limit?**
- Get free unlimited API key
- Or wait for monthly reset

---

**Happy Converting! 💱**

Questions? Check **CURRENCY_README.md** for full documentation!

