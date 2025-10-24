#!/bin/bash

# SSL Setup Script for MCP Servers
# This script sets up SSL certificates using Let's Encrypt

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

# Get domain from user
echo -e "${BLUE}🔒 SSL Certificate Setup for MCP Servers${NC}"
echo ""
read -p "Enter your domain name (e.g., example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

echo -e "${BLUE}Setting up SSL for domain: $DOMAIN${NC}"
echo ""

# Step 1: Install Certbot
echo -e "${BLUE}📦 Installing Certbot...${NC}"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
print_status "Certbot installed"

# Step 2: Stop Nginx temporarily
echo -e "${BLUE}🛑 Stopping Nginx temporarily...${NC}"
sudo systemctl stop nginx
print_status "Nginx stopped"

# Step 3: Get SSL certificate
echo -e "${BLUE}🔐 Obtaining SSL certificate...${NC}"
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
print_status "SSL certificate obtained"

# Step 4: Update Nginx configuration
echo -e "${BLUE}📋 Updating Nginx configuration for HTTPS...${NC}"

# Create HTTPS configuration
sudo tee /etc/nginx/sites-available/mcp-servers-https > /dev/null <<EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Stock Market MCP
    location /stock/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Currency MCP
    location /currency/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Time MCP
    location /time/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Units MCP
    location /units/ {
        proxy_pass http://localhost:3003/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the HTTPS site
sudo ln -sf /etc/nginx/sites-available/mcp-servers-https /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/mcp-servers

print_status "Nginx configuration updated for HTTPS"

# Step 5: Test Nginx configuration
echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 6: Start Nginx
echo -e "${BLUE}🚀 Starting Nginx...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx started and enabled"

# Step 7: Set up automatic renewal
echo -e "${BLUE}🔄 Setting up automatic certificate renewal...${NC}"
sudo crontab -l 2>/dev/null | grep -v certbot | sudo crontab -
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
print_status "Automatic renewal configured"

# Step 8: Test SSL
echo -e "${BLUE}🔍 Testing SSL configuration...${NC}"
sleep 5  # Wait for Nginx to start

if curl -s https://$DOMAIN/health > /dev/null; then
    print_status "SSL is working correctly"
else
    print_warning "SSL test failed, but certificate is installed"
fi

# Step 9: Display final information
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 SSL setup completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}🔒 Your MCP servers are now available with SSL:${NC}"
echo -e "   📊 Stock Market:    https://$DOMAIN/stock/"
echo -e "   💱 Currency:        https://$DOMAIN/currency/"
echo -e "   🌍 Time:           https://$DOMAIN/time/"
echo -e "   📏 Units:          https://$DOMAIN/units/"
echo ""

echo -e "${GREEN}📋 Certificate Information:${NC}"
echo -e "   Domain: $DOMAIN"
echo -e "   Certificate: /etc/letsencrypt/live/$DOMAIN/"
echo -e "   Expires: $(sudo certbot certificates | grep -A 2 "$DOMAIN" | grep "Expiry Date" | cut -d: -f2-)"
echo ""

echo -e "${GREEN}🔄 Automatic Renewal:${NC}"
echo -e "   Certificates will be automatically renewed"
echo -e "   Check renewal status: sudo certbot certificates"
echo ""

echo -e "${BLUE}🎯 SSL setup completed!${NC}"
