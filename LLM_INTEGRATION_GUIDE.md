# DuckDB MCP Server - LLM Integration Guide

## Overview

The DuckDB MCP server is designed to work seamlessly with Large Language Models (LLMs) through the Model Context Protocol (MCP). LLMs can discover available tools, understand their capabilities, and execute database operations through natural language interactions.

## How MCP Works with LLMs

### 1. Tool Discovery

When an LLM connects to the DuckDB MCP server, it can discover all available tools:

```json
{
  "tools": [
    {
      "name": "executeQuery",
      "description": "Execute a SQL query on the DuckDB database",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "SQL query to execute"
          }
        },
        "required": ["query"]
      }
    },
    // ... 6 more tools
  ]
}
```

The LLM understands:
- What each tool does (from the description)
- What parameters it needs (from inputSchema)
- How to call it (from the MCP protocol)

### 2. Natural Language to SQL

LLMs can translate natural language requests into SQL queries and execute them:

**User:** "Show me all products that cost more than $100"

**LLM's Process:**
1. Recognizes this needs a database query
2. Identifies the `executeQuery` tool
3. Generates SQL: `SELECT * FROM products WHERE price > 100`
4. Calls the tool with the query
5. Returns formatted results to the user

## Example LLM Interactions

### Example 1: Data Analysis Request

**User Prompt:**
```
"Analyze our product inventory. Show me which categories have the most products and calculate the average price for each category."
```

**LLM's Tool Call:**
```json
{
  "name": "executeQuery",
  "arguments": {
    "query": "SELECT category, COUNT(*) as product_count, AVG(price) as avg_price FROM products GROUP BY category ORDER BY product_count DESC"
  }
}
```

**LLM's Response to User:**
```
Based on the product inventory analysis:

- Electronics: 4 products, average price $350.24
- Furniture: 1 product, average price $199.99

Electronics is the largest category with 4 products and an average price of $350.24.
```

### Example 2: Table Creation Request

**User Prompt:**
```
"I need to track customer orders. Create a table with order ID, customer name, order date, and total amount."
```

**LLM's Tool Call:**
```json
{
  "name": "createTable",
  "arguments": {
    "tableName": "orders",
    "columns": [
      {"name": "order_id", "type": "INTEGER", "constraints": "PRIMARY KEY"},
      {"name": "customer_name", "type": "VARCHAR(100)"},
      {"name": "order_date", "type": "DATE"},
      {"name": "total_amount", "type": "DECIMAL(10,2)"}
    ],
    "ifNotExists": true
  }
}
```

**LLM's Response:**
```
I've created the 'orders' table with the following structure:
- order_id (INTEGER, PRIMARY KEY)
- customer_name (VARCHAR(100))
- order_date (DATE)
- total_amount (DECIMAL(10,2))

The table is ready for you to insert order data.
```

### Example 3: Data Insertion Request

**User Prompt:**
```
"Add these orders: Order 1 for John Smith on 2024-01-15 totaling $299.99, and Order 2 for Jane Doe on 2024-01-16 totaling $149.95"
```

**LLM's Tool Call:**
```json
{
  "name": "insertData",
  "arguments": {
    "tableName": "orders",
    "data": [
      {"order_id": 1, "customer_name": "John Smith", "order_date": "2024-01-15", "total_amount": 299.99},
      {"order_id": 2, "customer_name": "Jane Doe", "order_date": "2024-01-16", "total_amount": 149.95}
    ]
  }
}
```

**LLM's Response:**
```
I've successfully added 2 orders to the database:
- Order 1: John Smith, $299.99 on 2024-01-15
- Order 2: Jane Doe, $149.95 on 2024-01-16
```

### Example 4: Complex Analysis Request

**User Prompt:**
```
"Find all products that are low in stock (less than 20 units) and calculate how much it would cost to restock them to 50 units each."
```

**LLM's Process:**
1. First queries low stock products
2. Calculates restocking needs
3. Provides analysis

**LLM's Tool Call:**
```json
{
  "name": "executeQuery",
  "arguments": {
    "query": "SELECT name, stock, price, (50 - stock) as units_needed, ((50 - stock) * price) as restock_cost FROM products WHERE stock < 20"
  }
}
```

**LLM's Response:**
```
Here are the products that need restocking:

1. Laptop: Currently 15 units, needs 35 more. Restock cost: $34,999.65
2. Desk Chair: Currently 10 units, needs 40 more. Restock cost: $7,999.60

Total restocking cost: $42,999.25
```

## LLM Integration Patterns

### Pattern 1: Conversational Data Analysis

**Use Case:** User asks questions about data in natural language

```
User: "What's our best-selling product category?"
LLM: [Queries database] "Electronics is your best-selling category with 4 products."

User: "How much revenue did we make last month?"
LLM: [Queries sales table] "Total revenue for last month was $12,450.00"
```

### Pattern 2: Schema Design Assistant

**Use Case:** LLM helps design database schemas

```
User: "I need to track employees. What fields should I include?"
LLM: "I recommend: employee_id (PRIMARY KEY), name, email, department, 
      hire_date, salary. Should I create this table?"

User: "Yes, create it"
LLM: [Creates table] "Employee table created successfully!"
```

### Pattern 3: Data Import/Export Assistant

**Use Case:** LLM helps with data operations

```
User: "Export all products to JSON format"
LLM: [Calls exportData tool] "Here's your JSON export: [data]"

User: "Import this CSV data into the products table"
LLM: [Parses CSV, calls insertData] "Imported 25 products successfully"
```

### Pattern 4: Query Optimization

**Use Case:** LLM suggests better queries

```
User: "Show me expensive products"
LLM: [Executes query, analyzes results] "Found 3 products over $100. 
      Consider adding an index on the price column for faster queries."
```

## ChatGPT/Claude Integration

### Setting Up with ChatGPT

1. **Configure MCP Server:**
   ```json
   {
     "mcpServers": {
       "duckdb": {
         "command": "node",
         "args": ["/path/to/dist/duckdb-server.js"],
         "env": {
           "PORT": "3005"
         }
       }
     }
   }
   ```

2. **ChatGPT Can Now:**
   - Discover all 7 DuckDB tools
   - Understand their capabilities
   - Execute database operations based on your requests
   - Provide natural language explanations of results

### Example ChatGPT Conversation

```
You: "Create a database for tracking my expenses"

ChatGPT: I'll help you set up an expenses database. Let me create a table 
         with appropriate fields for tracking expenses.

         [Creates expenses table]

         I've created an 'expenses' table with:
         - expense_id (PRIMARY KEY)
         - date (DATE)
         - category (VARCHAR)
         - amount (DECIMAL)
         - description (VARCHAR)

         You can now start tracking your expenses!

You: "Add an expense: $45.50 for groceries on 2024-01-20"

ChatGPT: [Inserts data] Done! I've added your grocery expense.

You: "Show me my total spending by category"

ChatGPT: [Queries database] Here's your spending breakdown:
         - Groceries: $45.50
         - Total: $45.50
```

## Advanced LLM Use Cases

### Use Case 1: Automated Reporting

**LLM Prompt:**
```
"Generate a weekly sales report showing:
- Total sales
- Top 5 products by quantity
- Sales by category
- Export to JSON"
```

**LLM Actions:**
1. Executes multiple queries
2. Aggregates results
3. Formats report
4. Exports to JSON
5. Provides summary

### Use Case 2: Data Validation

**LLM Prompt:**
```
"Check the products table for any data quality issues like missing prices or negative stock"
```

**LLM Actions:**
1. Queries for NULL prices
2. Queries for negative stock
3. Reports issues found
4. Suggests fixes

### Use Case 3: Schema Migration

**LLM Prompt:**
```
"I need to add a 'discount' column to the products table"
```

**LLM Actions:**
1. Describes current schema
2. Creates ALTER TABLE statement
3. Executes migration
4. Verifies changes

## Benefits of LLM Integration

### 1. **Natural Language Interface**
- No SQL knowledge required
- Conversational data access
- Intuitive interactions

### 2. **Intelligent Query Generation**
- LLM understands context
- Generates optimized queries
- Handles complex requirements

### 3. **Error Handling**
- LLM can interpret errors
- Suggests fixes
- Provides helpful explanations

### 4. **Data Insights**
- LLM analyzes results
- Provides summaries
- Identifies patterns

### 5. **Learning Assistant**
- Explains SQL concepts
- Teaches database design
- Guides best practices

## Example LLM Workflow

```
┌─────────────┐
│   User      │
│  "Show me   │
│   products  │
│   under $50"│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LLM      │
│ 1. Understands request
│ 2. Generates SQL:
│    SELECT * FROM products 
│    WHERE price < 50
│ 3. Calls executeQuery tool
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DuckDB MCP │
│  Executes query
│  Returns results
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LLM      │
│ Formats results
│ Provides summary
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   User      │
│  Sees formatted
│  results with
│  explanation
└─────────────┘
```

## Best Practices for LLM Integration

### 1. **Clear Descriptions**
Tool descriptions help LLMs understand when to use each tool:
```typescript
{
  name: "executeQuery",
  description: "Execute a SQL query on the DuckDB database. Use this for SELECT, INSERT, UPDATE, DELETE, or any other SQL operations."
}
```

### 2. **Structured Responses**
Return consistent JSON structures so LLMs can parse results easily:
```json
{
  "success": true,
  "rows": [...],
  "rowCount": 10
}
```

### 3. **Error Messages**
Provide clear error messages that LLMs can interpret:
```json
{
  "error": "Table 'products' does not exist. Available tables: orders, customers"
}
```

### 4. **Tool Chaining**
LLMs can chain multiple tool calls:
```
User: "Create a sales table and add today's sales"
LLM: [Creates table] → [Inserts data] → [Verifies] → Reports success
```

## Security Considerations

### 1. **Query Validation**
- Validate SQL queries before execution
- Prevent destructive operations if needed
- Limit query complexity

### 2. **Access Control**
- Implement authentication
- Restrict tool access by user
- Log all operations

### 3. **Data Privacy**
- Sanitize inputs
- Don't expose sensitive data
- Use parameterized queries

## Conclusion

The DuckDB MCP server provides a powerful interface for LLMs to interact with databases. Through natural language, users can:

- ✅ Query data without SQL knowledge
- ✅ Create and manage database schemas
- ✅ Perform complex data analysis
- ✅ Export and import data
- ✅ Get intelligent insights and recommendations

The MCP protocol ensures LLMs understand available tools and can execute them correctly, making database operations accessible to everyone through conversational AI.

