#!/bin/bash

# Docker Deployment Script for MCP Servers
# This script builds and deploys all MCP servers using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🐳 Docker Deployment for MCP Servers${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.production .env
    print_warning "Please edit .env file with your API keys before continuing"
    print_warning "Press Enter when ready to continue..."
    read
fi

# Step 1: Build the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
if docker build -t mcp-servers .; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Step 2: Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
print_status "Existing containers stopped"

# Step 3: Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs
print_status "Logs directory created"

# Step 4: Start services with Docker Compose
echo -e "${BLUE}🚀 Starting MCP servers with Docker Compose...${NC}"
if docker-compose up -d; then
    print_status "All servers started successfully"
else
    print_error "Failed to start servers"
    exit 1
fi

# Step 5: Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Step 6: Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
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

# Step 7: Display container status
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose ps

# Step 8: Display final information
echo ""
echo -e "${BLUE}================================================${NC}"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}🎉 Docker deployment completed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Docker deployment completed with warnings${NC}"
fi
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}🐳 Your MCP servers are running in Docker containers:${NC}"
echo -e "   📊 Stock Market:    http://localhost:3000"
echo -e "   💱 Currency:        http://localhost:3001"
echo -e "   🌍 Time:           http://localhost:3002"
echo -e "   📏 Units:          http://localhost:3003"
echo ""

echo -e "${GREEN}🔧 Useful Docker Commands:${NC}"
echo -e "   docker-compose ps           # Check container status"
echo -e "   docker-compose logs         # View logs"
echo -e "   docker-compose restart      # Restart all services"
echo -e "   docker-compose down         # Stop all services"
echo -e "   docker-compose up -d         # Start all services"
echo ""

echo -e "${GREEN}📊 Monitoring Commands:${NC}"
echo -e "   docker stats                # Resource usage"
echo -e "   docker-compose logs -f      # Follow logs"
echo -e "   docker-compose exec stock-mcp sh  # Access container shell"
echo ""

echo -e "${BLUE}🎯 Docker deployment completed!${NC}"
