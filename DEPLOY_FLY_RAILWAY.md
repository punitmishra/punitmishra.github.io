# Deploy to Fly.io or Railway 🚀

## 🚂 Railway (Easier - Recommended)

### Quick Deploy Steps:

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose**: `punitmishra/punitmishra.github.io`
6. **Railway auto-detects**:
   - Framework: Node.js
   - Build Command: `npm run build`
   - Start Command: `npx serve dist -s -l $PORT`
7. **Add Environment Variable**:
   - `PORT` = `3000` (or Railway will auto-assign)
8. **Click "Deploy"**
9. **Wait ~3-5 minutes**

### After Deployment:
- Railway provides a URL: `your-app.railway.app`
- You can add custom domain in settings
- Automatic deployments on every push to `main`

### Manual Setup (if needed):
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
cd /Users/punitmishra/punitmishra.github.io
railway link

# Deploy
railway up
```

---

## 🪰 Fly.io

### Quick Deploy Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Deploy**:
   ```bash
   cd /Users/punitmishra/punitmishra.github.io
   fly launch
   ```
   - Follow prompts
   - App name: `punitmishra-portfolio` (or choose your own)
   - Region: Choose closest (e.g., `iad` for US East)
   - Don't deploy yet, we'll configure first

4. **Update fly.toml** (already created):
   - App name is set
   - Region configured

5. **Deploy**:
   ```bash
   fly deploy
   ```

6. **Get URL**:
   ```bash
   fly open
   ```

### Custom Domain (Fly.io):
```bash
# Add domain
fly domains add punitmishra.com

# Get DNS records
fly domains show punitmishra.com

# Update DNS, then:
fly certs create punitmishra.com
```

---

## 📊 Comparison

### Railway
- ✅ **Easier setup** - Just connect GitHub
- ✅ **Auto-detects** framework
- ✅ **Free tier**: $5 credit/month
- ✅ **Simple** - No Dockerfile needed
- ✅ **Auto-deploy** on git push

### Fly.io
- ✅ **More control** - Docker-based
- ✅ **Global edge** network
- ✅ **Free tier**: 3 shared VMs
- ✅ **Better for** complex apps
- ⚠️ **More setup** required

---

## 🎯 Recommendation

**For your portfolio**: **Railway** is easier and faster to set up.

**Steps**:
1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select your repo
5. Deploy!

**That's it!** Railway handles everything automatically.

---

## 🔧 Configuration Files Created

- ✅ `railway.json` - Railway configuration
- ✅ `Dockerfile` - For Fly.io (or Railway if needed)
- ✅ `nginx.conf` - Nginx config for Docker
- ✅ `fly.toml` - Fly.io configuration
- ✅ `.dockerignore` - Docker ignore file

---

## 🚀 After Deployment

Both platforms provide:
- ✅ HTTPS automatically
- ✅ Custom domain support
- ✅ Auto-deploy on git push
- ✅ Build logs and monitoring
- ✅ Free tier available

---

## 💡 Quick Start Commands

### Railway:
```bash
# Via web UI (easiest)
# Just go to railway.app and connect GitHub repo
```

### Fly.io:
```bash
fly auth login
cd /Users/punitmishra/punitmishra.github.io
fly launch
fly deploy
```

---

## 📝 Notes

- **Railway**: Best for quick deployment, auto-detects everything
- **Fly.io**: More control, Docker-based, better for complex setups
- Both support custom domains
- Both have free tiers
- Both auto-deploy on git push

**Choose Railway for simplicity, Fly.io for more control!**



