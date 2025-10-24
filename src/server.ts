import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import path from 'path';

const APP_NAME = 'MCP Top Movers App';
const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

interface TopMoversResponse {
  metadata: string;
  last_updated: string;
  top_gainers: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
  top_losers: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
  most_actively_traded: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve the ChatGPT app HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (name !== 'topMovers') {
      return res.status(400).json({ error: 'Unknown tool' });
    }

    const limit = args?.limit || 10;
    const result = await fetchTopMovers(limit);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error calling tool:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Stock Market MCP</title></head>
    <body style="font-family:sans-serif;max-width:600px;margin:50px auto;padding:20px;">
      <h1>📊 Stock Market MCP Server</h1>
      <p>✅ Server is running</p>
      <p><strong>Status:</strong> OK</p>
      <p><strong>Version:</strong> 1.0.0</p>
      <p><strong>Endpoints:</strong></p>
      <ul>
        <li>MCP: <code>/mcp</code></li>
        <li>OpenAPI: <code>/openapi.json</code></li>
      </ul>
    </body></html>
  `);
});

// OpenAPI schema for ChatGPT Actions
app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: "3.1.0",
    info: {
      title: "Stock Market API",
      description: "Get top gainers, losers and active stocks",
      version: "1.0.0"
    },
    servers: [{ url: `https://${req.get('host')}` }],
    paths: {
      "/stocks": {
        get: {
          operationId: "getTopMovers",
          summary: "Get top market movers",
          parameters: [{
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 3, minimum: 1, maximum: 5 },
            description: "Results per category"
          }],
          responses: {
            "200": {
              description: "Stock data",
              content: {
                "text/plain": {
                  schema: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  });
});

// Simple stock endpoint for ChatGPT Actions
app.get('/stocks', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 3, 3);
    const result = await fetchTopMovers(limit);
    const summary = formatStockSummary(result);
    res.type('text/plain').send(summary);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// MCP Discovery endpoint (for ChatGPT)
app.get('/mcp', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "StockMCP",
        version: "1.0.0"
      }
    }
  });
});

// ChatGPT MCP Connector endpoint
app.post('/mcp', (req, res) => {
  const { method, params, id } = req.body;
  
  console.log('MCP Request:', JSON.stringify({ method, params, id }));
  
  if (method === "initialize") {
    // Handle MCP initialization
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "Stock Market MCP",
          version: "1.0.0"
        }
      }
    });
  } else if (method === "tools/list") {
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        tools: [
          {
            name: "topMovers",
            description: "Get top gainers, losers & active stocks",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Results per category",
                  default: 3,
                  minimum: 1,
                  maximum: 5
                }
              }
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    if (name === "topMovers") {
      // Limit to max 3 results to keep response size minimal
      const limit = Math.min(args?.limit || 3, 3);
      fetchTopMovers(limit)
        .then(result => {
          // Format response as concise text instead of full JSON
          const summary = formatStockSummary(result);
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: summary
                }
              ]
            }
          });
        })
        .catch(error => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32603,
              message: error.message
            }
          });
        });
    } else {
      res.json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32601,
          message: `Unknown tool: ${name}`
        }
      });
    }
  } else {
    console.error('Unknown MCP method:', method);
    res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }
});

// List available tools
app.get('/mcp/tools/list', (req, res) => {
  res.json({
    tools: [
      {
        name: 'topMovers',
        description: 'Get top gaining, losing, and most actively traded stocks from Alpha Vantage',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of results to return for each category (default: 10)',
              default: 10
            }
          }
        }
      }
    ]
  });
});

// MCP Protocol endpoint (alternative format)
app.get('/mcp/protocol', (req, res) => {
  res.json({
    jsonrpc: '2.0',
    result: {
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: APP_NAME,
        version: '1.0.0'
      }
    }
  });
});

function formatStockSummary(data: TopMoversResponse): string {
  let summary = `📊 Market Update\n\n`;
  
  summary += `🚀 GAINERS:\n`;
  data.top_gainers.forEach((stock, i) => {
    summary += `${i+1}. ${stock.ticker} $${stock.price} ${stock.change_percentage}\n`;
  });
  
  summary += `\n📉 LOSERS:\n`;
  data.top_losers.forEach((stock, i) => {
    summary += `${i+1}. ${stock.ticker} $${stock.price} ${stock.change_percentage}\n`;
  });
  
  summary += `\n🔥 ACTIVE:\n`;
  data.most_actively_traded.forEach((stock, i) => {
    const vol = (parseInt(stock.volume) / 1000000).toFixed(0);
    summary += `${i+1}. ${stock.ticker} $${stock.price} ${vol}M\n`;
  });
  
  return summary;
}

async function fetchTopMovers(limit: number = 10): Promise<TopMoversResponse> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY environment variable not set');
  }

  const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Limit results
    return {
      metadata: data.metadata || 'Top Gainers, Losers, and Most Actively Traded US Tickers',
      last_updated: data.last_updated || new Date().toISOString(),
      top_gainers: data.top_gainers?.slice(0, limit) || [],
      top_losers: data.top_losers?.slice(0, limit) || [],
      most_actively_traded: data.most_actively_traded?.slice(0, limit) || []
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch top movers: ${error.message}`);
  }
}

// Create MCP Server (for stdio transport if needed)
const mcpServer = new Server(
  {
    name: APP_NAME,
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register MCP handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'topMovers',
        description: 'Get top gaining, losing, and most actively traded stocks from Alpha Vantage',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of results to return for each category (default: 10)',
              default: 10
            }
          }
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'topMovers') {
    const limit = (request.params.arguments as any)?.limit || 10;
    const result = await fetchTopMovers(limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\x1b[32m✓ Server running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Make sure to expose via ngrok: ngrok http ${PORT}\x1b[0m`);
  if (!ALPHA_VANTAGE_API_KEY) {
    console.log(`\x1b[33m⚠ Warning: ALPHA_VANTAGE_API_KEY not set\x1b[0m`);
  }
});

// For stdio transport (if running as MCP server)
async function runStdioServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('\x1b[32m✓ MCP Server running on stdio\x1b[0m');
}

// Uncomment to run as stdio server
// runStdioServer().catch(console.error);

