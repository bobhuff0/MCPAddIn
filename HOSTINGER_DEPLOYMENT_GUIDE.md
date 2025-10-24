# Deploying MCP Servers to Hostinger

## 🚀 Hostinger Deployment Guide

This guide will help you deploy your MCP servers to Hostinger's VPS or shared hosting.

## 📋 Prerequisites

- Hostinger account with VPS or Business hosting plan
- Node.js support (VPS recommended)
- SSH access (for VPS)
- Domain name (optional)

---

## 🎯 Deployment Options

### Option 1: VPS Hosting (Recommended)
- Full control over server
- Can run multiple Node.js applications
- SSH access for easy deployment
- Better performance

### Option 2: Shared Hosting
- Limited Node.js support
- May require specific configurations
- Check Hostinger's Node.js hosting features

---

## 🛠️ VPS Deployment (Recommended)

### Step 1: Prepare Your Local Project

First, let's create production-ready configurations:

```bash
# In your project directory
npm run build
```

### Step 2: Upload Files to Hostinger

#### Method A: Using SCP/SFTP
```bash
# Upload your project folder
scp -r /Users/robertjhuff/Documents/Projects/MCPAddIn username@your-server-ip:/home/username/

# Or use SFTP
sftp username@your-server-ip
put -r /Users/robertjhuff/Documents/Projects/MCPAddIn
```

#### Method B: Using Git (if you have a repository)
```bash
# On your server
git clone https://github.com/yourusername/MCPAddIn.git
cd MCPAddIn
```

### Step 3: Install Dependencies on Server

```bash
# SSH into your server
ssh username@your-server-ip

# Navigate to project
cd MCPAddIn

# Install Node.js dependencies
npm install --production

# Build TypeScript
npm run build
```

### Step 4: Set Up Environment Variables

```bash
# Create .env file
nano .env

# Add your API keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
EXCHANGE_RATE_API_KEY=your_exchange_rate_key_here
NODE_ENV=production
```

### Step 5: Install PM2 for Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

### Step 6: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'stock-mcp',
      script: './dist/server.js',
      port: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'currency-mcp',
      script: './dist/currency-server.js',
      port: 3001,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'time-mcp',
      script: './dist/time-server.js',
      port: 3002,
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'units-mcp',
      script: './dist/units-server.js',
      port: 3003,
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    }
  ]
};
```

### Step 7: Start Services with PM2

```bash
# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Step 8: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mcp-servers
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Stock Market MCP
    location /stock/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Currency MCP
    location /currency/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Time MCP
    location /time/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Units MCP
    location /units/ {
        proxy_pass http://localhost:3003/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mcp-servers /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 9: Set Up SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🌐 Shared Hosting Deployment

### Step 1: Check Hostinger's Node.js Support

1. Log into your Hostinger control panel
2. Check if Node.js is available in your hosting plan
3. Note the Node.js version and any limitations

### Step 2: Upload Files

1. Use Hostinger's File Manager or FTP
2. Upload your project to the `public_html` folder
3. Make sure `package.json` is in the root

### Step 3: Install Dependencies

```bash
# In Hostinger's terminal (if available)
npm install --production
npm run build
```

### Step 4: Configure Environment Variables

Create `.env` file in Hostinger's file manager:

```
ALPHA_VANTAGE_API_KEY=your_key_here
NODE_ENV=production
```

### Step 5: Start Services

```bash
# Start individual servers
node dist/server.js &
node dist/currency-server.js &
node dist/time-server.js &
node dist/units-server.js &
```

---

## 🔧 Production Optimizations

### 1. Environment Configuration

Create `config/production.js`:

```javascript
module.exports = {
  // Stock Market MCP
  stock: {
    port: process.env.STOCK_PORT || 3000,
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY,
    rateLimit: 5, // requests per minute
    cacheTimeout: 300000 // 5 minutes
  },
  
  // Currency MCP
  currency: {
    port: process.env.CURRENCY_PORT || 3001,
    exchangeRateKey: process.env.EXCHANGE_RATE_API_KEY,
    rateLimit: 100, // requests per minute
    cacheTimeout: 600000 // 10 minutes
  },
  
  // Time MCP
  time: {
    port: process.env.TIME_PORT || 3002,
    rateLimit: 1000, // requests per minute
    cacheTimeout: 60000 // 1 minute
  },
  
  // Units MCP
  units: {
    port: process.env.UNITS_PORT || 3003,
    rateLimit: 1000, // requests per minute
    cacheTimeout: 300000 // 5 minutes
  }
};
```

### 2. Add Rate Limiting

Install rate limiting:

```bash
npm install express-rate-limit
```

Add to each server:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 3. Add Logging

```bash
npm install winston
```

Create `utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mcp-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Monitor resources
pm2 monit
```

### 2. Set Up Log Rotation

```bash
# Install logrotate
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/mcp-servers
```

Add:

```
/home/username/MCPAddIn/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 username username
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Checks

Create `health-check.js`:

```javascript
const axios = require('axios');

const servers = [
  { name: 'Stock Market', url: 'http://localhost:3000/mcp' },
  { name: 'Currency', url: 'http://localhost:3001/mcp' },
  { name: 'Time', url: 'http://localhost:3002/mcp' },
  { name: 'Units', url: 'http://localhost:3003/mcp' }
];

async function healthCheck() {
  for (const server of servers) {
    try {
      const response = await axios.get(server.url);
      console.log(`✅ ${server.name}: OK`);
    } catch (error) {
      console.log(`❌ ${server.name}: ERROR - ${error.message}`);
    }
  }
}

healthCheck();
```

---

## 🔒 Security Considerations

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Environment Security

```bash
# Secure .env file
chmod 600 .env

# Don't commit .env to git
echo ".env" >> .gitignore
```

### 3. API Key Security

- Use environment variables
- Rotate keys regularly
- Monitor API usage
- Set up alerts for unusual activity

---

## 🚀 Deployment Scripts

### Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying MCP Servers to Hostinger..."

# Build project
echo "📦 Building project..."
npm run build

# Install production dependencies
echo "📥 Installing dependencies..."
npm install --production

# Set up PM2
echo "⚙️ Setting up PM2..."
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Servers available at:"
echo "   - Stock Market: https://your-domain.com/stock/"
echo "   - Currency: https://your-domain.com/currency/"
echo "   - Time: https://your-domain.com/time/"
echo "   - Units: https://your-domain.com/units/"
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## 📱 Testing Your Deployment

### 1. Test Each Server

```bash
# Test Stock Market
curl https://your-domain.com/stock/mcp

# Test Currency
curl https://your-domain.com/currency/mcp

# Test Time
curl https://your-domain.com/time/mcp

# Test Units
curl https://your-domain.com/units/mcp
```

### 2. Test MCP Tools

```bash
# Test currency conversion
curl -X POST https://your-domain.com/currency/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertCurrency","arguments":{"from":"USD","to":"EUR","amount":100}}'
```

### 3. Test Web Interfaces

Visit:
- https://your-domain.com/stock/
- https://your-domain.com/currency/
- https://your-domain.com/time/
- https://your-domain.com/units/

---

## 🆘 Troubleshooting

### Common Issues:

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   sudo chown -R $USER:$USER /home/$USER/MCPAddIn
   ```

3. **Nginx 502 Bad Gateway**
   - Check if Node.js servers are running
   - Verify proxy_pass URLs
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

4. **PM2 Not Starting**
   ```bash
   pm2 logs
   pm2 restart all
   ```

5. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   ```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Add Caching Headers

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Monitor Performance

```bash
# Install monitoring tools
npm install -g clinic

# Profile your app
clinic doctor -- node dist/server.js
```

---

## 🎯 Next Steps

1. **Deploy to Hostinger** using the steps above
2. **Set up monitoring** with PM2 and logs
3. **Configure SSL** for secure connections
4. **Test all endpoints** to ensure everything works
5. **Set up backups** for your server configuration
6. **Monitor performance** and optimize as needed

---

## 📞 Support

If you encounter issues:

1. Check Hostinger's documentation
2. Review server logs: `pm2 logs`
3. Test locally first
4. Check firewall and port configurations
5. Verify environment variables are set correctly

---

## 🎉 Success!

Once deployed, your MCP servers will be available at:

- **Stock Market**: https://your-domain.com/stock/
- **Currency**: https://your-domain.com/currency/
- **Time**: https://your-domain.com/time/
- **Units**: https://your-domain.com/units/

You can now integrate them with ChatGPT or any other application that supports MCP!

