// server.js
const express = require('express');
const app = express();
app.use(express.json());

// MCP route expected by ChatGPT
app.post('/mcp', (req, res) => {
  res.json({
    openapi: "3.1.0",
    info: {
      title: "Market Movers API",
      version: "1.0.0"
    },
    paths: {
      "/stock-price": {
        get: {
          operationId: "getStockPrice",
          summary: "Get stock price by symbol",
          parameters: [
            {
              name: "symbol",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "Ticker symbol, e.g., AAPL"
            }
          ],
          responses: {
            "200": {
              description: "Stock price data",
              content: {
                "application/json": {
                  example: {
                    symbol: "AAPL",
                    price: 179.23,
                    currency: "USD"
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

// Simulated endpoint for stock price
app.get('/stock-price', (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  const mockPrices = {
    AAPL: 179.23,
    TSLA: 243.50,
    MSFT: 329.10,
    NVDA: 456.90
  };

  if (!symbol || !mockPrices[symbol]) {
    return res.status(404).json({ error: "Stock not found" });
  }

  res.json({
    symbol,
    price: mockPrices[symbol],
    currency: "USD"
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`MCP server running at http://localhost:${port}`);
});
