# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              index.html (ChatGPT App)                     │ │
│  │                                                           │ │
│  │  • On Load: window.openai.callTool('topMovers', {...})   │ │
│  │  • Renders responsive tables (DaisyUI + Tailwind)        │ │
│  │  • Anime.js animations                                   │ │
│  │  • Dark mode theme                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            │ HTTP POST                          │
│                            ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
┌─────────────────────────────────────────────────────────────────┐
│                   Express Server (Node.js)                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    MCP Server                             │ │
│  │                                                           │ │
│  │  Routes:                                                  │ │
│  │  • GET  /                  → Serve index.html            │ │
│  │  • GET  /mcp/tools/list    → List available tools        │ │
│  │  • POST /mcp/tools/call    → Execute tool                │ │
│  │                                                           │ │
│  │  Tool:                                                    │ │
│  │  • topMovers(limit) → Fetch stock data                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            │ HTTP GET                           │
│                            ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    Alpha Vantage API                            │
│                                                                 │
│  Endpoint: TOP_GAINERS_LOSERS                                   │
│  Returns: top_gainers[], top_losers[], most_actively_traded[]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (`public/index.html`)

**Technology Stack:**
- HTML5
- Tailwind CSS
- DaisyUI (UI components)
- Anime.js (animations)
- Vanilla JavaScript

**Key Features:**
- **Auto-load**: Automatically calls `window.openai.callTool()` when page loads
- **Mock OpenAI API**: Falls back to direct HTTP calls for standalone testing
- **Responsive Tables**: Three tables for gainers, losers, and most active
- **Animations**: 
  - Loading dots with bouncing animation
  - Fade-in for table sections
  - Staggered row animations
- **Color Coding**: Green for gains, red for losses
- **Refresh Control**: Manual refresh with configurable limit

**Flow:**
1. Page loads
2. Calls `window.openai.callTool('topMovers', { limit: 10 })`
3. Receives data
4. Renders three responsive tables
5. Applies animations

### 2. Backend (`src/server.ts`)

**Technology Stack:**
- TypeScript
- Express.js
- @modelcontextprotocol/sdk
- Axios (HTTP client)
- CORS enabled

**MCP Tool Definition:**
```typescript
{
  name: 'topMovers',
  description: 'Get top gaining, losing, and most actively traded stocks',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Number of results per category',
        default: 10
      }
    }
  }
}
```

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Serve frontend HTML |
| GET | /mcp/tools/list | List available MCP tools |
| POST | /mcp/tools/call | Execute MCP tool |

**Request Format:**
```json
POST /mcp/tools/call
{
  "name": "topMovers",
  "arguments": { "limit": 10 }
}
```

**Response Format:**
```json
{
  "metadata": "Top Gainers, Losers, and Most Actively Traded US Tickers",
  "last_updated": "2024-01-01T12:00:00",
  "top_gainers": [
    {
      "ticker": "AAPL",
      "price": "150.25",
      "change_amount": "5.75",
      "change_percentage": "3.98%",
      "volume": "82451920"
    }
  ],
  "top_losers": [...],
  "most_actively_traded": [...]
}
```

### 3. Alpha Vantage Integration

**API Endpoint:**
```
https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=YOUR_KEY
```

**Rate Limits:**
- Free tier: 5 requests/minute, 500 requests/day
- Premium tiers available

**Data Processing:**
1. Fetch data from Alpha Vantage
2. Parse JSON response
3. Limit results based on user input
4. Return formatted data

### 4. MCP (Model Context Protocol) Integration

**SDK Usage:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
```

**Server Configuration:**
- **Name**: "MCP Top Movers App"
- **Version**: "1.0.0"
- **Capabilities**: Tools support
- **Transport**: HTTP (Express) + optional stdio

**Tool Registration:**
- Handler for `ListToolsRequestSchema`
- Handler for `CallToolRequestSchema`
- Returns results in MCP format

## Data Flow

### Complete Request-Response Cycle

```
1. User opens browser
   │
   ├─► Browser loads index.html
   │
2. Page load event triggers
   │
   ├─► JavaScript calls window.openai.callTool('topMovers', { limit: 10 })
   │
3. Mock/Real OpenAI API
   │
   ├─► POST http://localhost:3000/mcp/tools/call
   │   Body: { name: 'topMovers', arguments: { limit: 10 } }
   │
4. Express server receives request
   │
   ├─► MCP handler processes tool call
   │
5. fetchTopMovers() function executes
   │
   ├─► GET https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS
   │
6. Alpha Vantage responds with data
   │
   ├─► Parse and limit results
   │
7. Server returns formatted JSON
   │
   ├─► Response: { top_gainers: [...], top_losers: [...], ... }
   │
8. Browser receives data
   │
   ├─► renderTable() for each category
   │
9. Tables appear with animations
   │
   └─► User sees stock data with color coding
```

## Security Considerations

### API Key Management
- ✅ Uses environment variables (not hardcoded)
- ✅ Never exposed to client-side
- ✅ Server-side only access

### CORS
- ✅ CORS enabled for development
- ⚠️  Should be restricted in production

### Input Validation
- ✅ Limit parameter validated (1-20)
- ✅ Tool name validation
- ✅ Error handling for invalid requests

### Error Handling
```typescript
try {
  // API call
} catch (error: any) {
  console.error('Error:', error.message);
  res.status(500).json({ error: error.message });
}
```

## Scalability Considerations

### Current Limitations
- Single process (no clustering)
- No caching (hits API on every request)
- Synchronous request handling

### Potential Improvements

**1. Caching Layer**
```typescript
// Add Redis caching
const cachedData = await redis.get('topMovers');
if (cachedData) return JSON.parse(cachedData);

// Cache for 5 minutes
await redis.setex('topMovers', 300, JSON.stringify(data));
```

**2. Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 requests per minute
});

app.use('/mcp/tools/call', limiter);
```

**3. Clustering**
```typescript
import cluster from 'cluster';
import os from 'os';

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

## Deployment Options

### 1. Local Development
```bash
npm run dev
# Server at http://localhost:3000
```

### 2. Local with ngrok
```bash
# Terminal 1
./start.sh

# Terminal 2
./ngrok.sh
# Public URL: https://abc123.ngrok.io
```

### 3. Cloud Deployment

**Heroku:**
```bash
heroku create mcp-top-movers
heroku config:set ALPHA_VANTAGE_API_KEY=your_key
git push heroku main
```

**Vercel:**
```bash
vercel --env ALPHA_VANTAGE_API_KEY=your_key
```

**AWS EC2:**
```bash
# On EC2 instance
export ALPHA_VANTAGE_API_KEY=your_key
npm install
npm run build
npm start
```

### 4. Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance Metrics

### Expected Response Times
- Frontend load: < 1s
- API call to server: < 100ms
- Alpha Vantage API: 1-3s
- Total: ~1-4s from page load to display

### Optimization Opportunities
1. **Caching**: Reduce API calls by 90%+
2. **Compression**: Enable gzip for smaller payloads
3. **CDN**: Serve static assets from CDN
4. **Minification**: Reduce HTML/CSS/JS size
5. **Lazy Loading**: Load tables progressively

## Testing

### Manual Testing
```bash
# Test server endpoint
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"topMovers","arguments":{"limit":5}}'
```

### Automated Testing (Future)
```typescript
// Jest tests
describe('topMovers tool', () => {
  it('should return formatted data', async () => {
    const result = await fetchTopMovers(5);
    expect(result.top_gainers).toHaveLength(5);
  });
});
```

## Monitoring

### Logging
- Server startup/shutdown
- API requests (tool calls)
- Errors with stack traces
- Alpha Vantage API responses

### Metrics to Track
- Request count per minute
- Average response time
- Error rate
- API quota usage

## Future Enhancements

1. **Real-time Updates**: WebSocket for live data
2. **Charts**: Add Chart.js visualizations
3. **Filtering**: Filter by sector, market cap
4. **Favorites**: Save favorite stocks
5. **Alerts**: Price/change alerts
6. **Historical Data**: Show trends over time
7. **Authentication**: User accounts
8. **Multiple Markets**: Support international exchanges

---

**Built with ❤️ using TypeScript, Express, and the Model Context Protocol**

