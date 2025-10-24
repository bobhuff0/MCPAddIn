import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';

const APP_NAME = 'MCP World Time Converter App';
const PORT = process.env.PORT || 3002;

interface TimeConversionResult {
  fromTimezone: string;
  toTimezone: string;
  inputTime: string;
  outputTime: string;
  utcTime: string;
  offsetFrom: string;
  offsetTo: string;
}

interface TimezoneInfo {
  timezone: string;
  currentTime: string;
  utcOffset: string;
  isDST: boolean;
}

// Major world timezones
const MAJOR_TIMEZONES: { [key: string]: string } = {
  'America/New_York': 'Eastern Time (US & Canada)',
  'America/Chicago': 'Central Time (US & Canada)',
  'America/Denver': 'Mountain Time (US & Canada)',
  'America/Los_Angeles': 'Pacific Time (US & Canada)',
  'America/Anchorage': 'Alaska',
  'Pacific/Honolulu': 'Hawaii',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'Europe/Rome': 'Rome',
  'Europe/Madrid': 'Madrid',
  'Europe/Moscow': 'Moscow',
  'Asia/Dubai': 'Dubai',
  'Asia/Kolkata': 'India',
  'Asia/Bangkok': 'Bangkok',
  'Asia/Singapore': 'Singapore',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Seoul': 'Seoul',
  'Asia/Shanghai': 'Beijing/Shanghai',
  'Australia/Sydney': 'Sydney',
  'Australia/Melbourne': 'Melbourne',
  'Pacific/Auckland': 'Auckland',
  'America/Toronto': 'Toronto',
  'America/Vancouver': 'Vancouver',
  'America/Mexico_City': 'Mexico City',
  'America/Sao_Paulo': 'São Paulo',
  'America/Buenos_Aires': 'Buenos Aires',
  'Africa/Cairo': 'Cairo',
  'Africa/Johannesburg': 'Johannesburg',
  'UTC': 'UTC/GMT'
};

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public-time')));

// Serve the ChatGPT app HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-time/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (name === 'convertTime') {
      const { fromTimezone, toTimezone, time } = args;
      const result = convertTime(fromTimezone, toTimezone, time);
      res.json(result);
    } else if (name === 'getCurrentTime') {
      const { timezone } = args;
      const result = getCurrentTime(timezone);
      res.json(result);
    } else if (name === 'getSupportedTimezones') {
      const result = getSupportedTimezones();
      res.json(result);
    } else if (name === 'getWorldClocks') {
      const { timezones } = args;
      const result = getWorldClocks(timezones);
      res.json(result);
    } else {
      return res.status(400).json({ error: 'Unknown tool' });
    }
  } catch (error: any) {
    console.error('Error calling tool:', error.message);
    res.status(500).json({ error: error.message });
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
        name: "TimeMCP",
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
    res.json({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "World Time MCP",
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
            name: "convertTime",
            description: "Convert time from one timezone to another",
            inputSchema: {
              type: "object",
              properties: {
                fromTimezone: {
                  type: "string",
                  description: "Source timezone (e.g., America/New_York, Europe/London)"
                },
                toTimezone: {
                  type: "string",
                  description: "Target timezone"
                },
                time: {
                  type: "string",
                  description: "Time in ISO format or HH:MM format (default: current time)"
                }
              },
              required: ["fromTimezone", "toTimezone"]
            }
          },
          {
            name: "getCurrentTime",
            description: "Get current time in a specific timezone",
            inputSchema: {
              type: "object",
              properties: {
                timezone: {
                  type: "string",
                  description: "Timezone (e.g., America/New_York)"
                }
              },
              required: ["timezone"]
            }
          },
          {
            name: "getSupportedTimezones",
            description: "Get list of all supported timezones",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "getWorldClocks",
            description: "Get current time in multiple timezones",
            inputSchema: {
              type: "object",
              properties: {
                timezones: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of timezone names"
                }
              }
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    try {
      let result;
      if (name === "convertTime") {
        result = convertTime(args.fromTimezone, args.toTimezone, args.time);
      } else if (name === "getCurrentTime") {
        result = getCurrentTime(args.timezone);
      } else if (name === "getSupportedTimezones") {
        result = getSupportedTimezones();
      } else if (name === "getWorldClocks") {
        result = getWorldClocks(args.timezones);
      } else {
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
        name: 'convertTime',
        description: 'Convert time from one timezone to another',
        inputSchema: {
          type: 'object',
          properties: {
            fromTimezone: {
              type: 'string',
              description: 'Source timezone (e.g., America/New_York, Europe/London)'
            },
            toTimezone: {
              type: 'string',
              description: 'Target timezone'
            },
            time: {
              type: 'string',
              description: 'Time in ISO format or HH:MM (default: current time)'
            }
          },
          required: ['fromTimezone', 'toTimezone']
        }
      },
      {
        name: 'getCurrentTime',
        description: 'Get current time in a specific timezone',
        inputSchema: {
          type: 'object',
          properties: {
            timezone: {
              type: 'string',
              description: 'Timezone name (e.g., America/New_York)'
            }
          },
          required: ['timezone']
        }
      },
      {
        name: 'getSupportedTimezones',
        description: 'Get list of all supported timezones',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'getWorldClocks',
        description: 'Get current time in multiple timezones at once',
        inputSchema: {
          type: 'object',
          properties: {
            timezones: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of timezone names (defaults to major world cities)'
            }
          }
        }
      }
    ]
  });
});

function convertTime(fromTimezone: string, toTimezone: string, time?: string): TimeConversionResult {
  try {
    let inputDate: Date;
    
    if (time) {
      // Parse the input time
      if (time.includes('T') || time.includes('Z')) {
        // ISO format
        inputDate = new Date(time);
      } else if (time.match(/^\d{1,2}:\d{2}/)) {
        // HH:MM format - use today's date
        const [hours, minutes] = time.split(':').map(Number);
        inputDate = new Date();
        inputDate.setHours(hours, minutes, 0, 0);
      } else {
        throw new Error('Invalid time format. Use ISO format or HH:MM');
      }
    } else {
      inputDate = new Date();
    }
    
    // Get time in source timezone
    const fromTime = inputDate.toLocaleString('en-US', { 
      timeZone: fromTimezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Get time in target timezone
    const toTime = inputDate.toLocaleString('en-US', { 
      timeZone: toTimezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Get UTC time
    const utcTime = inputDate.toISOString();
    
    // Calculate offsets
    const fromOffset = getTimezoneOffset(inputDate, fromTimezone);
    const toOffset = getTimezoneOffset(inputDate, toTimezone);
    
    return {
      fromTimezone,
      toTimezone,
      inputTime: fromTime,
      outputTime: toTime,
      utcTime,
      offsetFrom: fromOffset,
      offsetTo: toOffset
    };
  } catch (error: any) {
    throw new Error(`Failed to convert time: ${error.message}`);
  }
}

function getCurrentTime(timezone: string): TimezoneInfo {
  try {
    const now = new Date();
    
    const currentTime = now.toLocaleString('en-US', {
      timeZone: timezone,
      hour12: false,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const offset = getTimezoneOffset(now, timezone);
    
    // Simple DST detection (not 100% accurate but good enough)
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const janOffset = getTimezoneOffset(jan, timezone);
    const julOffset = getTimezoneOffset(jul, timezone);
    const isDST = offset !== janOffset || offset !== julOffset;
    
    return {
      timezone,
      currentTime,
      utcOffset: offset,
      isDST
    };
  } catch (error: any) {
    throw new Error(`Failed to get current time: ${error.message}`);
  }
}

function getSupportedTimezones(): { timezones: { [key: string]: string }, count: number } {
  return {
    timezones: MAJOR_TIMEZONES,
    count: Object.keys(MAJOR_TIMEZONES).length
  };
}

function getWorldClocks(timezones?: string[]): TimezoneInfo[] {
  const timezonesToQuery = timezones && timezones.length > 0 
    ? timezones 
    : Object.keys(MAJOR_TIMEZONES).slice(0, 10); // Default to first 10 major timezones
  
  return timezonesToQuery.map(tz => getCurrentTime(tz));
}

function getTimezoneOffset(date: Date, timezone: string): string {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset);
  const minutes = Math.round((absOffset - hours) * 60);
  
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
        name: 'convertTime',
        description: 'Convert time from one timezone to another',
        inputSchema: {
          type: 'object',
          properties: {
            fromTimezone: { type: 'string', description: 'Source timezone' },
            toTimezone: { type: 'string', description: 'Target timezone' },
            time: { type: 'string', description: 'Time to convert (optional, default: now)' }
          },
          required: ['fromTimezone', 'toTimezone']
        }
      },
      {
        name: 'getCurrentTime',
        description: 'Get current time in a timezone',
        inputSchema: {
          type: 'object',
          properties: {
            timezone: { type: 'string', description: 'Timezone name' }
          },
          required: ['timezone']
        }
      },
      {
        name: 'getSupportedTimezones',
        description: 'Get list of supported timezones',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'getWorldClocks',
        description: 'Get current time in multiple timezones',
        inputSchema: {
          type: 'object',
          properties: {
            timezones: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as any;
  
  if (request.params.name === 'convertTime') {
    const result = convertTime(args.fromTimezone, args.toTimezone, args.time);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getCurrentTime') {
    const result = getCurrentTime(args.timezone);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getSupportedTimezones') {
    const result = getSupportedTimezones();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getWorldClocks') {
    const result = getWorldClocks(args.timezones);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\x1b[32m✓ World Time Converter Server running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Make sure to expose via ngrok: ngrok http ${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Supported timezones: ${Object.keys(MAJOR_TIMEZONES).length}\x1b[0m`);
});


