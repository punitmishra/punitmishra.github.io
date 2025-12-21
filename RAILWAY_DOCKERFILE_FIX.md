# Railway Dockerfile Issue Fix 🔧

## Problem
Railway was using the Dockerfile instead of Nixpacks, causing:
- Container failed to start
- Error: "The executable `npm` could not be found"

## Root Cause
Railway auto-detects Dockerfiles and uses them instead of Nixpacks. The Dockerfile was configured for nginx (static file serving), but Railway was trying to run the start command from `railway.json` which expected Node.js/npm.

## Solution Applied

### Renamed Dockerfile
- **Before:** `Dockerfile` (Railway auto-detected and used it)
- **After:** `Dockerfile.nginx.backup` (Railway will now use Nixpacks)

This forces Railway to use the Nixpacks builder as specified in `railway.json`.

## Why This Works

1. **Railway Detection Priority:**
   - If `Dockerfile` exists → Uses Docker
   - If no `Dockerfile` → Uses builder from `railway.json` (Nixpacks)

2. **Nixpacks Configuration:**
   - `nixpacks.toml` is properly configured
   - `railway.json` specifies NIXPACKS builder
   - Start command: `node server.js` (works with Express server)

3. **Express Server:**
   - `server.js` serves static files from `dist/`
   - Handles SPA routing
   - Works with Railway's PORT environment variable

## Current Setup

### Nixpacks (Now Active)
- Builds with Node.js 18
- Runs `npm ci` and `npm run build`
- Starts with `node server.js`

### Dockerfile (Backed Up)
- Available as `Dockerfile.nginx.backup`
- Can be used later if needed
- Configured for nginx static serving

## Alternative: Use Dockerfile (Future)

If you want to use the Dockerfile instead:

1. **Rename it back:** `mv Dockerfile.nginx.backup Dockerfile`
2. **Update railway.json:**
   ```json
   {
     "build": {
       "builder": "DOCKERFILE"
     }
   }
   ```
3. **Update Dockerfile CMD** to use PORT:
   ```dockerfile
   CMD ["sh", "-c", "nginx -g 'daemon off;'"]
   ```

## Verification

Railway will now:
1. ✅ Detect no Dockerfile
2. ✅ Use Nixpacks builder
3. ✅ Install Node.js 18
4. ✅ Run `npm ci` and `npm run build`
5. ✅ Start with `node server.js`

---

**Status:** ✅ Fixed - Railway will use Nixpacks  
**Last Updated:** December 21, 2024

