# DuckDB MCP Server - Usage Examples

## Overview

The DuckDB MCP server provides an in-memory analytical database with full SQL support. This guide demonstrates practical usage examples.

## Quick Start

### 1. Start the Server

```bash
# Development mode
npm run dev-duckdb

# Production mode
PORT=3005 node dist/duckdb-server.js

# Or use PM2
pm2 start ecosystem.config.js --only duckdb-mcp
```

### 2. Access the Web Interface

Open http://localhost:3005 in your browser for an interactive SQL interface.

## API Examples

### Example 1: Create a Table

Create a products table with schema:

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "createTable",
    "arguments": {
      "tableName": "products",
      "columns": [
        {"name": "id", "type": "INTEGER", "constraints": "PRIMARY KEY"},
        {"name": "name", "type": "VARCHAR(100)"},
        {"name": "price", "type": "DECIMAL(10,2)"},
        {"name": "category", "type": "VARCHAR(50)"},
        {"name": "stock", "type": "INTEGER"}
      ],
      "ifNotExists": true
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Table 'products' created successfully",
  "tableName": "products",
  "columns": [...]
}
```

### Example 2: Insert Data

Insert multiple products:

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "insertData",
    "arguments": {
      "tableName": "products",
      "data": [
        {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics", "stock": 15},
        {"id": 2, "name": "Mouse", "price": 29.99, "category": "Electronics", "stock": 50},
        {"id": 3, "name": "Keyboard", "price": 79.99, "category": "Electronics", "stock": 30},
        {"id": 4, "name": "Desk Chair", "price": 199.99, "category": "Furniture", "stock": 10},
        {"id": 5, "name": "Monitor", "price": 299.99, "category": "Electronics", "stock": 20}
      ]
    }
  }'
```

### Example 3: Execute SQL Queries

#### Simple SELECT

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "executeQuery",
    "arguments": {
      "query": "SELECT * FROM products ORDER BY price DESC"
    }
  }'
```

#### Aggregations

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "executeQuery",
    "arguments": {
      "query": "SELECT category, COUNT(*) as count, SUM(price) as total_value, AVG(price) as avg_price FROM products GROUP BY category"
    }
  }'
```

#### Filtering

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "executeQuery",
    "arguments": {
      "query": "SELECT * FROM products WHERE price > 100 AND stock < 20"
    }
  }'
```

### Example 4: Export Data

#### Export to JSON

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "exportData",
    "arguments": {
      "query": "SELECT name, price, category FROM products WHERE price > 100",
      "format": "json"
    }
  }'
```

#### Export to CSV

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "exportData",
    "arguments": {
      "query": "SELECT * FROM products",
      "format": "csv"
    }
  }'
```

### Example 5: Table Management

#### List All Tables

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "listTables",
    "arguments": {}
  }'
```

#### Describe Table Schema

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "describeTable",
    "arguments": {
      "tableName": "products"
    }
  }'
```

#### Drop Table

```bash
curl -X POST http://localhost:3005/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dropTable",
    "arguments": {
      "tableName": "products",
      "ifExists": true
    }
  }'
```

## Real-World Use Cases

### Use Case 1: Sales Analytics

```sql
-- Create sales table
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  sale_date DATE,
  revenue DECIMAL(10,2)
);

-- Insert sales data
INSERT INTO sales VALUES
  (1, 1, 2, '2024-01-15', 1999.98),
  (2, 2, 5, '2024-01-16', 149.95),
  (3, 3, 1, '2024-01-17', 79.99);

-- Daily sales summary
SELECT 
  sale_date,
  COUNT(*) as transactions,
  SUM(quantity) as total_items,
  SUM(revenue) as total_revenue
FROM sales
GROUP BY sale_date
ORDER BY sale_date;
```

### Use Case 2: User Management

```sql
-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP,
  is_active BOOLEAN
);

-- Query active users
SELECT username, email, created_at
FROM users
WHERE is_active = true
ORDER BY created_at DESC;
```

### Use Case 3: Data Analysis

```sql
-- Complex analytical query
SELECT 
  category,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  SUM(stock) as total_stock
FROM products
GROUP BY category
HAVING COUNT(*) > 1
ORDER BY avg_price DESC;
```

## JavaScript/TypeScript Usage

```javascript
// Using fetch API
async function queryDuckDB(query) {
  const response = await fetch('http://localhost:3005/mcp/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'executeQuery',
      arguments: { query }
    })
  });
  const data = await response.json();
  return data.rows;
}

// Usage
const products = await queryDuckDB('SELECT * FROM products');
console.log(products);
```

## Python Usage

```python
import requests

def query_duckdb(query):
    response = requests.post(
        'http://localhost:3005/mcp/tools/call',
        json={
            'name': 'executeQuery',
            'arguments': {'query': query}
        }
    )
    return response.json()['rows']

# Usage
products = query_duckdb('SELECT * FROM products')
print(products)
```

## Web Interface Usage

1. **Open the Web UI**: Navigate to http://localhost:3005

2. **Execute SQL Query**:
   - Enter your SQL query in the text area
   - Click "Execute Query"
   - Results display in a formatted table

3. **Create Table**:
   - Go to "Table Management" → "Create" tab
   - Enter table name
   - Define columns as JSON array
   - Click "Create Table"

4. **Insert Data**:
   - Enter table name
   - Enter data as JSON array
   - Click "Insert Data"

5. **Export Data**:
   - Enter query
   - Select format (JSON or CSV)
   - Click "Export"

## Available Tools

| Tool | Description | Required Arguments |
|------|-------------|-------------------|
| `executeQuery` | Execute SQL query | `query` (string) |
| `createTable` | Create table | `tableName`, `columns` |
| `listTables` | List all tables | None |
| `describeTable` | Get table schema | `tableName` |
| `insertData` | Insert rows | `tableName`, `data` |
| `exportData` | Export query results | `query`, `format` |
| `dropTable` | Drop table | `tableName` |

## Tips & Best Practices

1. **Use Transactions**: Wrap multiple operations in transactions for data integrity
2. **Index Large Tables**: Create indexes on frequently queried columns
3. **Use Prepared Statements**: For repeated queries with different parameters
4. **Export Regularly**: Since it's in-memory, export important data
5. **Validate Input**: Always validate SQL queries and data before execution

## Error Handling

All tools return error messages in this format:

```json
{
  "error": "Query execution failed: syntax error at line 1"
}
```

Always check for the `error` field in responses.

## Performance Notes

- DuckDB is optimized for analytical queries
- In-memory database is very fast for read operations
- Large datasets may consume significant memory
- Consider exporting data periodically for persistence

