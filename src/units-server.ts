import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';

const APP_NAME = 'MCP Units & Measurements Converter App';
const PORT = process.env.PORT || 3003;

interface ConversionResult {
  from: string;
  to: string;
  value: number;
  result: number;
  category: string;
  formula?: string;
}

// Conversion rates to base unit for each category
const CONVERSIONS: { [category: string]: { [unit: string]: { name: string, toBase: number, symbol: string } } } = {
  length: {
    meter: { name: 'Meter', toBase: 1, symbol: 'm' },
    kilometer: { name: 'Kilometer', toBase: 1000, symbol: 'km' },
    centimeter: { name: 'Centimeter', toBase: 0.01, symbol: 'cm' },
    millimeter: { name: 'Millimeter', toBase: 0.001, symbol: 'mm' },
    mile: { name: 'Mile', toBase: 1609.344, symbol: 'mi' },
    yard: { name: 'Yard', toBase: 0.9144, symbol: 'yd' },
    foot: { name: 'Foot', toBase: 0.3048, symbol: 'ft' },
    inch: { name: 'Inch', toBase: 0.0254, symbol: 'in' },
    nautical_mile: { name: 'Nautical Mile', toBase: 1852, symbol: 'nmi' }
  },
  weight: {
    kilogram: { name: 'Kilogram', toBase: 1, symbol: 'kg' },
    gram: { name: 'Gram', toBase: 0.001, symbol: 'g' },
    milligram: { name: 'Milligram', toBase: 0.000001, symbol: 'mg' },
    metric_ton: { name: 'Metric Ton', toBase: 1000, symbol: 't' },
    pound: { name: 'Pound', toBase: 0.45359237, symbol: 'lb' },
    ounce: { name: 'Ounce', toBase: 0.028349523125, symbol: 'oz' },
    ton: { name: 'Ton (US)', toBase: 907.18474, symbol: 'ton' },
    stone: { name: 'Stone', toBase: 6.35029318, symbol: 'st' }
  },
  temperature: {
    celsius: { name: 'Celsius', toBase: 1, symbol: '°C' },
    fahrenheit: { name: 'Fahrenheit', toBase: 1, symbol: '°F' },
    kelvin: { name: 'Kelvin', toBase: 1, symbol: 'K' }
  },
  volume: {
    liter: { name: 'Liter', toBase: 1, symbol: 'L' },
    milliliter: { name: 'Milliliter', toBase: 0.001, symbol: 'mL' },
    cubic_meter: { name: 'Cubic Meter', toBase: 1000, symbol: 'm³' },
    gallon: { name: 'Gallon (US)', toBase: 3.785411784, symbol: 'gal' },
    quart: { name: 'Quart (US)', toBase: 0.946352946, symbol: 'qt' },
    pint: { name: 'Pint (US)', toBase: 0.473176473, symbol: 'pt' },
    cup: { name: 'Cup (US)', toBase: 0.2365882365, symbol: 'cup' },
    fluid_ounce: { name: 'Fluid Ounce (US)', toBase: 0.0295735296, symbol: 'fl oz' },
    tablespoon: { name: 'Tablespoon', toBase: 0.01478676478, symbol: 'tbsp' },
    teaspoon: { name: 'Teaspoon', toBase: 0.00492892159, symbol: 'tsp' }
  },
  area: {
    square_meter: { name: 'Square Meter', toBase: 1, symbol: 'm²' },
    square_kilometer: { name: 'Square Kilometer', toBase: 1000000, symbol: 'km²' },
    square_centimeter: { name: 'Square Centimeter', toBase: 0.0001, symbol: 'cm²' },
    square_mile: { name: 'Square Mile', toBase: 2589988.110336, symbol: 'mi²' },
    square_yard: { name: 'Square Yard', toBase: 0.83612736, symbol: 'yd²' },
    square_foot: { name: 'Square Foot', toBase: 0.09290304, symbol: 'ft²' },
    square_inch: { name: 'Square Inch', toBase: 0.00064516, symbol: 'in²' },
    hectare: { name: 'Hectare', toBase: 10000, symbol: 'ha' },
    acre: { name: 'Acre', toBase: 4046.8564224, symbol: 'ac' }
  },
  speed: {
    meter_per_second: { name: 'Meter per Second', toBase: 1, symbol: 'm/s' },
    kilometer_per_hour: { name: 'Kilometer per Hour', toBase: 0.277777778, symbol: 'km/h' },
    mile_per_hour: { name: 'Mile per Hour', toBase: 0.44704, symbol: 'mph' },
    foot_per_second: { name: 'Foot per Second', toBase: 0.3048, symbol: 'ft/s' },
    knot: { name: 'Knot', toBase: 0.514444444, symbol: 'kn' }
  },
  pressure: {
    pascal: { name: 'Pascal', toBase: 1, symbol: 'Pa' },
    kilopascal: { name: 'Kilopascal', toBase: 1000, symbol: 'kPa' },
    bar: { name: 'Bar', toBase: 100000, symbol: 'bar' },
    psi: { name: 'Pounds per Square Inch', toBase: 6894.757293168, symbol: 'psi' },
    atmosphere: { name: 'Atmosphere', toBase: 101325, symbol: 'atm' },
    torr: { name: 'Torr', toBase: 133.322368, symbol: 'Torr' }
  },
  energy: {
    joule: { name: 'Joule', toBase: 1, symbol: 'J' },
    kilojoule: { name: 'Kilojoule', toBase: 1000, symbol: 'kJ' },
    calorie: { name: 'Calorie', toBase: 4.184, symbol: 'cal' },
    kilocalorie: { name: 'Kilocalorie', toBase: 4184, symbol: 'kcal' },
    watt_hour: { name: 'Watt Hour', toBase: 3600, symbol: 'Wh' },
    kilowatt_hour: { name: 'Kilowatt Hour', toBase: 3600000, symbol: 'kWh' },
    btu: { name: 'British Thermal Unit', toBase: 1055.06, symbol: 'BTU' }
  },
  power: {
    watt: { name: 'Watt', toBase: 1, symbol: 'W' },
    kilowatt: { name: 'Kilowatt', toBase: 1000, symbol: 'kW' },
    megawatt: { name: 'Megawatt', toBase: 1000000, symbol: 'MW' },
    horsepower: { name: 'Horsepower', toBase: 745.699872, symbol: 'hp' },
    btu_per_hour: { name: 'BTU per Hour', toBase: 0.293071, symbol: 'BTU/h' }
  },
  data: {
    byte: { name: 'Byte', toBase: 1, symbol: 'B' },
    kilobyte: { name: 'Kilobyte', toBase: 1024, symbol: 'KB' },
    megabyte: { name: 'Megabyte', toBase: 1048576, symbol: 'MB' },
    gigabyte: { name: 'Gigabyte', toBase: 1073741824, symbol: 'GB' },
    terabyte: { name: 'Terabyte', toBase: 1099511627776, symbol: 'TB' },
    bit: { name: 'Bit', toBase: 0.125, symbol: 'bit' },
    kilobit: { name: 'Kilobit', toBase: 128, symbol: 'Kb' },
    megabit: { name: 'Megabit', toBase: 131072, symbol: 'Mb' },
    gigabit: { name: 'Gigabit', toBase: 134217728, symbol: 'Gb' }
  }
};

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public-units')));

// Serve the ChatGPT app HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-units/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (name === 'convertUnits') {
      const { from, to, value, category } = args;
      const result = convertUnits(from, to, value, category);
      res.json(result);
    } else if (name === 'getSupportedUnits') {
      const { category } = args;
      const result = getSupportedUnits(category);
      res.json(result);
    } else if (name === 'getCategories') {
      const result = getCategories();
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
        name: "UnitsMCP",
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
          name: "Units & Measurements MCP",
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
            name: "convertUnits",
            description: "Convert between different units of measurement",
            inputSchema: {
              type: "object",
              properties: {
                from: {
                  type: "string",
                  description: "Source unit (e.g., meter, kilogram, celsius)"
                },
                to: {
                  type: "string",
                  description: "Target unit"
                },
                value: {
                  type: "number",
                  description: "Value to convert"
                },
                category: {
                  type: "string",
                  description: "Unit category (length, weight, temperature, etc.)"
                }
              },
              required: ["from", "to", "value"]
            }
          },
          {
            name: "getSupportedUnits",
            description: "Get list of supported units for a category",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Category name (optional, returns all if not specified)"
                }
              }
            }
          },
          {
            name: "getCategories",
            description: "Get list of all available unit categories",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    try {
      let result;
      if (name === "convertUnits") {
        result = convertUnits(args.from, args.to, args.value, args.category);
      } else if (name === "getSupportedUnits") {
        result = getSupportedUnits(args.category);
      } else if (name === "getCategories") {
        result = getCategories();
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
        name: 'convertUnits',
        description: 'Convert between different units of measurement',
        inputSchema: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              description: 'Source unit (e.g., meter, kilogram, celsius)'
            },
            to: {
              type: 'string',
              description: 'Target unit'
            },
            value: {
              type: 'number',
              description: 'Value to convert'
            },
            category: {
              type: 'string',
              description: 'Unit category (optional: length, weight, temperature, volume, area, speed, pressure, energy, power, data)'
            }
          },
          required: ['from', 'to', 'value']
        }
      },
      {
        name: 'getSupportedUnits',
        description: 'Get list of supported units for a category',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category name (optional, returns all if not specified)'
            }
          }
        }
      },
      {
        name: 'getCategories',
        description: 'Get list of all available unit categories',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  });
});

function convertUnits(from: string, to: string, value: number, category?: string): ConversionResult {
  try {
    from = from.toLowerCase().replace(/\s+/g, '_');
    to = to.toLowerCase().replace(/\s+/g, '_');
    
    // Find category if not provided
    let foundCategory = category;
    if (!foundCategory) {
      for (const cat in CONVERSIONS) {
        if (CONVERSIONS[cat][from] && CONVERSIONS[cat][to]) {
          foundCategory = cat;
          break;
        }
      }
      if (!foundCategory) {
        throw new Error(`Could not find units '${from}' and '${to}' in the same category`);
      }
    }
    
    const categoryData = CONVERSIONS[foundCategory];
    if (!categoryData) {
      throw new Error(`Unknown category: ${foundCategory}`);
    }
    
    const fromUnit = categoryData[from];
    const toUnit = categoryData[to];
    
    if (!fromUnit) {
      throw new Error(`Unknown unit: ${from}`);
    }
    if (!toUnit) {
      throw new Error(`Unknown unit: ${to}`);
    }
    
    let result: number;
    
    // Special handling for temperature
    if (foundCategory === 'temperature') {
      result = convertTemperature(from, to, value);
    } else {
      // Convert to base unit, then to target unit
      const baseValue = value * fromUnit.toBase;
      result = baseValue / toUnit.toBase;
    }
    
    // Round to reasonable precision
    result = Math.round(result * 1000000) / 1000000;
    
    return {
      from: fromUnit.name,
      to: toUnit.name,
      value,
      result,
      category: foundCategory
    };
  } catch (error: any) {
    throw new Error(`Failed to convert units: ${error.message}`);
  }
}

function convertTemperature(from: string, to: string, value: number): number {
  // Convert to Celsius first
  let celsius: number;
  
  if (from === 'celsius') {
    celsius = value;
  } else if (from === 'fahrenheit') {
    celsius = (value - 32) * 5 / 9;
  } else if (from === 'kelvin') {
    celsius = value - 273.15;
  } else {
    throw new Error(`Unknown temperature unit: ${from}`);
  }
  
  // Convert from Celsius to target
  if (to === 'celsius') {
    return celsius;
  } else if (to === 'fahrenheit') {
    return (celsius * 9 / 5) + 32;
  } else if (to === 'kelvin') {
    return celsius + 273.15;
  } else {
    throw new Error(`Unknown temperature unit: ${to}`);
  }
}

function getSupportedUnits(category?: string): any {
  if (category) {
    const cat = category.toLowerCase();
    if (!CONVERSIONS[cat]) {
      throw new Error(`Unknown category: ${category}`);
    }
    return {
      category: cat,
      units: CONVERSIONS[cat]
    };
  }
  
  return {
    categories: CONVERSIONS
  };
}

function getCategories(): { categories: string[], count: number } {
  const categories = Object.keys(CONVERSIONS);
  return {
    categories,
    count: categories.length
  };
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
        name: 'convertUnits',
        description: 'Convert between different units of measurement',
        inputSchema: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source unit' },
            to: { type: 'string', description: 'Target unit' },
            value: { type: 'number', description: 'Value to convert' },
            category: { type: 'string', description: 'Unit category (optional)' }
          },
          required: ['from', 'to', 'value']
        }
      },
      {
        name: 'getSupportedUnits',
        description: 'Get supported units',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Category name (optional)' }
          }
        }
      },
      {
        name: 'getCategories',
        description: 'Get all unit categories',
        inputSchema: { type: 'object', properties: {} }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as any;
  
  if (request.params.name === 'convertUnits') {
    const result = convertUnits(args.from, args.to, args.value, args.category);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getSupportedUnits') {
    const result = getSupportedUnits(args.category);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getCategories') {
    const result = getCategories();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\x1b[32m✓ Units & Measurements Converter Server running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Make sure to expose via ngrok: ngrok http ${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Supported categories: ${Object.keys(CONVERSIONS).join(', ')}\x1b[0m`);
});


