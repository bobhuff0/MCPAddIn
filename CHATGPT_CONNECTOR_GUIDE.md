# 🔌 ChatGPT Connector Integration Guide

## ✅ Your Server is Ready!

**Your ngrok URL:** `https://subhorizontal-ortho-vada.ngrok-free.dev`

**Server Status:** ✅ Running with real-time stock data  
**MCP Tools:** ✅ `topMovers` tool available  
**API Key:** ✅ Loaded and working  

---

## 🎯 **Step-by-Step ChatGPT Integration**

### **Step 1: Open ChatGPT**

1. Go to **ChatGPT** (chat.openai.com)
2. Click **"Create"** → **"Custom GPT"**
3. Click **"Configure"** tab

### **Step 2: Add Connector**

1. Scroll down to **"Connectors"** section
2. Click **"Add Connector"**
3. Select **"MCP Server"** (if available) or **"Custom"**

### **Step 3: Configure MCP Server URL**

**In the "MCP Server URL" field, enter:**
```
https://subhorizontal-ortho-vada.ngrok-free.dev
```

**NOT** `/mcp/tools/call` - just the base URL!

### **Step 4: Test Connection**

ChatGPT should automatically:
1. ✅ **Discover** your MCP server
2. ✅ **List** available tools (`topMovers`)
3. ✅ **Test** the connection

---

## 🧪 **Verify Your Server is Working**

### **Test 1: MCP Discovery**
```bash
curl https://subhorizontal-ortho-vada.ngrok-free.dev/mcp
```

### **Test 2: List Tools**
```bash
curl https://subhorizontal-ortho-vada.ngrok-free.dev/mcp/tools/list
```

### **Test 3: Call Tool**
```bash
curl -X POST https://subhorizontal-ortho-vada.ngrok-free.dev/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":3}}'
```

---

## 🎨 **ChatGPT Usage Examples**

Once connected, you can ask ChatGPT:

### **Stock Market Queries:**
- "Show me the top 5 stock gainers today"
- "What are the biggest losers in the market?"
- "Give me the most actively traded stocks"
- "What's happening with RANI stock?" (it's up 248%!)

### **Expected Responses:**
ChatGPT will call your `topMovers` tool and return:
- **Top Gainers**: RANI (+248%), ARTV (+116%), etc.
- **Top Losers**: AUUDW (-53%), WTO (-47%), etc.
- **Most Active**: RANI (482M volume), BYND (419M volume)

---

## 🔧 **Troubleshooting**

### **If ChatGPT Can't Connect:**

#### **Option 1: Try Different URLs**
```
https://subhorizontal-ortho-vada.ngrok-free.dev
https://subhorizontal-ortho-vada.ngrok-free.dev/mcp
https://subhorizontal-ortho-vada.ngrok-free.dev/mcp/tools/list
```

#### **Option 2: Check ngrok Status**
```bash
open http://127.0.0.1:4040
```
Look for:
- ✅ Tunnel is active
- ✅ No errors
- ✅ Requests coming through

#### **Option 3: Add OAuth Security**
```bash
./start-ngrok-oauth.sh your@email.com 3000
```

---

## 🎯 **Alternative: ChatGPT Actions**

If MCP connector doesn't work, use **ChatGPT Actions** instead:

### **Step 1: Create Custom GPT**
1. Go to **ChatGPT** → **Create** → **Custom GPT**
2. Click **"Configure"** → **"Actions"**

### **Step 2: Add OpenAPI Schema**
```yaml
openapi: 3.1.0
info:
  title: Stock Market Top Movers API
  description: Get real-time top gaining, losing, and most actively traded stocks
  version: 1.0.0
servers:
  - url: https://subhorizontal-ortho-vada.ngrok-free.dev
    description: MCP Stock Market Server
paths:
  /mcp/tools/call:
    post:
      operationId: getTopMovers
      summary: Get top stock market movers
      description: Fetches top gainers, losers, and most actively traded stocks
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
                arguments:
                  type: object
                  properties:
                    limit:
                      type: number
                      description: Number of results per category
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
                  top_losers:
                    type: array
                    items:
                      type: object
                  most_actively_traded:
                    type: array
                    items:
                      type: object
```

### **Step 3: Test Action**
Ask ChatGPT: "Show me the top 3 stock gainers"

---

## 📋 **Quick Reference**

### **Your Server Details:**
- **URL**: `https://subhorizontal-ortho-vada.ngrok-free.dev`
- **Tool**: `topMovers`
- **Data**: Real-time stock market data
- **Source**: Alpha Vantage API

### **ChatGPT Connector Settings:**
- **MCP Server URL**: `https://subhorizontal-ortho-vada.ngrok-free.dev`
- **Authentication**: None (or OAuth if you added it)
- **Tools Available**: `topMovers`

### **Test Commands:**
```bash
# Check if server is accessible
curl https://subhorizontal-ortho-vada.ngrok-free.dev/mcp/tools/list

# Test tool execution
curl -X POST https://subhorizontal-ortho-vada.ngrok-free.dev/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":3}}'
```

---

## 🚀 **Next Steps**

1. ✅ **Server is running** with real stock data
2. ✅ **ngrok is exposing** your server
3. 🔄 **Add to ChatGPT** connector
4. 🧪 **Test with queries** like "Show me top gainers"
5. 🎉 **Enjoy your MCP integration!**

---

## 💡 **Pro Tips**

1. **Keep ngrok running** - connection breaks if ngrok stops
2. **URL changes** - if you restart ngrok, update ChatGPT connector
3. **Test locally first** - verify endpoints work before connecting
4. **Check logs** - watch ngrok dashboard for requests

---

**Your MCP server is ready for ChatGPT integration!** 🎉

Use this URL in ChatGPT connector:
```
https://subhorizontal-ortho-vada.ngrok-free.dev
```
