# 🌐 Domain Setup Guide for MCPAddIn

## 🎯 Recommended Domain Names for Your Project

### Primary Options (Check Availability):
1. **mcpaddin.com** - Direct match to your project
2. **mcp-servers.com** - Descriptive of your services
3. **chatgpt-tools.com** - Clear purpose
4. **mcp-converter.com** - Focuses on conversion tools
5. **ai-tools-hub.com** - Broader appeal

### Alternative Options:
- **mcp-toolkit.com**
- **converter-station.com**
- **smart-tools-api.com**
- **world-time-converter.com**
- **currency-time-units.com**

## 🔍 How to Check Domain Availability

### Method 1: Online Domain Checkers
1. **Namecheap Domain Search**: https://www.namecheap.com/domains/registration/results/
2. **GoDaddy Domain Search**: https://www.godaddy.com/domainsearch
3. **Cloudflare Registrar**: https://www.cloudflare.com/products/registrar/

### Method 2: Command Line (if you have whois installed)
```bash
# Check domain availability
whois mcpaddin.com
whois mcp-servers.com
whois chatgpt-tools.com
```

## 💰 Domain Registration Steps

### Step 1: Choose Your Provider
**Recommended: Namecheap**
- Price: ~$8-12/year for .com
- Free WHOIS privacy
- Easy DNS management
- Good customer support

### Step 2: Register Domain
1. Go to https://www.namecheap.com
2. Search for your preferred domain
3. Add to cart and checkout
4. Enable WHOIS privacy (free)
5. Complete registration

## 🔧 DNS Configuration for Your Hostinger Server

### DNS Records to Set:
```
Type: A Record
Name: @ (or leave blank)
Value: 194.195.86.26
TTL: 300 (5 minutes)

Type: A Record  
Name: www
Value: 194.195.86.26
TTL: 300

Type: CNAME
Name: api
Value: yourdomain.com
TTL: 300
```

### Step-by-Step DNS Setup:
1. **Login to your domain registrar**
2. **Find DNS Management** (usually in domain settings)
3. **Add A Records** pointing to `194.195.86.26`
4. **Wait for propagation** (5 minutes to 24 hours)

## 🚀 SSL Certificate Setup

### After DNS is configured:
```bash
# SSH into your server
ssh root@194.195.86.26

# Install certbot
apt update && apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

## 🌐 Final URLs After Setup

Your MCP servers are now live at:
- **Stock Market**: `https://mcpaddin.com/stock/`
- **Currency**: `https://mcpaddin.com/currency/`
- **Time**: `https://mcpaddin.com/time/`
- **Units**: `https://mcpaddin.com/units/`

## ✅ SSL Certificate Status (COMPLETED)

- ✅ **Domain**: mcpaddin.com and www.mcpaddin.com
- ✅ **Certificate**: Issued successfully
- ✅ **Expires**: January 22, 2026
- ✅ **Auto-renewal**: Configured
- ✅ **HTTPS**: Fully enabled

## 🔄 Nginx Configuration Update

Update your Nginx config to use the domain:
```bash
# Edit Nginx configuration
nano /etc/nginx/sites-available/mcp-servers

# Update server_name directive
server_name yourdomain.com www.yourdomain.com;

# Test and reload
nginx -t && systemctl reload nginx
```

## ✅ Verification Steps

### 1. Check DNS Propagation
```bash
# Check if domain points to your server
nslookup yourdomain.com
dig yourdomain.com
```

### 2. Test HTTP Redirect
```bash
curl -I http://yourdomain.com
# Should return 301 redirect to HTTPS
```

### 3. Test HTTPS
```bash
curl -I https://yourdomain.com
# Should return 200 OK
```

### 4. Test MCP Servers
```bash
curl https://yourdomain.com/stock/mcp
curl https://yourdomain.com/currency/mcp
curl https://yourdomain.com/time/mcp
curl https://yourdomain.com/units/mcp
```

## 🎯 Quick Action Plan

1. **Check availability** of your preferred domains
2. **Register domain** with Namecheap
3. **Configure DNS** to point to `194.195.86.26`
4. **Wait for propagation** (check with nslookup)
5. **Set up SSL** with Let's Encrypt
6. **Test all endpoints**

## 💡 Pro Tips

- **Register for multiple years** to avoid price increases
- **Enable auto-renewal** to prevent expiration
- **Set up monitoring** to track domain status
- **Consider subdomains** for different services
- **Document your setup** for future reference

## 🆘 Troubleshooting

### DNS Not Propagating?
- Wait up to 24 hours
- Check with different DNS servers
- Verify DNS records are correct

### SSL Certificate Issues?
- Ensure DNS is fully propagated
- Check firewall allows ports 80/443
- Verify domain ownership

### Need Help?
- Check domain registrar support
- Review Hostinger documentation
- Test with online DNS checkers
