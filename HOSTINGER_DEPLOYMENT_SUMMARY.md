# 🚀 Hostinger Deployment - Complete Guide

## 📋 What You Need

### Hostinger Account Options:
1. **VPS Hosting** (Recommended) - Full control, SSH access
2. **Business Hosting** - Node.js support, limited control
3. **Shared Hosting** - Basic Node.js, most limited

### Required:
- Domain name (optional but recommended)
- Alpha Vantage API key (for Stock Market server)
- SSH access (for VPS)

---

## 🎯 Three Deployment Methods

### Method 1: VPS Deployment (Recommended)

**Best for:** Full control, production use, multiple domains

**Steps:**
1. **Upload Project:**
   ```bash
   scp -r MCPAddIn username@your-server-ip:/home/username/
   ```

2. **SSH into Server:**
   ```bash
   ssh username@your-server-ip
   cd MCPAddIn
   ```

3. **Run Deployment Script:**
   ```bash
   ./deploy.sh
   ```

4. **Set Up SSL (Optional):**
   ```bash
   ./setup-ssl.sh
   ```

**Result:** All 4 servers running with Nginx reverse proxy

---

### Method 2: Docker Deployment

**Best for:** Easy management, consistent environments

**Steps:**
1. **Configure Environment:**
   ```bash
   cp env.production .env
   # Edit .env with your API keys
   ```

2. **Run Docker Deployment:**
   ```bash
   ./docker-deploy.sh
   ```

**Result:** All 4 servers running in Docker containers

---

### Method 3: Shared Hosting

**Best for:** Simple setup, limited resources

**Steps:**
1. Upload files via Hostinger File Manager
2. Install dependencies in terminal
3. Start servers manually

**Result:** Basic server setup (limited features)

---

## 📁 Files Created for Deployment

### Production Configuration:
- `ecosystem.config.js` - PM2 process management
- `nginx-mcp-servers.conf` - Nginx reverse proxy config
- `env.production` - Environment variables template

### Deployment Scripts:
- `deploy.sh` - Automated VPS deployment
- `setup-ssl.sh` - SSL certificate setup
- `docker-deploy.sh` - Docker deployment

### Docker Files:
- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Docker services orchestration

### Documentation:
- `HOSTINGER_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `HOSTINGER_QUICK_START.md` - Quick start reference

---

## 🔧 Pre-Deployment Setup

### 1. Get API Keys

**Alpha Vantage (Required for Stock Market):**
- Visit: https://www.alphavantage.co/support/#api-key
- Sign up for free account
- Copy your API key

**Exchange Rate API (Optional for Currency):**
- Visit: https://www.exchangerate-api.com/
- Sign up for free account
- Copy your API key (or use free tier without key)

### 2. Configure Environment

```bash
# Copy environment template
cp env.production .env

# Edit .env file
nano .env
```

Add your API keys:
```
ALPHA_VANTAGE_API_KEY=your_key_here
EXCHANGE_RATE_API_KEY=your_key_here
```

### 3. Build Project

```bash
npm run build
```

---

## 🌐 Post-Deployment URLs

After deployment, your servers will be available at:

### With Domain (Recommended):
- **Stock Market:** `https://your-domain.com/stock/`
- **Currency:** `https://your-domain.com/currency/`
- **Time:** `https://your-domain.com/time/`
- **Units:** `https://your-domain.com/units/`

### Without Domain (IP only):
- **Stock Market:** `http://your-server-ip:3000/`
- **Currency:** `http://your-server-ip:3001/`
- **Time:** `http://your-server-ip:3002/`
- **Units:** `http://your-server-ip:3003/`

---

## 🔍 Testing Your Deployment

### 1. Health Checks

```bash
# Test each server
curl https://your-domain.com/stock/mcp
curl https://your-domain.com/currency/mcp
curl https://your-domain.com/time/mcp
curl https://your-domain.com/units/mcp
```

### 2. Test MCP Tools

```bash
# Test currency conversion
curl -X POST https://your-domain.com/currency/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertCurrency","arguments":{"from":"USD","to":"EUR","amount":100}}'

# Test time conversion
curl -X POST https://your-domain.com/time/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"getCurrentTime","arguments":{"timezone":"America/New_York"}}'

# Test units conversion
curl -X POST https://your-domain.com/units/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"convertUnits","arguments":{"from":"meter","to":"foot","value":100}}'
```

### 3. Test Web Interfaces

Visit each URL in your browser to see the beautiful interfaces:
- Stock Market dashboard
- Currency converter
- World time clocks
- Units converter

---

## 🛠️ Management Commands

### PM2 Commands (VPS):
```bash
pm2 status              # Check all servers
pm2 logs                # View logs
pm2 restart all         # Restart all servers
pm2 monit               # Monitor resources
pm2 stop all            # Stop all servers
pm2 delete all          # Remove all servers
```

### Docker Commands:
```bash
docker-compose ps       # Check containers
docker-compose logs     # View logs
docker-compose restart  # Restart services
docker-compose down     # Stop services
docker-compose up -d    # Start services
```

### Nginx Commands:
```bash
sudo nginx -t           # Test configuration
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx    # Check status
```

---

## 🔒 Security Features

### Included Security:
- ✅ SSL/TLS encryption (with setup-ssl.sh)
- ✅ Security headers in Nginx
- ✅ Firewall configuration
- ✅ Process isolation (PM2/Docker)
- ✅ Environment variable protection
- ✅ Rate limiting
- ✅ CORS configuration

### Security Checklist:
- [ ] SSL certificate installed
- [ ] Firewall enabled
- [ ] API keys secured
- [ ] Regular updates scheduled
- [ ] Log monitoring enabled

---

## 📊 Monitoring & Maintenance

### Log Locations:
- **PM2 Logs:** `./logs/` directory
- **Nginx Logs:** `/var/log/nginx/`
- **System Logs:** `/var/log/syslog`

### Monitoring Tools:
- PM2 monitoring: `pm2 monit`
- Docker monitoring: `docker stats`
- System monitoring: `htop`

### Maintenance Tasks:
- Regular security updates
- Log rotation (configured)
- Certificate renewal (automatic)
- Performance monitoring

---

## 🆘 Troubleshooting

### Common Issues:

1. **Port Already in Use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission Denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   ```

3. **Nginx 502 Bad Gateway:**
   - Check if Node.js servers are running
   - Verify Nginx configuration
   - Check error logs

4. **SSL Certificate Issues:**
   ```bash
   sudo certbot renew --dry-run
   ```

5. **PM2 Not Starting:**
   ```bash
   pm2 logs
   pm2 restart all
   ```

### Getting Help:
1. Check logs for errors
2. Verify configuration files
3. Test endpoints individually
4. Review Hostinger documentation
5. Check deployment guide

---

## 🎯 ChatGPT Integration

### After Deployment:

1. **Get Your Public URL:**
   - With domain: `https://your-domain.com/currency/mcp`
   - Without domain: Use ngrok: `ngrok http your-server-ip:3001`

2. **Add to ChatGPT:**
   - Go to ChatGPT Settings > Actions
   - Add your MCP server URL
   - Test the connection

3. **Start Using:**
   - "Convert 100 USD to EUR"
   - "What time is it in Tokyo?"
   - "Convert 10 miles to kilometers"

---

## 📈 Performance & Scaling

### Current Setup:
- 4 independent MCP servers
- Nginx reverse proxy
- PM2 process management
- Docker containerization (optional)

### Scaling Options:
- Add more PM2 instances
- Use load balancer
- Implement Redis caching
- Add CDN for static assets
- Database integration

---

## 🎉 Success!

Once deployed, you'll have:

✅ **4 Production-Ready MCP Servers**  
✅ **Beautiful Web Interfaces**  
✅ **SSL Security**  
✅ **Process Management**  
✅ **Monitoring & Logging**  
✅ **ChatGPT Integration Ready**  
✅ **Scalable Architecture**  

Your MCP servers are now live and ready for production use! 🚀

---

## 📞 Support Resources

- **Hostinger VPS Guide:** https://www.hostinger.com/tutorials/vps
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Docker Documentation:** https://docs.docker.com/
- **MCP Protocol:** https://modelcontextprotocol.io

---

**Happy Deploying! 🎯**
