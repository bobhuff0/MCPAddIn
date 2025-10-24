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

const APP_NAME = 'MCP Currency Converter App';
const PORT = process.env.PORT || 3001;
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || '';

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: string;
}

interface SupportedCurrenciesResult {
  currencies: { [key: string]: string };
  count: number;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  country: string;
  region: string;
}

// Comprehensive list of world currencies (ISO 4217)
const WORLD_CURRENCIES: { [key: string]: CurrencyInfo } = {
  // Major Currencies
  'USD': { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', region: 'North America' },
  'EUR': { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', region: 'Europe' },
  'GBP': { code: 'GBP', name: 'British Pound Sterling', symbol: '£', country: 'United Kingdom', region: 'Europe' },
  'JPY': { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', region: 'Asia' },
  'CHF': { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland', region: 'Europe' },
  'CAD': { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada', region: 'North America' },
  'AUD': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia', region: 'Oceania' },
  'NZD': { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand', region: 'Oceania' },
  
  // Asian Currencies
  'CNY': { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China', region: 'Asia' },
  'HKD': { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong', region: 'Asia' },
  'SGD': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore', region: 'Asia' },
  'KRW': { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea', region: 'Asia' },
  'INR': { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', region: 'Asia' },
  'THB': { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand', region: 'Asia' },
  'MYR': { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia', region: 'Asia' },
  'IDR': { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia', region: 'Asia' },
  'PHP': { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines', region: 'Asia' },
  'VND': { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam', region: 'Asia' },
  'TWD': { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', country: 'Taiwan', region: 'Asia' },
  'PKR': { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan', region: 'Asia' },
  'BDT': { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh', region: 'Asia' },
  'LKR': { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', country: 'Sri Lanka', region: 'Asia' },
  'NPR': { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal', region: 'Asia' },
  'MMK': { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', country: 'Myanmar', region: 'Asia' },
  'KHR': { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia', region: 'Asia' },
  'LAK': { code: 'LAK', name: 'Lao Kip', symbol: '₭', country: 'Laos', region: 'Asia' },
  'BND': { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei', region: 'Asia' },
  'MNT': { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', country: 'Mongolia', region: 'Asia' },
  
  // Middle East & Central Asia
  'AED': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates', region: 'Middle East' },
  'SAR': { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia', region: 'Middle East' },
  'QAR': { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', country: 'Qatar', region: 'Middle East' },
  'KWD': { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait', region: 'Middle East' },
  'BHD': { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', country: 'Bahrain', region: 'Middle East' },
  'OMR': { code: 'OMR', name: 'Omani Rial', symbol: '﷼', country: 'Oman', region: 'Middle East' },
  'JOD': { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', country: 'Jordan', region: 'Middle East' },
  'LBP': { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', country: 'Lebanon', region: 'Middle East' },
  'ILS': { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', country: 'Israel', region: 'Middle East' },
  'TRY': { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey', region: 'Middle East' },
  'IRR': { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', country: 'Iran', region: 'Middle East' },
  'IQD': { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', country: 'Iraq', region: 'Middle East' },
  'AFN': { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', country: 'Afghanistan', region: 'Central Asia' },
  'KZT': { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', country: 'Kazakhstan', region: 'Central Asia' },
  'UZS': { code: 'UZS', name: 'Uzbekistani Som', symbol: 'лв', country: 'Uzbekistan', region: 'Central Asia' },
  'KGS': { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'лв', country: 'Kyrgyzstan', region: 'Central Asia' },
  'TJS': { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', country: 'Tajikistan', region: 'Central Asia' },
  'TMT': { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', country: 'Turkmenistan', region: 'Central Asia' },
  
  // European Currencies
  'SEK': { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden', region: 'Europe' },
  'NOK': { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway', region: 'Europe' },
  'DKK': { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark', region: 'Europe' },
  'ISK': { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', country: 'Iceland', region: 'Europe' },
  'PLN': { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', country: 'Poland', region: 'Europe' },
  'CZK': { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic', region: 'Europe' },
  'HUF': { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary', region: 'Europe' },
  'RON': { code: 'RON', name: 'Romanian Leu', symbol: 'lei', country: 'Romania', region: 'Europe' },
  'BGN': { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria', region: 'Europe' },
  'HRK': { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia', region: 'Europe' },
  'RSD': { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', country: 'Serbia', region: 'Europe' },
  'BAM': { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'КМ', country: 'Bosnia and Herzegovina', region: 'Europe' },
  'MKD': { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', country: 'North Macedonia', region: 'Europe' },
  'ALL': { code: 'ALL', name: 'Albanian Lek', symbol: 'L', country: 'Albania', region: 'Europe' },
  'MDL': { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', country: 'Moldova', region: 'Europe' },
  'UAH': { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine', region: 'Europe' },
  'BYN': { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', country: 'Belarus', region: 'Europe' },
  'RUB': { code: 'RUB', name: 'Russian Ruble', symbol: '₽', country: 'Russia', region: 'Europe' },
  
  // African Currencies
  'ZAR': { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa', region: 'Africa' },
  'EGP': { code: 'EGP', name: 'Egyptian Pound', symbol: '£', country: 'Egypt', region: 'Africa' },
  'NGN': { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria', region: 'Africa' },
  'KES': { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya', region: 'Africa' },
  'GHS': { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana', region: 'Africa' },
  'ETB': { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia', region: 'Africa' },
  'TZS': { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania', region: 'Africa' },
  'UGX': { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda', region: 'Africa' },
  'RWF': { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', country: 'Rwanda', region: 'Africa' },
  'MWK': { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', country: 'Malawi', region: 'Africa' },
  'ZMW': { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', country: 'Zambia', region: 'Africa' },
  'BWP': { code: 'BWP', name: 'Botswana Pula', symbol: 'P', country: 'Botswana', region: 'Africa' },
  'NAD': { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', country: 'Namibia', region: 'Africa' },
  'SZL': { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', country: 'Eswatini', region: 'Africa' },
  'LSL': { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', country: 'Lesotho', region: 'Africa' },
  'MAD': { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco', region: 'Africa' },
  'TND': { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', country: 'Tunisia', region: 'Africa' },
  'DZD': { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria', region: 'Africa' },
  'LYD': { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', country: 'Libya', region: 'Africa' },
  'SDG': { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', country: 'Sudan', region: 'Africa' },
  'SSP': { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', country: 'South Sudan', region: 'Africa' },
  'SOS': { code: 'SOS', name: 'Somali Shilling', symbol: 'S', country: 'Somalia', region: 'Africa' },
  'DJF': { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', country: 'Djibouti', region: 'Africa' },
  'ERN': { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'Eritrea', region: 'Africa' },
  'CDF': { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', country: 'Democratic Republic of Congo', region: 'Africa' },
  'AOA': { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', country: 'Angola', region: 'Africa' },
  'MZN': { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', country: 'Mozambique', region: 'Africa' },
  'MGA': { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', country: 'Madagascar', region: 'Africa' },
  'MUR': { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius', region: 'Africa' },
  'SCR': { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', country: 'Seychelles', region: 'Africa' },
  'KMF': { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', country: 'Comoros', region: 'Africa' },
  'XOF': { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', country: 'West Africa', region: 'Africa' },
  'XAF': { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', country: 'Central Africa', region: 'Africa' },
  
  // American Currencies
  'MXN': { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico', region: 'North America' },
  'BRL': { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', region: 'South America' },
  'ARS': { code: 'ARS', name: 'Argentine Peso', symbol: '$', country: 'Argentina', region: 'South America' },
  'CLP': { code: 'CLP', name: 'Chilean Peso', symbol: '$', country: 'Chile', region: 'South America' },
  'COP': { code: 'COP', name: 'Colombian Peso', symbol: '$', country: 'Colombia', region: 'South America' },
  'PEN': { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', country: 'Peru', region: 'South America' },
  'UYU': { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', country: 'Uruguay', region: 'South America' },
  'PYG': { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', country: 'Paraguay', region: 'South America' },
  'BOB': { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', country: 'Bolivia', region: 'South America' },
  'VES': { code: 'VES', name: 'Venezuelan Bolivar', symbol: 'Bs.S', country: 'Venezuela', region: 'South America' },
  'GYD': { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', country: 'Guyana', region: 'South America' },
  'SRD': { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', country: 'Suriname', region: 'South America' },
  'TTD': { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', country: 'Trinidad and Tobago', region: 'Caribbean' },
  'JMD': { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', country: 'Jamaica', region: 'Caribbean' },
  'BBD': { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', country: 'Barbados', region: 'Caribbean' },
  'BZD': { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', country: 'Belize', region: 'Central America' },
  'GTQ': { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', country: 'Guatemala', region: 'Central America' },
  'HNL': { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', country: 'Honduras', region: 'Central America' },
  'NIO': { code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$', country: 'Nicaragua', region: 'Central America' },
  'CRC': { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡', country: 'Costa Rica', region: 'Central America' },
  'PAB': { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', country: 'Panama', region: 'Central America' },
  
  // Cryptocurrencies
  'BTC': { code: 'BTC', name: 'Bitcoin', symbol: '₿', country: 'Global', region: 'Cryptocurrency' },
  'ETH': { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', country: 'Global', region: 'Cryptocurrency' },
  'LTC': { code: 'LTC', name: 'Litecoin', symbol: 'Ł', country: 'Global', region: 'Cryptocurrency' },
  'BCH': { code: 'BCH', name: 'Bitcoin Cash', symbol: '₿', country: 'Global', region: 'Cryptocurrency' },
  'XRP': { code: 'XRP', name: 'Ripple', symbol: 'XRP', country: 'Global', region: 'Cryptocurrency' },
  'ADA': { code: 'ADA', name: 'Cardano', symbol: '₳', country: 'Global', region: 'Cryptocurrency' },
  'DOT': { code: 'DOT', name: 'Polkadot', symbol: '●', country: 'Global', region: 'Cryptocurrency' },
  'LINK': { code: 'LINK', name: 'Chainlink', symbol: 'LINK', country: 'Global', region: 'Cryptocurrency' },
  'UNI': { code: 'UNI', name: 'Uniswap', symbol: 'UNI', country: 'Global', region: 'Cryptocurrency' },
  'DOGE': { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', country: 'Global', region: 'Cryptocurrency' },
  
  // Special Currencies
  'XDR': { code: 'XDR', name: 'Special Drawing Rights', symbol: 'XDR', country: 'IMF', region: 'International' },
  'XAU': { code: 'XAU', name: 'Gold (Troy Ounce)', symbol: 'Au', country: 'Global', region: 'Precious Metals' },
  'XAG': { code: 'XAG', name: 'Silver (Troy Ounce)', symbol: 'Ag', country: 'Global', region: 'Precious Metals' },
  'XPT': { code: 'XPT', name: 'Platinum (Troy Ounce)', symbol: 'Pt', country: 'Global', region: 'Precious Metals' },
  'XPD': { code: 'XPD', name: 'Palladium (Troy Ounce)', symbol: 'Pd', country: 'Global', region: 'Precious Metals' }
};

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public-currency')));

// Serve the ChatGPT app HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public-currency/index.html'));
});

// MCP Tool endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (name === 'convertCurrency') {
      const { from, to, amount } = args;
      const result = await convertCurrency(from, to, amount);
      res.json(result);
    } else if (name === 'getSupportedCurrencies') {
      const { region, category } = args;
      const result = getSupportedCurrencies(region, category);
      res.json(result);
    } else if (name === 'getExchangeRates') {
      const { base } = args;
      const result = await getExchangeRates(base);
      res.json(result);
    } else if (name === 'getCurrencyInfo') {
      const { currency } = args;
      const result = getCurrencyInfo(currency);
      res.json(result);
    } else if (name === 'searchCurrencies') {
      const { query } = args;
      const result = searchCurrencies(query);
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
        name: "CurrencyMCP",
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
          name: "Currency Converter MCP",
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
            name: "convertCurrency",
            description: "Convert an amount from one currency to another using real-time exchange rates",
            inputSchema: {
              type: "object",
              properties: {
                from: {
                  type: "string",
                  description: "Source currency code (e.g., USD, EUR, GBP)"
                },
                to: {
                  type: "string",
                  description: "Target currency code"
                },
                amount: {
                  type: "number",
                  description: "Amount to convert"
                }
              },
              required: ["from", "to", "amount"]
            }
          },
          {
            name: "getSupportedCurrencies",
            description: "Get list of all supported currencies with optional filtering by region or category",
            inputSchema: {
              type: "object",
              properties: {
                region: {
                  type: "string",
                  description: "Filter by region (e.g., Asia, Europe, Africa, North America, South America, Middle East, Central Asia, Oceania, Caribbean, Central America, Cryptocurrency, Precious Metals, International)"
                },
                category: {
                  type: "string",
                  description: "Filter by category (e.g., major, crypto, metals)"
                }
              }
            }
          },
          {
            name: "getExchangeRates",
            description: "Get all exchange rates for a base currency",
            inputSchema: {
              type: "object",
              properties: {
                base: {
                  type: "string",
                  description: "Base currency code (e.g., USD)"
                }
              },
              required: ["base"]
            }
          },
          {
            name: "getCurrencyInfo",
            description: "Get detailed information about a specific currency",
            inputSchema: {
              type: "object",
              properties: {
                currency: {
                  type: "string",
                  description: "Currency code (e.g., USD, EUR, BTC)"
                }
              },
              required: ["currency"]
            }
          },
          {
            name: "searchCurrencies",
            description: "Search for currencies by name, country, or symbol",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query (e.g., 'dollar', 'euro', 'bitcoin')"
                }
              },
              required: ["query"]
            }
          }
        ]
      }
    });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    
    try {
      let result;
      if (name === "convertCurrency") {
        result = await convertCurrency(args.from, args.to, args.amount);
      } else if (name === "getSupportedCurrencies") {
        result = getSupportedCurrencies(args.region, args.category);
      } else if (name === "getExchangeRates") {
        result = await getExchangeRates(args.base);
      } else if (name === "getCurrencyInfo") {
        result = getCurrencyInfo(args.currency);
      } else if (name === "searchCurrencies") {
        result = searchCurrencies(args.query);
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
        name: 'convertCurrency',
        description: 'Convert an amount from one currency to another using real-time exchange rates',
        inputSchema: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              description: 'Source currency code (e.g., USD, EUR, GBP)',
              default: 'USD'
            },
            to: {
              type: 'string',
              description: 'Target currency code (e.g., USD, EUR, GBP)',
              default: 'EUR'
            },
            amount: {
              type: 'number',
              description: 'Amount to convert',
              default: 100
            }
          },
          required: ['from', 'to', 'amount']
        }
      },
      {
        name: 'getSupportedCurrencies',
        description: 'Get list of all supported currencies with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description: 'Filter by region (Asia, Europe, Africa, etc.)'
            },
            category: {
              type: 'string',
              description: 'Filter by category (major, crypto, metals)'
            }
          }
        }
      },
      {
        name: 'getExchangeRates',
        description: 'Get all exchange rates for a base currency',
        inputSchema: {
          type: 'object',
          properties: {
            base: {
              type: 'string',
              description: 'Base currency code (e.g., USD)',
              default: 'USD'
            }
          },
          required: ['base']
        }
      },
      {
        name: 'getCurrencyInfo',
        description: 'Get detailed information about a specific currency',
        inputSchema: {
          type: 'object',
          properties: {
            currency: {
              type: 'string',
              description: 'Currency code (e.g., USD, EUR, BTC)',
              default: 'USD'
            }
          },
          required: ['currency']
        }
      },
      {
        name: 'searchCurrencies',
        description: 'Search for currencies by name, country, or symbol',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (e.g., dollar, euro, bitcoin)',
              default: 'dollar'
            }
          },
          required: ['query']
        }
      }
    ]
  });
});

async function convertCurrency(from: string, to: string, amount: number): Promise<ConversionResult> {
  // Using exchangerate-api.com (free tier available)
  // Alternative: Use open.er-api.com for completely free access (no key needed)
  
  const apiKey = EXCHANGE_RATE_API_KEY || 'demo';
  let url: string;
  
  if (apiKey === 'demo' || !apiKey) {
    // Use free API endpoint (no key required)
    url = `https://open.er-api.com/v6/latest/${from.toUpperCase()}`;
  } else {
    // Use API key endpoint for higher limits
    url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from.toUpperCase()}`;
  }
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.result === 'error') {
      throw new Error(data['error-type'] || 'API error');
    }
    
    const rate = data.rates[to.toUpperCase()];
    
    if (!rate) {
      throw new Error(`Currency ${to.toUpperCase()} not found`);
    }
    
    const result = amount * rate;
    
    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount,
      result: Math.round(result * 100) / 100,
      rate: Math.round(rate * 1000000) / 1000000,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Currency ${from.toUpperCase()} not found`);
    }
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
}

function getSupportedCurrencies(region?: string, category?: string): SupportedCurrenciesResult {
  let filteredCurrencies = { ...WORLD_CURRENCIES };
  
  // Filter by region
  if (region) {
    filteredCurrencies = Object.fromEntries(
      Object.entries(filteredCurrencies).filter(([_, info]) => 
        info.region.toLowerCase() === region.toLowerCase()
      )
    );
  }
  
  // Filter by category
  if (category) {
    switch (category.toLowerCase()) {
      case 'major':
        const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
        filteredCurrencies = Object.fromEntries(
          Object.entries(filteredCurrencies).filter(([code, _]) => 
            majorCurrencies.includes(code)
          )
        );
        break;
      case 'crypto':
        filteredCurrencies = Object.fromEntries(
          Object.entries(filteredCurrencies).filter(([_, info]) => 
            info.region === 'Cryptocurrency'
          )
        );
        break;
      case 'metals':
        filteredCurrencies = Object.fromEntries(
          Object.entries(filteredCurrencies).filter(([_, info]) => 
            info.region === 'Precious Metals'
          )
        );
        break;
    }
  }
  
  const currencies: { [key: string]: string } = {};
  Object.entries(filteredCurrencies).forEach(([code, info]) => {
    currencies[code] = `${info.name} (${info.symbol})`;
  });
  
  return {
    currencies,
    count: Object.keys(currencies).length
  };
}

async function getExchangeRates(base: string): Promise<any> {
  const apiKey = EXCHANGE_RATE_API_KEY || 'demo';
  let url: string;
  
  if (apiKey === 'demo' || !apiKey) {
    url = `https://open.er-api.com/v6/latest/${base.toUpperCase()}`;
  } else {
    url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base.toUpperCase()}`;
  }
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    return {
      base: base.toUpperCase(),
      rates: data.rates,
      timestamp: data.time_last_update_utc || new Date().toISOString()
    };
  } catch (error: any) {
    throw new Error(`Failed to get exchange rates: ${error.message}`);
  }
}

function getCurrencyInfo(currency: string): CurrencyInfo | null {
  const upperCurrency = currency.toUpperCase();
  return WORLD_CURRENCIES[upperCurrency] || null;
}

function searchCurrencies(query: string): { [key: string]: CurrencyInfo } {
  const lowerQuery = query.toLowerCase();
  const results: { [key: string]: CurrencyInfo } = {};
  
  Object.entries(WORLD_CURRENCIES).forEach(([code, info]) => {
    if (
      info.name.toLowerCase().includes(lowerQuery) ||
      info.country.toLowerCase().includes(lowerQuery) ||
      info.symbol.toLowerCase().includes(lowerQuery) ||
      code.toLowerCase().includes(lowerQuery)
    ) {
      results[code] = info;
    }
  });
  
  return results;
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
        name: 'convertCurrency',
        description: 'Convert an amount from one currency to another using real-time exchange rates',
        inputSchema: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source currency code' },
            to: { type: 'string', description: 'Target currency code' },
            amount: { type: 'number', description: 'Amount to convert' }
          },
          required: ['from', 'to', 'amount']
        }
      },
      {
        name: 'getSupportedCurrencies',
        description: 'Get list of all supported currencies with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            region: { type: 'string', description: 'Filter by region' },
            category: { type: 'string', description: 'Filter by category' }
          }
        }
      },
      {
        name: 'getExchangeRates',
        description: 'Get all exchange rates for a base currency',
        inputSchema: {
          type: 'object',
          properties: {
            base: { type: 'string', description: 'Base currency code' }
          },
          required: ['base']
        }
      },
      {
        name: 'getCurrencyInfo',
        description: 'Get detailed information about a specific currency',
        inputSchema: {
          type: 'object',
          properties: {
            currency: { type: 'string', description: 'Currency code' }
          },
          required: ['currency']
        }
      },
      {
        name: 'searchCurrencies',
        description: 'Search for currencies by name, country, or symbol',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        }
      }
    ]
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as any;
  
  if (request.params.name === 'convertCurrency') {
    const result = await convertCurrency(args.from, args.to, args.amount);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getSupportedCurrencies') {
    const result = getSupportedCurrencies(args.region, args.category);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getExchangeRates') {
    const result = await getExchangeRates(args.base);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'getCurrencyInfo') {
    const result = getCurrencyInfo(args.currency);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } else if (request.params.name === 'searchCurrencies') {
    const result = searchCurrencies(args.query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\x1b[32m✓ Currency Converter Server running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Make sure to expose via ngrok: ngrok http ${PORT}\x1b[0m`);
  console.log(`\x1b[36mℹ Supported currencies: ${Object.keys(WORLD_CURRENCIES).length}\x1b[0m`);
  if (!EXCHANGE_RATE_API_KEY) {
    console.log(`\x1b[33mℹ Using free API (no key required) - Limited to 1500 requests/month\x1b[0m`);
    console.log(`\x1b[33mℹ Get unlimited access at: https://www.exchangerate-api.com/\x1b[0m`);
  }
});