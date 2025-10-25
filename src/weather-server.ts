import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.WEATHER_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public-weather')));

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '7859575ac9bb3bc2f963f9044962b5aa';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather tools
const weatherTools = [
  {
    name: 'getCurrentWeather',
    description: 'Get current weather for a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name, state code, country code (e.g., "London", "New York,US", "Tokyo,JP")',
        },
        units: {
          type: 'string',
          enum: ['metric', 'imperial', 'kelvin'],
          description: 'Temperature units (metric=Celsius, imperial=Fahrenheit, kelvin=Kelvin)',
          default: 'metric',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'getWeatherForecast',
    description: 'Get 5-day weather forecast for a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name, state code, country code (e.g., "London", "New York,US", "Tokyo,JP")',
        },
        units: {
          type: 'string',
          enum: ['metric', 'imperial', 'kelvin'],
          description: 'Temperature units (metric=Celsius, imperial=Fahrenheit, kelvin=Kelvin)',
          default: 'metric',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'getWeatherByCoordinates',
    description: 'Get weather for specific latitude and longitude coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        lat: {
          type: 'number',
          description: 'Latitude coordinate',
        },
        lon: {
          type: 'number',
          description: 'Longitude coordinate',
        },
        units: {
          type: 'string',
          enum: ['metric', 'imperial', 'kelvin'],
          description: 'Temperature units (metric=Celsius, imperial=Fahrenheit, kelvin=Kelvin)',
          default: 'metric',
        },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'getWeatherAlerts',
    description: 'Get weather alerts for a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name, state code, country code (e.g., "London", "New York,US", "Tokyo,JP")',
        },
      },
      required: ['location'],
    },
  },
];

// Helper function to make API calls
async function makeWeatherAPICall(endpoint: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${OPENWEATHER_BASE_URL}${endpoint}`);
  url.searchParams.append('appid', OPENWEATHER_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Weather tool implementations
async function getCurrentWeather(args: any) {
  const { location, units = 'metric' } = args;
  
  try {
    const data = await makeWeatherAPICall('/weather', {
      q: location,
      units: units,
    });

    return {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather_description: data.weather[0].description,
      weather_icon: data.weather[0].icon,
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      units: units,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get current weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getWeatherForecast(args: any) {
  const { location, units = 'metric' } = args;
  
  try {
    const data = await makeWeatherAPICall('/forecast', {
      q: location,
      units: units,
    });

    const forecast = data.list.slice(0, 8).map((item: any) => ({
      datetime: new Date(item.dt * 1000).toLocaleString(),
      temperature: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind_speed: item.wind.speed,
      weather_description: item.weather[0].description,
      weather_icon: item.weather[0].icon,
      clouds: item.clouds.all,
      precipitation_probability: item.pop * 100,
    }));

    return {
      location: data.city.name,
      country: data.city.country,
      forecast: forecast,
      units: units,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getWeatherByCoordinates(args: any) {
  const { lat, lon, units = 'metric' } = args;
  
  try {
    const data = await makeWeatherAPICall('/weather', {
      lat: lat.toString(),
      lon: lon.toString(),
      units: units,
    });

    return {
      location: data.name,
      country: data.sys.country,
      coordinates: { lat: data.coord.lat, lon: data.coord.lon },
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather_description: data.weather[0].description,
      weather_icon: data.weather[0].icon,
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      units: units,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get weather by coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getWeatherAlerts(args: any) {
  const { location } = args;
  
  try {
    const data = await makeWeatherAPICall('/onecall', {
      q: location,
      exclude: 'current,minutely,hourly,daily',
    });

    return {
      location: location,
      alerts: data.alerts || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get weather alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// MCP Server setup
const server = new Server(
  {
    name: 'weather-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: weatherTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'getCurrentWeather':
        return { content: [{ type: 'text', text: JSON.stringify(await getCurrentWeather(args)) }] };
      case 'getWeatherForecast':
        return { content: [{ type: 'text', text: JSON.stringify(await getWeatherForecast(args)) }] };
      case 'getWeatherByCoordinates':
        return { content: [{ type: 'text', text: JSON.stringify(await getWeatherByCoordinates(args)) }] };
      case 'getWeatherAlerts':
        return { content: [{ type: 'text', text: JSON.stringify(await getWeatherAlerts(args)) }] };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Error calling tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Express routes for web interface
app.get('/mcp', async (req, res) => {
  res.json({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'WeatherMCP', version: '1.0.0' },
    },
  });
});

app.get('/mcp/tools/list', async (req, res) => {
  res.json({ tools: weatherTools });
});

app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    let result;
    switch (name) {
      case 'getCurrentWeather':
        result = await getCurrentWeather(args);
        break;
      case 'getWeatherForecast':
        result = await getWeatherForecast(args);
        break;
      case 'getWeatherByCoordinates':
        result = await getWeatherByCoordinates(args);
        break;
      case 'getWeatherAlerts':
        result = await getWeatherAlerts(args);
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌤️ Weather MCP Server running on port ${PORT}`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Weather MCP server running on stdio');
}

if (require.main === module) {
  main().catch(console.error);
}
