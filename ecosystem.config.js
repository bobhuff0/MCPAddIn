module.exports = {
  apps: [
    {
      name: 'stock-mcp',
      script: './dist/server.js',
      port: 3000,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ALPHA_VANTAGE_API_KEY: '9FPPFX9ZMA1D7ZEI',
        EXCHANGE_RATE_API_KEY: ''
      },
      error_file: './logs/stock-error.log',
      out_file: './logs/stock-out.log',
      log_file: './logs/stock-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'currency-mcp',
      script: './dist/currency-server.js',
      port: 3001,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ALPHA_VANTAGE_API_KEY: '9FPPFX9ZMA1D7ZEI',
        EXCHANGE_RATE_API_KEY: ''
      },
      error_file: './logs/currency-error.log',
      out_file: './logs/currency-out.log',
      log_file: './logs/currency-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'time-mcp',
      script: './dist/time-server.js',
      port: 3002,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        ALPHA_VANTAGE_API_KEY: '9FPPFX9ZMA1D7ZEI',
        EXCHANGE_RATE_API_KEY: ''
      },
      error_file: './logs/time-error.log',
      out_file: './logs/time-out.log',
      log_file: './logs/time-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'units-mcp',
      script: './dist/units-server.js',
      port: 3003,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        ALPHA_VANTAGE_API_KEY: '9FPPFX9ZMA1D7ZEI',
        EXCHANGE_RATE_API_KEY: ''
      },
      error_file: './logs/units-error.log',
      out_file: './logs/units-out.log',
      log_file: './logs/units-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
