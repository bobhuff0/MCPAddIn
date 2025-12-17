import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import duckdb from 'duckdb';

const APP_NAME = 'MCP DuckDB Database App';
const PORT = process.env.PORT || 3005;

// Initialize DuckDB database (in-memory by default)
const db = new duckdb.Database(':memory:');
const connection = db.connect();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public-duckdb')));

// Serve the web interface HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-duckdb/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    let result;
    switch (name) {
      case 'executeQuery':
        result = await executeQuery(args.query);
        break;
      case 'createTable':
        result = await createTable(args.tableName, args.columns, args.ifNotExists);
        break;
      case 'listTables':
        result = await listTables();
        break;
      case 'describeTable':
        result = await describeTable(args.tableName);
        break;
      case 'insertData':
        result = await insertData(args.tableName, args.data);
        break;
      case 'exportData':
        result = await exportData(args.query, args.format);
        break;
      case 'dropTable':
        result = await dropTable(args.tableName, args.ifExists);
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error calling tool:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// MCP Discovery endpoint
app.get('/mcp', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "DuckDBMCP",
        version: "1.0.0"
      }
    }
  });
});

// ChatGPT MCP Connector endpoint
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;
  
  console.log('MCP Request:', JSON.stringify({ method, params, id }));
  
  if (method === "initialize") {
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "DuckDB Database MCP",
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
            name: "executeQuery",
            description: "Execute a SQL query on the DuckDB database",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "SQL query to execute"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "createTable",
            description: "Create a new table in the database",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table to create"
                },
                columns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      constraints: { type: "string" }
                    }
                  },
                  description: "Array of column definitions"
                },
                ifNotExists: {
                  type: "boolean",
                  description: "Create table only if it doesn't exist",
                  default: true
                }
              },
              required: ["tableName", "columns"]
            }
          },
          {
            name: "listTables",
            description: "List all tables in the database",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "describeTable",
            description: "Get schema information for a table",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table to describe"
                }
              },
              required: ["tableName"]
            }
          },
          {
            name: "insertData",
            description: "Insert data into a table",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table"
                },
                data: {
                  type: "array",
                  items: { type: "object" },
                  description: "Array of objects to insert"
                }
              },
              required: ["tableName", "data"]
            }
          },
          {
            name: "exportData",
            description: "Export query results to JSON or CSV format",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "SQL query to execute"
                },
                format: {
                  type: "string",
                  enum: ["json", "csv"],
                  description: "Export format",
                  default: "json"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "dropTable",
            description: "Drop a table from the database",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table to drop"
                },
                ifExists: {
                  type: "boolean",
                  description: "Drop only if table exists",
                  default: true
                }
              },
              required: ["tableName"]
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    try {
      let result;
      switch (name) {
        case "executeQuery":
          result = await executeQuery(args.query);
          break;
        case "createTable":
          result = await createTable(args.tableName, args.columns, args.ifNotExists);
          break;
        case "listTables":
          result = await listTables();
          break;
        case "describeTable":
          result = await describeTable(args.tableName);
          break;
        case "insertData":
          result = await insertData(args.tableName, args.data);
          break;
        case "exportData":
          result = await exportData(args.query, args.format);
          break;
        case "dropTable":
          result = await dropTable(args.tableName, args.ifExists);
          break;
        default:
          return res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          });
      }
      
      res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      });
    } catch (error: any) {
      res.json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32603,
          message: error.message
        }
      });
    }
  } else {
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
        name: 'executeQuery',
        description: 'Execute a SQL query on the DuckDB database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'createTable',
        description: 'Create a new table in the database',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string', description: 'Table name' },
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  constraints: { type: 'string' }
                }
              },
              description: 'Column definitions'
            },
            ifNotExists: { type: 'boolean', default: true }
          },
          required: ['tableName', 'columns']
        }
      },
      {
        name: 'listTables',
        description: 'List all tables in the database',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'describeTable',
        description: 'Get schema information for a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string', description: 'Table name' }
          },
          required: ['tableName']
        }
      },
      {
        name: 'insertData',
        description: 'Insert data into a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } }
          },
          required: ['tableName', 'data']
        }
      },
      {
        name: 'exportData',
        description: 'Export query results to JSON or CSV',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            format: { type: 'string', enum: ['json', 'csv'], default: 'json' }
          },
          required: ['query']
        }
      },
      {
        name: 'dropTable',
        description: 'Drop a table from the database',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            ifExists: { type: 'boolean', default: true }
          },
          required: ['tableName']
        }
      }
    ]
  });
});

// Helper function to execute queries
function executeQuery(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    connection.all(query, (err: Error | null, result: any[]) => {
      if (err) {
        reject(new Error(`Query execution failed: ${err.message}`));
        return;
      }
      resolve({
        success: true,
        rows: result,
        rowCount: result.length,
        query: query
      });
    });
  });
}

// Helper function to create a table
async function createTable(tableName: string, columns: Array<{name: string, type: string, constraints?: string}>, ifNotExists: boolean = true): Promise<any> {
  const ifNotExistsClause = ifNotExists ? 'IF NOT EXISTS' : '';
  const columnDefs = columns.map(col => {
    let def = `${col.name} ${col.type}`;
    if (col.constraints) {
      def += ` ${col.constraints}`;
    }
    return def;
  }).join(', ');
  
  const query = `CREATE TABLE ${ifNotExistsClause} ${tableName} (${columnDefs})`;
  
  return executeQuery(query).then(() => ({
    success: true,
    message: `Table '${tableName}' created successfully`,
    tableName: tableName,
    columns: columns
  }));
}

// Helper function to list all tables
async function listTables(): Promise<any> {
  const query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'";
  const result = await executeQuery(query);
  return {
    success: true,
    tables: result.rows.map((row: any) => row.table_name),
    count: result.rows.length
  };
}

// Helper function to describe a table
async function describeTable(tableName: string): Promise<any> {
  const query = `DESCRIBE ${tableName}`;
  const result = await executeQuery(query);
  return {
    success: true,
    tableName: tableName,
    schema: result.rows
  };
}

// Helper function to insert data
async function insertData(tableName: string, data: any[]): Promise<any> {
  if (!data || data.length === 0) {
    throw new Error('No data provided to insert');
  }
  
  // Get column names from first row
  const columns = Object.keys(data[0]);
  const columnList = columns.join(', ');
  
  // Build values
  const values = data.map(row => {
    const vals = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) {
        return 'NULL';
      } else if (typeof val === 'string') {
        return `'${val.replace(/'/g, "''")}'`;
      } else {
        return val;
      }
    });
    return `(${vals.join(', ')})`;
  }).join(', ');
  
  const query = `INSERT INTO ${tableName} (${columnList}) VALUES ${values}`;
  const result = await executeQuery(query);
  
  return {
    success: true,
    message: `Inserted ${data.length} row(s) into '${tableName}'`,
    tableName: tableName,
    rowsInserted: data.length
  };
}

// Helper function to export data
async function exportData(query: string, format: string = 'json'): Promise<any> {
  const result = await executeQuery(query);
  
  if (format === 'csv') {
    if (result.rows.length === 0) {
      return { success: true, format: 'csv', data: '', rowCount: 0 };
    }
    
    const headers = Object.keys(result.rows[0]).join(',');
    const rows = result.rows.map((row: any) => 
      Object.values(row).map(val => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    
    return {
      success: true,
      format: 'csv',
      data: [headers, ...rows].join('\n'),
      rowCount: result.rows.length
    };
  } else {
    return {
      success: true,
      format: 'json',
      data: result.rows,
      rowCount: result.rows.length
    };
  }
}

// Helper function to drop a table
async function dropTable(tableName: string, ifExists: boolean = true): Promise<any> {
  const ifExistsClause = ifExists ? 'IF EXISTS' : '';
  const query = `DROP TABLE ${ifExistsClause} ${tableName}`;
  
  return executeQuery(query).then(() => ({
    success: true,
    message: `Table '${tableName}' dropped successfully`,
    tableName: tableName
  }));
}

// Create MCP Server
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
        name: 'executeQuery',
        description: 'Execute a SQL query on the DuckDB database',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL query to execute' }
          },
          required: ['query']
        }
      },
      {
        name: 'createTable',
        description: 'Create a new table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            columns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  constraints: { type: 'string' }
                }
              }
            },
            ifNotExists: { type: 'boolean', default: true }
          },
          required: ['tableName', 'columns']
        }
      },
      {
        name: 'listTables',
        description: 'List all tables',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'describeTable',
        description: 'Describe table schema',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' }
          },
          required: ['tableName']
        }
      },
      {
        name: 'insertData',
        description: 'Insert data into table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } }
          },
          required: ['tableName', 'data']
        }
      },
      {
        name: 'exportData',
        description: 'Export query results',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            format: { type: 'string', enum: ['json', 'csv'], default: 'json' }
          },
          required: ['query']
        }
      },
      {
        name: 'dropTable',
        description: 'Drop a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            ifExists: { type: 'boolean', default: true }
          },
          required: ['tableName']
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as any;
  
  try {
    let result;
    switch (request.params.name) {
      case 'executeQuery':
        result = await executeQuery(args.query);
        break;
      case 'createTable':
        result = await createTable(args.tableName, args.columns, args.ifNotExists);
        break;
      case 'listTables':
        result = await listTables();
        break;
      case 'describeTable':
        result = await describeTable(args.tableName);
        break;
      case 'insertData':
        result = await insertData(args.tableName, args.data);
        break;
      case 'exportData':
        result = await exportData(args.query, args.format);
        break;
      case 'dropTable':
        result = await dropTable(args.tableName, args.ifExists);
        break;
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (error) {
    throw new Error(`Error calling tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Start Express server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✓ DuckDB MCP Server running on http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36mℹ Database: In-memory DuckDB instance\x1b[0m`);
  });
}

