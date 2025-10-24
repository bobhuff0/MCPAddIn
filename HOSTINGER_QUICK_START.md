# Hostinger Deployment Quick Start Guide

## 🚀 Quick Deployment Options

### Option 1: VPS Hosting (Recommended)

**Requirements:**
- Hostinger VPS plan
- SSH access
- Domain name (optional)

**Steps:**
1. Upload your project to the server
2. Run the deployment script: `./deploy.sh`
3. Set up SSL: `./setup-ssl.sh`

### Option 2: Docker Deployment

**Requirements:**
- Docker and Docker Compose installed
- Domain name (optional)

**Steps:**
1. Configure environment: `cp env.production .env`
2. Run Docker deployment: `./docker-deploy.sh`

### Option 3: Shared Hosting

**Requirements:**
- Hostinger Business plan with Node.js support
- File Manager access

**Steps:**
1. Upload files via File Manager
2. Install dependencies in terminal
3. Start servers manually

---

## 📋 Pre-Deployment Checklist

### ✅ Required Files
- [ ] `package.json` - Dependencies and scripts
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `src/` directory - Source code
- [ ] `ecosystem.config.js` - PM2 configuration
- [ ] `nginx-mcp-servers.conf` - Nginx configuration
- [ ] `deploy.sh` - Deployment script
- [ ] `setup-ssl.sh` - SSL setup script

### ✅ Environment Setup
- [ ] Copy `env.production` to `.env`
- [ ] Add your Alpha Vantage API key
- [ ] Add Exchange Rate API key (optional)
- [ ] Configure domain name

### ✅ Server Requirements
- [ ] Node.js 16+ installed
- [ ] NPM installed
- [ ] PM2 installed (for VPS)
- [ ] Nginx installed (for VPS)
- [ ] Domain DNS configured

---

## 🎯 Deployment Commands

### VPS Deployment
```bash
# Upload project to server
scp -r MCPAddIn username@server-ip:/home/username/

# SSH into server
ssh username@server-ip

# Navigate to project
cd MCPAddIn

# Run deployment
./deploy.sh

# Set up SSL (optional)
./setup-ssl.sh
```

### Docker Deployment
```bash
# Configure environment
cp env.production .env
# Edit .env with your API keys

# Run Docker deployment
./docker-deploy.sh
```

### Manual Deployment
```bash
# Build project
npm run build

# Install dependencies
npm install --production

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 Post-Deployment URLs

After successful deployment, your servers will be available at:

### HTTP (before SSL)
- Stock Market: `http://your-domain.com/stock/`
- Currency: `http://your-domain.com/currency/`
- Time: `http://your-domain.com/time/`
- Units: `http://your-domain.com/units/`

### HTTPS (after SSL)
- Stock Market: `https://your-domain.com/stock/`
- Currency: `https://your-domain.com/currency/`
- Time: `https://your-domain.com/time/`
- Units: `https://your-domain.com/units/`

---

## 🔧 Management Commands

### PM2 Commands (VPS)
```bash
pm2 status              # Check server status
pm2 logs                # View logs
pm2 restart all         # Restart all servers
pm2 monit               # Monitor resources
pm2 stop all            # Stop all servers
pm2 delete all          # Remove all servers
```

### Docker Commands
```bash
docker-compose ps       # Check container status
docker-compose logs     # View logs
docker-compose restart  # Restart all services
docker-compose down     # Stop all services
docker-compose up -d    # Start all services
```

### Nginx Commands
```bash
sudo nginx -t           # Test configuration
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx    # Check status
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   ```

3. **Nginx 502 Bad Gateway**
   - Check if Node.js servers are running
   - Verify proxy_pass URLs in Nginx config
   - Check Nginx error logs

4. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   ```

5. **PM2 Not Starting**
   ```bash
   pm2 logs
   pm2 restart all
   ```

### Log Locations

- **PM2 Logs**: `./logs/` directory
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`

---

## 📊 Monitoring

### Health Checks
```bash
# Check all servers
curl http://localhost:3000/mcp
curl http://localhost:3001/mcp
curl http://localhost:3002/mcp
curl http://localhost:3003/mcp

# Check via domain
curl https://your-domain.com/stock/mcp
curl https://your-domain.com/currency/mcp
curl https://your-domain.com/time/mcp
curl https://your-domain.com/units/mcp
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# Docker monitoring
docker stats

# System monitoring
htop
```

---

## 🔒 Security Checklist

### ✅ Security Measures
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Environment variables secured
- [ ] API keys protected
- [ ] Regular security updates
- [ ] Log monitoring enabled

### Security Commands
```bash
# Update system
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Secure files
chmod 600 .env
chmod 600 /etc/nginx/sites-available/mcp-servers
```

---

## 📈 Scaling & Optimization

### Performance Optimization
- Enable Gzip compression in Nginx
- Set up caching headers
- Monitor resource usage
- Optimize database queries (if applicable)

### Scaling Options
- Add more PM2 instances
- Use load balancer
- Implement Redis caching
- Add CDN for static assets

---

## 🆘 Support

### Getting Help
1. Check logs for errors
2. Verify configuration files
3. Test endpoints individually
4. Check Hostinger documentation
5. Review deployment guide

### Useful Resources
- [Hostinger VPS Guide](https://www.hostinger.com/tutorials/vps)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎉 Success!

Once deployed successfully, you'll have:

✅ **4 MCP servers** running and accessible  
✅ **Beautiful web interfaces** for each server  
✅ **SSL certificates** for secure connections  
✅ **Process management** with PM2 or Docker  
✅ **Reverse proxy** with Nginx  
✅ **Monitoring and logging** configured  
✅ **Automatic restarts** and health checks  

Your MCP servers are now ready for production use! 🚀
