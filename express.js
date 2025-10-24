const express = require('express');
const app = express();
app.use(express.json());

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
              schema: { type: "string" }
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

app.listen(3000, () => {
  console.log("MCP server running on port 3000");
});
