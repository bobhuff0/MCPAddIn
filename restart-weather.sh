#!/bin/bash

# Weather Server Restart Script
echo "🌤️ Weather Server Restart Script"
echo "================================="

# Check if server is running
if pgrep -f "node dist/weather-server.js" > /dev/null; then
    echo "🛑 Stopping weather server..."
    pkill -f "node dist/weather-server.js"
    sleep 2
else
    echo "ℹ️  Weather server not running"
fi

# Set API key (change this to your real API key)
export OPENWEATHER_API_KEY="${OPENWEATHER_API_KEY:-7859575ac9bb3bc2f963f9044962b5aa}"

echo "🚀 Starting weather server with API key: ${OPENWEATHER_API_KEY:0:8}..."
echo "🌐 Server will be available at: http://localhost:3004"
echo "📱 Web interface: http://localhost:3004"
echo ""

# Start the server
node dist/weather-server.js
