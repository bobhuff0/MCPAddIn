#!/bin/bash

# MCP Servers Deployment Script for Hostinger
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="MCPAddIn"
DOMAIN="your-domain.com"
USER="your-username"

echo -e "${BLUE}🚀 Starting MCP Servers Deployment to Hostinger...${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Step 1: Build the project
echo -e "${BLUE}📦 Building TypeScript project...${NC}"
if npm run build; then
    print_status "Project built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 2: Install production dependencies
echo -e "${BLUE}📥 Installing production dependencies...${NC}"
if npm install --production; then
    print_status "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs
print_status "Logs directory created"

# Step 4: Set up environment file
echo -e "${BLUE}⚙️  Setting up environment configuration...${NC}"
if [ ! -f .env ]; then
    print_warning ".env file not found, creating from template..."
    cp env.example .env
    print_warning "Please edit .env file with your API keys before continuing"
    print_warning "Press Enter when ready to continue..."
    read
fi

# Step 5: Install PM2 if not already installed
echo -e "${BLUE}🔧 Checking PM2 installation...${NC}"
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found, installing globally..."
    npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Step 6: Stop existing PM2 processes
echo -e "${BLUE}🛑 Stopping existing PM2 processes...${NC}"
pm2 delete all 2>/dev/null || true
print_status "Existing processes stopped"

# Step 7: Start services with PM2
echo -e "${BLUE}🚀 Starting MCP servers with PM2...${NC}"
if pm2 start ecosystem.config.js; then
    print_status "All servers started successfully"
else
    print_error "Failed to start servers"
    exit 1
fi

# Step 8: Save PM2 configuration
echo -e "${BLUE}💾 Saving PM2 configuration...${NC}"
pm2 save
print_status "PM2 configuration saved"

# Step 9: Set up PM2 startup script
echo -e "${BLUE}🔄 Setting up PM2 startup script...${NC}"
pm2 startup | grep -E '^sudo' | bash || true
print_status "PM2 startup script configured"

# Step 10: Check if Nginx is installed
echo -e "${BLUE}🌐 Checking Nginx installation...${NC}"
if command -v nginx &> /dev/null; then
    print_status "Nginx is installed"
    
    # Copy Nginx configuration
    echo -e "${BLUE}📋 Setting up Nginx configuration...${NC}"
    sudo cp nginx-mcp-servers.conf /etc/nginx/sites-available/mcp-servers
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/mcp-servers /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    if sudo nginx -t; then
        print_status "Nginx configuration is valid"
        
        # Restart Nginx
        sudo systemctl restart nginx
        print_status "Nginx restarted successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
else
    print_warning "Nginx not found. You'll need to set up a reverse proxy manually"
fi

# Step 11: Set up log rotation
echo -e "${BLUE}📊 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/mcp-servers > /dev/null <<EOF
/home/$USER/$PROJECT_NAME/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
print_status "Log rotation configured"

# Step 12: Set up firewall (if UFW is available)
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    print_status "Firewall configured"
else
    print_warning "UFW not found, skipping firewall configuration"
fi

# Step 13: Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 5  # Wait for servers to start

servers=(
    "Stock Market:3000"
    "Currency:3001"
    "Time:3002"
    "Units:3003"
)

all_healthy=true

for server in "${servers[@]}"; do
    name=$(echo $server | cut -d: -f1)
    port=$(echo $server | cut -d: -f2)
    
    if curl -s http://localhost:$port/mcp > /dev/null; then
        print_status "$name server is healthy"
    else
        print_error "$name server is not responding"
        all_healthy=false
    fi
done

# Step 14: Display final status
echo ""
echo -e "${BLUE}================================================${NC}"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Deployment completed with warnings${NC}"
fi
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}📊 Server Status:${NC}"
pm2 status

echo ""
echo -e "${GREEN}🌐 Your MCP servers are now available at:${NC}"
echo -e "   📊 Stock Market:    http://$DOMAIN/stock/"
echo -e "   💱 Currency:        http://$DOMAIN/currency/"
echo -e "   🌍 Time:           http://$DOMAIN/time/"
echo -e "   📏 Units:          http://$DOMAIN/units/"
echo ""

echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo -e "   pm2 status          # Check server status"
echo -e "   pm2 logs            # View logs"
echo -e "   pm2 restart all     # Restart all servers"
echo -e "   pm2 monit           # Monitor resources"
echo ""

echo -e "${GREEN}📚 Next Steps:${NC}"
echo -e "   1. Set up SSL certificate with Let's Encrypt"
echo -e "   2. Update DNS records to point to this server"
echo -e "   3. Test all endpoints"
echo -e "   4. Set up monitoring and alerts"
echo ""

echo -e "${BLUE}🎯 Deployment script completed!${NC}"
