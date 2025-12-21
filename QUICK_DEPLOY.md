# Quick Deploy Guide 🚀

## 🚂 Railway (EASIEST - 5 minutes)

### Option A: Web UI (No CLI needed)
1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose**: `punitmishra/punitmishra.github.io`
6. **Railway will**:
   - Auto-detect Node.js
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm start` (serves on PORT)
7. **Wait 3-5 minutes** ⏳
8. **Done!** Your site is live 🎉

### Option B: Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd /Users/punitmishra/punitmishra.github.io
railway link
railway up
```

---

## 🪰 Fly.io (More Control)

### Step 1: Install Fly CLI
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Or via Homebrew
brew install flyctl
```

### Step 2: Login
```bash
fly auth login
```

### Step 3: Deploy
```bash
cd /Users/punitmishra/punitmishra.github.io

# Launch (creates app)
fly launch
# - App name: punitmishra-portfolio (or your choice)
# - Region: iad (US East) or choose closest
# - Don't deploy PostgreSQL (we don't need it)

# Deploy
fly deploy
```

### Step 4: Open Site
```bash
fly open
```

---

## 📊 Which Should You Choose?

### Railway ✅ (Recommended)
- **Easier**: Just connect GitHub, done!
- **Faster setup**: 5 minutes
- **Auto-detects**: Everything configured automatically
- **Free tier**: $5 credit/month
- **Best for**: Quick deployment

### Fly.io
- **More control**: Docker-based
- **Global edge**: Better performance worldwide
- **Free tier**: 3 shared VMs
- **Best for**: More complex needs

---

## 🎯 My Recommendation

**Use Railway** - It's the fastest and easiest:
1. Go to https://railway.app
2. Sign in with GitHub
3. Deploy your repo
4. Done in 5 minutes!

---

## ✅ What's Already Configured

- ✅ `package.json` - Added `start` script
- ✅ `railway.json` - Railway configuration
- ✅ `Dockerfile` - For Docker deployments
- ✅ `nginx.conf` - Nginx configuration
- ✅ `fly.toml` - Fly.io configuration
- ✅ `.dockerignore` - Docker ignore rules

**Everything is ready to deploy!** 🚀

---

## 🔗 After Deployment

Both platforms provide:
- ✅ HTTPS automatically
- ✅ Custom domain support
- ✅ Auto-deploy on git push
- ✅ Build logs
- ✅ Monitoring

**Your portfolio will be live in minutes!** ⚡



