# 🚀 MCP ChatGPT App - START HERE

## 📋 What You Have

A fully functional **TypeScript ChatGPT App** using the **Model Context Protocol (MCP) SDK** with:

✅ **Express server** exposing MCP tools via REST API  
✅ **topMovers tool** that fetches real-time stock data from Alpha Vantage  
✅ **Beautiful ChatGPT app frontend** with dark mode, responsive tables, and animations  
✅ **Auto-load functionality** using `window.openai.callTool('topMovers', { limit })`  
✅ **ngrok integration** for easy external access  
✅ **Complete documentation** and helper scripts  

---

## 🎯 Quick Start (3 Steps)

### Step 1: Get API Key
```bash
# Visit: https://www.alphavantage.co/support/#api-key
# Then set it:
export ALPHA_VANTAGE_API_KEY=your_key_here
```

### Step 2: Start Server
```bash
./start.sh
```

### Step 3: Open Browser
```
http://localhost:3000
```

**That's it!** 🎉

---

## 📁 Project Structure

```
MCPAddIn/
├── 📄 START_HERE.md           ← You are here!
├── 📄 QUICKSTART.md            ← 3-step quick start
├── 📄 SETUP_COMPLETE.md        ← Detailed setup guide
├── 📄 ARCHITECTURE.md          ← Technical architecture
├── 📄 README.md                ← Full documentation
│
├── 🔧 Configuration
│   ├── package.json            ← Dependencies
│   ├── tsconfig.json           ← TypeScript config
│   ├── env.example             ← Environment variables example
│   └── requirements.txt        ← Package list
│
├── 💻 Source Code
│   ├── src/
│   │   └── server.ts           ← MCP server + Express + topMovers tool
│   └── public/
│       └── index.html          ← ChatGPT app frontend
│
├── 🛠️ Scripts
│   ├── start.sh                ← Start the server
│   ├── ngrok.sh                ← Expose via ngrok
│   └── test-setup.sh           ← Verify setup
│
└── 📦 Build Output
    └── dist/
        └── server.js           ← Compiled JavaScript
```

---

## 🎨 What the App Does

### Frontend (index.html)
1. **Auto-loads** on page open
2. **Calls** `window.openai.callTool('topMovers', { limit: 10 })`
3. **Displays** three responsive tables:
   - 🚀 **Top Gainers** (stocks with biggest gains)
   - 📉 **Top Losers** (stocks with biggest losses)
   - 🔥 **Most Actively Traded** (highest volume stocks)
4. **Features**:
   - Dark mode with gradient hero
   - Color-coded changes (green/red)
   - Smooth animations (Anime.js)
   - Responsive design (mobile-friendly)
   - Adjustable result limits
   - Manual refresh button

### Backend (server.ts)
1. **Serves** the ChatGPT app frontend
2. **Exposes MCP tool**: `topMovers(limit)`
3. **Fetches data** from Alpha Vantage API
4. **Formats results** and returns JSON
5. **Handles errors** gracefully

---

## 🧪 Test Your Setup

Run the verification script:
```bash
./test-setup.sh
```

This checks:
- ✅ Node.js & npm installed
- ✅ TypeScript installed
- ✅ Dependencies installed
- ✅ Build compiled
- ✅ API key set
- ✅ ngrok available
- ✅ Scripts executable

---

## 🌐 Using ngrok

**Terminal 1** (Keep running):
```bash
./start.sh
```

**Terminal 2**:
```bash
./ngrok.sh
```

You'll get a public URL like:
```
https://abc123.ngrok.io
```

Share this URL or use it for ChatGPT integration!

---

## 📊 Example API Call

### Using the Tool
```javascript
// In ChatGPT app context
const data = await window.openai.callTool('topMovers', { limit: 10 });

console.log(data);
// {
//   metadata: "Top Gainers, Losers, and Most Actively Traded...",
//   last_updated: "2024-01-01T12:00:00",
//   top_gainers: [...],
//   top_losers: [...],
//   most_actively_traded: [...]
// }
```

### Direct HTTP Call
```bash
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "topMovers",
    "arguments": { "limit": 5 }
  }'
```

---

## 🎯 What Each File Does

| File | Purpose |
|------|---------|
| **START_HERE.md** | This overview guide |
| **QUICKSTART.md** | 3-step quick start instructions |
| **SETUP_COMPLETE.md** | Detailed setup and feature list |
| **ARCHITECTURE.md** | Technical architecture and data flow |
| **README.md** | Complete documentation |
| **src/server.ts** | MCP server implementation |
| **public/index.html** | ChatGPT app frontend |
| **start.sh** | Startup script with colored output |
| **ngrok.sh** | ngrok tunnel helper |
| **test-setup.sh** | Setup verification |

---

## 🔑 Important Environment Variables

```bash
# Required
export ALPHA_VANTAGE_API_KEY=your_key_here

# Optional
export PORT=3000  # Default: 3000
```

**Make it permanent** (add to `~/.zshrc`):
```bash
echo 'export ALPHA_VANTAGE_API_KEY=your_key' >> ~/.zshrc
source ~/.zshrc
```

---

## 🎓 Key Technologies

### Backend
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web server
- **@modelcontextprotocol/sdk** - MCP implementation
- **Axios** - HTTP client
- **Alpha Vantage API** - Stock market data

### Frontend
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **DaisyUI** - UI components
- **Anime.js** - Animations
- **Vanilla JS** - Logic

---

## 📱 Screenshot Preview

When you open `http://localhost:3000`, you'll see:

```
┌─────────────────────────────────────────────────┐
│  📈 Top Movers Dashboard                        │
│  Real-time stock market gainers, losers...      │
│  [Results: 10] [🔄 Refresh]                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  🚀 Top Gainers                                 │
│  ┌─────┬────────┬────────┬─────────┬──────────┐│
│  │Tick │ Price  │ Change │ Change% │  Volume  ││
│  ├─────┼────────┼────────┼─────────┼──────────┤│
│  │AAPL │$150.25 │ +$5.75 │  +3.98% │82,451,920││
│  │TSLA │$245.80 │+$12.30 │  +5.27% │95,234,510││
│  │...  │   ...  │  ...   │   ...   │    ...   ││
│  └─────┴────────┴────────┴─────────┴──────────┘│
└─────────────────────────────────────────────────┘

[Similar tables for Top Losers and Most Active]
```

---

## 🆘 Troubleshooting

### "API key not set"
```bash
export ALPHA_VANTAGE_API_KEY=your_key
./start.sh
```

### Port 3000 in use
```bash
PORT=3001 ./start.sh
```

### Dependencies missing
```bash
npm install
npm run build
```

### ngrok not found
```bash
brew install ngrok
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Dev mode (auto-reload)
npm run dev

# Production mode
npm start

# Watch mode (auto-rebuild)
npm run watch

# Verify setup
./test-setup.sh
```

---

## 📚 Documentation Guide

**New user?** Read in this order:
1. ✅ **START_HERE.md** (you are here)
2. **QUICKSTART.md** - Get running in 3 steps
3. **SETUP_COMPLETE.md** - Learn all features
4. **README.md** - Full reference

**Developer?** Read these:
1. **ARCHITECTURE.md** - System design
2. **src/server.ts** - Backend code
3. **public/index.html** - Frontend code

---

## 🎉 You're Ready!

Everything is set up and ready to go!

### Next Actions:

1. **Get API key** from Alpha Vantage (free)
2. **Export it**: `export ALPHA_VANTAGE_API_KEY=your_key`
3. **Start server**: `./start.sh`
4. **Open browser**: `http://localhost:3000`
5. **See live stock data!** 📈

### Optional:
- Run `./ngrok.sh` for public access
- Read `ARCHITECTURE.md` to understand the system
- Customize `public/index.html` to change the UI
- Add more tools to `src/server.ts`

---

## 💡 Pro Tips

1. **Permanent API Key**: Add to `~/.zshrc` so you don't have to export it every time
2. **Rate Limits**: Free tier has 5 req/min, 500/day - add caching if needed
3. **Customize UI**: Edit `public/index.html` - it uses DaisyUI + Tailwind
4. **Add Tools**: Extend `src/server.ts` with more MCP tools
5. **Deploy**: Use Heroku, Vercel, or AWS for production

---

## 🔗 Useful Links

- **Alpha Vantage API**: https://www.alphavantage.co/documentation/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **DaisyUI Components**: https://daisyui.com/
- **Anime.js**: https://animejs.com/

---

## ✨ Features at a Glance

✅ TypeScript for type safety  
✅ Express.js REST API  
✅ MCP SDK integration  
✅ Alpha Vantage stock data  
✅ Auto-load on page open  
✅ Responsive dark mode UI  
✅ Smooth animations  
✅ Color-coded changes  
✅ Adjustable result limits  
✅ Manual refresh  
✅ ngrok ready  
✅ Error handling  
✅ Helper scripts  
✅ Complete documentation  

---

**Happy Trading! 📈📊**

Questions? Check the README.md or ARCHITECTURE.md!

