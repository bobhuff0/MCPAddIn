#!/bin/bash

# Domain Availability Checker for MCPAddIn Project
# This script checks multiple domain options for your project

echo "🌐 MCPAddIn Domain Availability Checker"
echo "========================================"
echo ""

# List of domains to check
domains=(
    "mcpaddin.com"
    "mcp-servers.com" 
    "chatgpt-tools.com"
    "mcp-converter.com"
    "ai-tools-hub.com"
    "mcp-toolkit.com"
    "converter-station.com"
    "smart-tools-api.com"
    "world-time-converter.com"
    "currency-time-units.com"
)

echo "Checking domain availability..."
echo ""

for domain in "${domains[@]}"; do
    echo -n "Checking $domain... "
    
    # Use whois to check domain status
    if command -v whois &> /dev/null; then
        result=$(whois "$domain" 2>/dev/null | grep -i "No match\|Not found\|Available\|No data found" | head -1)
        if [[ -n "$result" ]]; then
            echo "✅ AVAILABLE"
        else
            echo "❌ TAKEN"
        fi
    else
        echo "⚠️  Install whois: apt install whois"
    fi
done

echo ""
echo "💡 Next Steps:"
echo "1. Visit https://www.namecheap.com to register your preferred domain"
echo "2. Set DNS A records to point to: 194.195.86.26"
echo "3. Run SSL setup: certbot --nginx -d yourdomain.com"
echo ""
echo "🔗 Your server IP: 194.195.86.26"
echo "📚 Full guide: DOMAIN_SETUP_GUIDE.md"
