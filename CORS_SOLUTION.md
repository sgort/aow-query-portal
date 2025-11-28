# CORS Issue - Local Development vs Production

## ❌ The Problem

When running locally (`localhost:3000`), browsers block requests to TriplyDB due to CORS (Cross-Origin Resource Sharing) security policy:

```
Access to fetch at 'https://open-regels.triply.cc/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## ✅ The Solution (Choose One)

### Option 1: Use CORS Proxy (Recommended for Local Dev)

**What it does:** Runs a local proxy server that forwards requests to TriplyDB

**How to use:**
```bash
./start.sh
# This starts BOTH:
# - Frontend at http://localhost:3000
# - CORS Proxy at http://localhost:3001
```

The app will automatically use `http://localhost:3001/sparql` (proxy) instead of the direct TriplyDB endpoint.

**Files involved:**
- `config.local.json` - Uses proxy endpoint `http://localhost:3001/sparql`
- `proxy-server.js` - Simple Express server that forwards requests
- `start.sh` - Automatically switches to local config and starts both servers

### Option 2: Skip Local Testing (Deploy Directly)

**When deployed to Azure Static Web Apps:**
- CORS is NOT an issue
- The app uses the production config (`config.json`)
- Direct connection to TriplyDB works perfectly

**Deploy without local testing:**
```bash
# Skip npm run dev, go straight to deployment
git add .
git commit -m "Deploy to Azure"
git push
# GitHub Actions will build and deploy
```

### Option 3: Browser Extension (Quick Test Only)

Install a CORS browser extension:
- Chrome: "CORS Unblock" or "Allow CORS"
- Firefox: "CORS Everywhere"

**⚠️ Warning:** Only for quick tests! Don't use for actual development.

## 🔄 How the Proxy Works

```
Your Browser (localhost:3000)
    ↓
    GET http://localhost:3001/sparql?query=...
    ↓
Proxy Server (Node.js/Express)
    ↓
    Adds CORS headers
    Forwards to: https://open-regels.triply.cc/stevengort/...
    ↓
TriplyDB
    ↓
    Returns data
    ↓
Proxy Server
    ↓
    Adds "Access-Control-Allow-Origin: *"
    ↓
Your Browser ✅ (No CORS error!)
```

## 📁 File Structure for CORS Solution

```
triply-static-webapp/
├── config.json              # Production config (direct to TriplyDB)
├── config.local.json        # Local dev config (via proxy)
├── proxy-server.js          # CORS proxy server
├── start.sh                 # Starts both frontend + proxy
└── package.json             # Includes proxy dependencies
```

## 🚀 Production Deployment

When you deploy to Azure:

1. **Production config is used** (`config.json`)
   - Endpoint: `https://open-regels.triply.cc/stevengort/...`
   - Direct connection, no proxy

2. **CORS works automatically** because:
   - Same domain (`aow.open-regels.nl`)
   - Or TriplyDB allows requests from Azure domains

3. **Proxy is ignored** 
   - `proxy-server.js` is dev-only
   - Not included in the build (`npm run build` → `dist/`)

## 🧪 Testing

### Local Development (with proxy):
```bash
./start.sh
# Visit http://localhost:3000
# Backend uses proxy at http://localhost:3001
```

### Production Build:
```bash
npm run build
npm run preview
# Preview uses production config (no proxy)
# May still have CORS issues locally
```

### Deployed to Azure:
```
https://aow.open-regels.nl
# Uses production config
# No CORS issues!
```

## ❓ FAQ

**Q: Why doesn't TriplyDB allow CORS from localhost?**  
A: Security policy. TriplyDB only allows requests from specific domains.

**Q: Will this affect production?**  
A: No! The proxy is only for local development. Production connects directly.

**Q: Can I test without the proxy?**  
A: Yes, but you'll get CORS errors. Just deploy to Azure to test properly.

**Q: Do I need the proxy for every organization?**  
A: Yes, for local development. But each organization's production deployment works fine without it.

## 🔧 Manual Setup (if start.sh doesn't work)

### Terminal 1 - Start Proxy:
```bash
node proxy-server.js
# Should show: CORS Proxy running on http://localhost:3001
```

### Terminal 2 - Start Frontend:
```bash
# Swap configs
cp config.json config.prod.json
cp config.local.json config.json

# Start Vite
npm run dev
# Should show: Local: http://localhost:3000
```

### When Done:
```bash
# Restore production config
cp config.prod.json config.json
```

## ✨ Summary

- **Local Dev**: Use proxy (automatic with `./start.sh`)
- **Production**: Direct connection (works automatically on Azure)
- **CORS Error**: Normal for localhost, not an issue in production
