# 🔐 OAuth Security Setup for MCP Server

## Overview

Adding OAuth security protects your MCP server from unauthorized access. Here are several approaches:

---

## 🎯 Option 1: ngrok OAuth (Recommended)

ngrok has built-in OAuth protection that's easy to set up.

### Step 1: Enable OAuth in ngrok

```bash
# Stop current ngrok
# Then restart with OAuth
ngrok http 3000 --oauth=google --oauth-allow-email=your@email.com
```

### Step 2: Configure OAuth Providers

**For Google OAuth:**
```bash
ngrok http 3000 --oauth=google --oauth-allow-email=your@email.com
```

**For GitHub OAuth:**
```bash
ngrok http 3000 --oauth=github --oauth-allow-email=your@email.com
```

**For Multiple Providers:**
```bash
ngrok http 3000 --oauth=google --oauth=github --oauth-allow-email=your@email.com
```

### Step 3: Update ChatGPT Connector

After setting up OAuth, you'll need to:
1. **Get the new ngrok URL** (it may change)
2. **Configure OAuth in ChatGPT connector**
3. **Provide OAuth credentials**

---

## 🎯 Option 2: Custom OAuth Middleware

Add OAuth protection directly to your Express server.

### Install OAuth Dependencies

```bash
npm install passport passport-google-oauth20 express-session
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
```

### Update Your Server (src/server.ts)

```typescript
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Configure Passport
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Verify user is allowed
  const allowedEmails = [
    'your@email.com',
    'admin@yourdomain.com'
  ];
  
  if (allowedEmails.includes(profile.emails?.[0]?.value)) {
    return done(null, profile);
  } else {
    return done(null, false);
  }
}));

// Add OAuth middleware to your Express app
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Protect MCP endpoints
const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Apply auth to MCP endpoints
app.post('/mcp/tools/call', requireAuth, async (req, res) => {
  // Your existing MCP logic
});

app.get('/mcp/tools/list', requireAuth, (req, res) => {
  // Your existing list logic
});
```

---

## 🎯 Option 3: API Key Authentication

Simpler approach using API keys.

### Update Your Server

```typescript
// Add API key middleware
const requireApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (validApiKeys.includes(apiKey)) {
    return next();
  }
  
  res.status(401).json({ error: 'Invalid API key' });
};

// Apply to MCP endpoints
app.post('/mcp/tools/call', requireApiKey, async (req, res) => {
  // Your existing logic
});

app.get('/mcp/tools/list', requireApiKey, (req, res) => {
  // Your existing logic
});
```

### Environment Variables

Add to your `.env`:
```bash
VALID_API_KEYS=your-secret-key-1,your-secret-key-2
```

---

## 🎯 Option 4: JWT Token Authentication

Most flexible for programmatic access.

### Install JWT Dependencies

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### JWT Middleware

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

const requireJWT = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply to MCP endpoints
app.post('/mcp/tools/call', requireJWT, async (req, res) => {
  // Your existing logic
});
```

---

## 🔧 Implementation Steps

### For ngrok OAuth (Easiest)

1. **Restart ngrok with OAuth:**
   ```bash
   ./stop-ngrok.sh
   ngrok http 3000 --oauth=google --oauth-allow-email=your@email.com
   ```

2. **Get new URL:**
   ```bash
   ./get-ngrok-url.sh
   ```

3. **Update ChatGPT connector** with new URL

4. **Configure OAuth in ChatGPT** (it will prompt for Google login)

### For Custom OAuth

1. **Get Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://your-ngrok-url.ngrok-free.app/auth/google/callback`

2. **Set environment variables:**
   ```bash
   export GOOGLE_CLIENT_ID=your_client_id
   export GOOGLE_CLIENT_SECRET=your_client_secret
   export SESSION_SECRET=your_session_secret
   ```

3. **Update your server code** with OAuth middleware

4. **Rebuild and restart:**
   ```bash
   npm run build
   ./start.sh
   ```

---

## 🎯 ChatGPT Integration with OAuth

### For ngrok OAuth:
1. **Use the ngrok URL** (no changes needed)
2. **ChatGPT will handle OAuth flow** automatically
3. **User will be prompted to login** on first access

### For Custom OAuth:
1. **Add OAuth configuration** to ChatGPT connector
2. **Provide OAuth endpoints** in your API schema
3. **Handle authentication flow** in your frontend

---

## 📋 Security Best Practices

### 1. Environment Variables
```bash
# Add to .env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_random_session_secret
JWT_SECRET=your_random_jwt_secret
VALID_API_KEYS=key1,key2,key3
```

### 2. Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/mcp', limiter);
```

### 3. HTTPS Only
```typescript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

---

## 🚀 Quick Start (Recommended)

**Use ngrok OAuth - it's the easiest:**

```bash
# 1. Stop current ngrok
./stop-ngrok.sh

# 2. Start with OAuth
ngrok http 3000 --oauth=google --oauth-allow-email=your@email.com

# 3. Get new URL
./get-ngrok-url.sh

# 4. Use new URL in ChatGPT connector
```

**Benefits:**
- ✅ No code changes needed
- ✅ Built-in OAuth flow
- ✅ Works with ChatGPT automatically
- ✅ Easy to manage

---

## 🔍 Testing OAuth

### Test ngrok OAuth:
```bash
curl -I https://your-ngrok-url.ngrok-free.app/mcp/tools/list
# Should redirect to OAuth login
```

### Test Custom OAuth:
```bash
# Should return 401 without auth
curl https://your-ngrok-url.ngrok-free.app/mcp/tools/list

# Should work with valid token
curl -H "Authorization: Bearer your-jwt-token" \
     https://your-ngrok-url.ngrok-free.app/mcp/tools/list
```

---

## 💡 Recommendation

**Start with ngrok OAuth** - it's the simplest and works perfectly with ChatGPT:

```bash
ngrok http 3000 --oauth=google --oauth-allow-email=your@email.com
```

This gives you:
- ✅ Immediate security
- ✅ No code changes
- ✅ ChatGPT compatibility
- ✅ Easy management

**Want to implement this?** I can help you set it up! 🔐
