# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Get Your Alpha Vantage API Key

1. Visit https://www.alphavantage.co/support/#api-key
2. Enter your email to get a free API key
3. Set it as an environment variable:

```bash
export ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**Tip:** Add this to your `~/.zshrc` or `~/.bash_profile` to make it permanent:
```bash
echo 'export ALPHA_VANTAGE_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

### 2. Start the Server

Make the startup script executable and run it:

```bash
chmod +x start.sh
./start.sh
```

The server will start on `http://localhost:3000`

### 3. (Optional) Expose with ngrok

To make your app accessible externally:

**Terminal 1 (Keep the server running):**
```bash
./start.sh
```

**Terminal 2 (Start ngrok):**
```bash
chmod +x ngrok.sh
./ngrok.sh
```

ngrok will provide a public URL like `https://abc123.ngrok.io`

## 📱 Using the App

1. Open `http://localhost:3000` in your browser
2. The app will automatically load top movers data on page load
3. Adjust the "Results per category" slider to show more/fewer results
4. Click the "🔄 Refresh" button to update the data

## 🛠️ Development

### Run in development mode (auto-reload):
```bash
npm run dev
```

### Build TypeScript:
```bash
npm run build
```

### Watch mode (auto-build on changes):
```bash
npm run watch
```

## 📊 How It Works

1. **On Page Load**: The frontend calls `window.openai.callTool('topMovers', { limit: 10 })`
2. **MCP Server**: Receives the request and calls the Alpha Vantage API
3. **Alpha Vantage**: Returns top gainers, losers, and most actively traded stocks
4. **Frontend**: Renders the data in responsive tables with animations

## 🔧 Troubleshooting

### "API key not set" warning
- Set the `ALPHA_VANTAGE_API_KEY` environment variable
- Restart your terminal or run `source ~/.zshrc`

### Port 3000 already in use
```bash
PORT=3001 ./start.sh
```

### ngrok not found
```bash
brew install ngrok
```

## 📚 Learn More

- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Full README](./README.md)

## 🎉 That's It!

You're now running a ChatGPT-powered stock market dashboard!

