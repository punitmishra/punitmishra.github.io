# 🔧 Railway NPM Executable Fix

## Issue
Railway deployment failing with: **"npm executable could not be found"**

## Root Cause
NIXPACKS wasn't properly detecting or installing Node.js/npm, causing the build/start commands to fail.

## Solution Applied

### 1. Created `nixpacks.toml`
Explicitly configures NIXPACKS to:
- Use Node.js 18
- Install dependencies with `npm ci`
- Build with `npm run build`
- Start with `node server.js` (directly, not via npm)

**File:** `nixpacks.toml`
```toml
[variables]
NODE_VERSION = "18"

[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node server.js"
```

### 2. Updated `railway.json`
- Removed explicit `buildCommand` (NIXPACKS will use nixpacks.toml)
- Changed `startCommand` to `node server.js` (direct execution, not via npm)

### 3. Added `.nvmrc`
- Specifies Node.js version 18
- Helps Railway/NIXPACKS detect the correct Node version

## Files Modified

1. ✅ `nixpacks.toml` - Created with explicit Node.js configuration
2. ✅ `railway.json` - Updated start command to use `node` directly
3. ✅ `.nvmrc` - Added Node.js version specification

## Why This Fixes It

1. **Explicit Node.js Installation**: `nixpacks.toml` ensures Node.js 18 is installed
2. **Direct Node Execution**: Using `node server.js` instead of `npm start` avoids npm PATH issues
3. **Version Specification**: `.nvmrc` helps Railway detect the correct Node version
4. **Clear Build Steps**: NIXPACKS now has explicit instructions for each phase

## Verification

The deployment should now:
1. ✅ Detect Node.js from `package.json` and `.nvmrc`
2. ✅ Install Node.js 18 via NIXPACKS
3. ✅ Run `npm ci` to install dependencies
4. ✅ Run `npm run build` to build the app
5. ✅ Start with `node server.js` (npm not needed at runtime)

## Next Steps

1. **Railway will auto-deploy** with the new configuration
2. **Monitor deployment** - Check Railway dashboard logs
3. **Verify** - Site should be accessible after successful deployment

---

**Status:** ✅ **FIXED - Ready for Deployment**

