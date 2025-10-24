# 🤖 ChatGPT Integration Guide

## How to Connect Your MCP Server to ChatGPT

### 🎯 Quick Answer

**Your ChatGPT Action URL:**
```
https://YOUR-NGROK-URL.ngrok-free.app/mcp/tools/call
```

---

## 📋 Step-by-Step Integration

### Step 1: Start Your Server

```bash
./start.sh
# Server runs on http://localhost:3000
```

### Step 2: Expose via ngrok

```bash
# In a new terminal
ngrok http 3000

# You'll get a URL like:
# https://abc123-xyz.ngrok-free.app
```

### Step 3: Get Your Public URL

```bash
./get-ngrok-url.sh
# Copy the URL shown
```

---

## 🔌 ChatGPT Custom GPT Setup

### Method A: Using Actions (Recommended)

1. **Go to ChatGPT** → Create a Custom GPT
2. **Configure** → Actions
3. **Add Schema** → Use this OpenAPI schema:

```yaml
openapi: 3.1.0
info:
  title: Stock Market Top Movers API
  description: Get real-time top gaining, losing, and most actively traded stocks
  version: 1.0.0
servers:
  - url: https://YOUR-NGROK-URL.ngrok-free.app
    description: MCP Stock Market Server
paths:
  /mcp/tools/call:
    post:
      operationId: getTopMovers
      summary: Get top stock market movers
      description: Fetches top gainers, losers, and most actively traded stocks from Alpha Vantage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  enum: [topMovers]
                  description: The tool name to call
                arguments:
                  type: object
                  properties:
                    limit:
                      type: number
                      description: Number of results per category (default 10)
                      default: 10
              required:
                - name
      responses:
        '200':
          description: Successful response with stock data
          content:
            application/json:
              schema:
                type: object
                properties:
                  metadata:
                    type: string
                  last_updated:
                    type: string
                  top_gainers:
                    type: array
                    items:
                      type: object
                      properties:
                        ticker:
                          type: string
                        price:
                          type: string
                        change_amount:
                          type: string
                        change_percentage:
                          type: string
                        volume:
                          type: string
                  top_losers:
                    type: array
                    items:
                      type: object
                  most_actively_traded:
                    type: array
                    items:
                      type: object
```

4. **Replace** `YOUR-NGROK-URL` with your actual ngrok URL
5. **Test** the action
6. **Save** your Custom GPT

---

## 🌐 Alternative: Direct API Integration

### For Currency Converter:

**URL:** `https://YOUR-NGROK-URL.ngrok-free.app/mcp/tools/call`

**OpenAPI Schema:**
```yaml
openapi: 3.1.0
info:
  title: Currency Converter API
  version: 1.0.0
servers:
  - url: https://YOUR-NGROK-URL.ngrok-free.app
paths:
  /mcp/tools/call:
    post:
      operationId: convertCurrency
      summary: Convert currency between 160+ currencies
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  enum: [convertCurrency]
                arguments:
                  type: object
                  properties:
                    from:
                      type: string
                      description: Source currency (e.g., USD)
                    to:
                      type: string
                      description: Target currency (e.g., EUR)
                    amount:
                      type: number
                      description: Amount to convert
              required:
                - name
                - arguments
      responses:
        '200':
          description: Conversion result
```

---

## 🧪 Test Your Integration

### Test with curl:

```bash
# Replace with your ngrok URL
curl -X POST https://YOUR-NGROK-URL.ngrok-free.app/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "topMovers",
    "arguments": {
      "limit": 5
    }
  }'
```

### Expected Response:

```json
{
  "metadata": "Top Gainers, Losers, and Most Actively Traded US Tickers",
  "last_updated": "2024-01-01T12:00:00",
  "top_gainers": [...],
  "top_losers": [...],
  "most_actively_traded": [...]
}
```

---

## 📝 ChatGPT Prompts to Use

Once integrated, you can ask ChatGPT:

**For Stock Market App:**
- "Show me the top 5 stock gainers today"
- "What are the most actively traded stocks?"
- "Give me the top losers in the market"

**For Currency Converter:**
- "Convert 100 USD to EUR"
- "What's the exchange rate between GBP and JPY?"
- "How much is 500 CAD in AUD?"

---

## 🔒 Security Notes

### ngrok Free Tier Limitations:
- ⚠️ URL changes every time you restart ngrok
- ⚠️ Limited connections per minute
- ⚠️ Public URL is exposed to internet

### For Production:
1. **Deploy to a cloud service** (Heroku, Vercel, AWS)
2. **Use a custom domain**
3. **Add authentication** (API keys, OAuth)
4. **Rate limiting**

---

## 🎯 Quick Setup Checklist

- [ ] Start your app: `./start.sh`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Copy ngrok URL: `./get-ngrok-url.sh`
- [ ] Go to ChatGPT → Create Custom GPT
- [ ] Add Action with OpenAPI schema above
- [ ] Replace `YOUR-NGROK-URL` with your ngrok URL
- [ ] Test the action
- [ ] Start chatting!

---

## 💡 Pro Tips

1. **Keep ngrok running**: Your ChatGPT integration only works while ngrok is active
2. **Update URL**: When you restart ngrok, update your ChatGPT Action URL
3. **Test locally first**: Use `curl` to verify endpoints work before connecting to ChatGPT
4. **Check logs**: Watch your server terminal for incoming requests

---

## 🐛 Troubleshooting

### "Action failed to execute"
- Check if ngrok is still running
- Verify the URL hasn't changed
- Test with curl first

### "Cannot connect to server"
- Ensure `./start.sh` is running
- Check ngrok tunnel is active
- Verify no firewall blocking

### "Invalid response format"
- Check server logs for errors
- Verify API key is set: `echo $ALPHA_VANTAGE_API_KEY`
- Test endpoint with curl

---

## 📚 More Resources

- **OpenAPI Spec**: https://spec.openapis.org/oas/latest.html
- **ChatGPT Actions Docs**: https://platform.openai.com/docs/actions
- **ngrok Docs**: https://ngrok.com/docs

---

**Ready to connect to ChatGPT!** 🚀

Follow the steps above to integrate your MCP server with ChatGPT Actions!

