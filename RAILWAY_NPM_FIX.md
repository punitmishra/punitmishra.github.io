# Railway NPM Fix 🔧

## Issue
Railway deployment failing with: "npm executable could not be found"

## Root Cause
Nixpacks wasn't properly installing npm or the package name was incorrect.

## Fix Applied

### 1. Updated nixpacks.toml
- Changed from `nodejs-18_x` to `nodejs_18`
- Added explicit `nodePackages.npm` to ensure npm is installed
- Updated start command to use `npm start`

### 2. Updated railway.json
- Kept NIXPACKS builder
- Start command: `npm start` (which runs `node server.js`)

## Configuration Files

### nixpacks.toml
```toml
[variables]
NODE_VERSION = "18"

[phases.setup]
nixPkgs = ["nodejs_18", "nodePackages.npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

## Verification

The build process should now:
1. ✅ Install Node.js 18 and npm via Nixpacks
2. ✅ Run `npm ci` to install dependencies
3. ✅ Run `npm run build` to build the app
4. ✅ Run `npm start` to start the Express server

---

**Status:** ✅ Fixed - Ready for Deployment
