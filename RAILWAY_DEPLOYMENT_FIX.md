# Railway Deployment Fix - NPM Executable Issue 🔧

## Problem
Railway deployment failing with: **"npm executable could not be found"**

## Root Cause Analysis
Railway's Nixpacks builder was having issues finding npm in the PATH, even though Node.js was installed. This can happen when:
1. npm isn't in the PATH after Node.js installation
2. The start command tries to use npm before it's available
3. Nixpacks configuration needs explicit npm setup

## Solution Applied

### 1. Updated Start Command
Changed from `npm start` to `node server.js` directly:
- **railway.json**: `"startCommand": "node server.js"`
- **nixpacks.toml**: `cmd = "node server.js"`

This avoids the npm PATH issue entirely since `node` is always available when Node.js is installed.

### 2. Updated Nixpacks Configuration
```toml
[variables]
NODE_VERSION = "18"

[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node server.js"
```

### 3. Railway Configuration
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js"
  }
}
```

## Why This Works

1. **Build Phase**: Uses `npm ci` and `npm run build` - npm is available during build
2. **Start Phase**: Uses `node server.js` directly - avoids npm PATH issues
3. **Node.js includes npm**: npm comes with Node.js, so it's available during build
4. **Direct execution**: Running node directly is more reliable than npm scripts

## Verification

The deployment process:
1. ✅ Nixpacks installs Node.js 18 (includes npm)
2. ✅ Runs `npm ci` (npm available during build)
3. ✅ Runs `npm run build` (npm available during build)
4. ✅ Starts with `node server.js` (node always in PATH)

## Alternative Solutions (if still failing)

If the issue persists, try:

### Option 1: Use full path to npm
```toml
[start]
cmd = "/nix/store/.../bin/npm start"
```

### Option 2: Use npx
```toml
[start]
cmd = "npx --yes node server.js"
```

### Option 3: Create a wrapper script
Create `start.sh`:
```bash
#!/bin/bash
export PATH="/usr/bin:$PATH"
node server.js
```

---

**Status:** ✅ Fixed - Using `node server.js` directly  
**Last Updated:** December 21, 2024

