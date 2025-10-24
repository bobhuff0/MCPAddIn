# Multi-stage Dockerfile for MCP Servers
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=mcp:nodejs /app/dist ./dist
COPY --from=builder --chown=mcp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcp:nodejs /app/package*.json ./
COPY --from=builder --chown=mcp:nodejs /app/public ./public
COPY --from=builder --chown=mcp:nodejs /app/public-currency ./public-currency
COPY --from=builder --chown=mcp:nodejs /app/public-time ./public-time
COPY --from=builder --chown=mcp:nodejs /app/public-units ./public-units

# Create logs directory
RUN mkdir -p logs && chown mcp:nodejs logs

# Switch to non-root user
USER mcp

# Expose ports
EXPOSE 3000 3001 3002 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const servers = [3000, 3001, 3002, 3003]; \
    let healthy = 0; \
    servers.forEach(port => { \
      const req = http.request({hostname: 'localhost', port, path: '/mcp'}, (res) => { \
        if (res.statusCode === 200) healthy++; \
      }); \
      req.on('error', () => {}); \
      req.end(); \
    }); \
    setTimeout(() => process.exit(healthy === servers.length ? 0 : 1), 1000);"

# Start script
CMD ["dumb-init", "node", "dist/server.js"]
