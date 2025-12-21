# Deploy to Vercel - Quick Guide 🚀

## Option 1: GitHub Integration (Easiest - Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import Repository**: `punitmishra/punitmishra.github.io`
5. **Configure** (auto-detected):
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Click "Deploy"**
7. **Wait for deployment** (~2-3 minutes)
8. **Get your URL**: `punitmishra.vercel.app`

### Set Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add `punitmishra.com` and `www.punitmishra.com`
3. Update DNS records as shown
4. SSL is automatic

## Option 2: Vercel CLI

### Step 1: Login
```bash
cd /Users/punitmishra/punitmishra.github.io
vercel login
```
This opens a browser for authentication.

### Step 2: Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 3: Link to Git (Optional)
```bash
vercel link
```

## What Happens Next?

✅ **Automatic Deployments**: Every push to `main` branch
✅ **Preview URLs**: Every PR gets a preview deployment
✅ **Analytics**: Built-in performance monitoring
✅ **SSL**: Automatic HTTPS certificates
✅ **CDN**: Global content delivery network

## Configuration Already Done

- ✅ `vercel.json` configured
- ✅ Build settings optimized
- ✅ SPA routing configured
- ✅ Asset caching optimized

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Check Node.js version (should be 18+)

**Domain not working?**
- Check DNS records
- Wait for propagation (up to 24 hours)
- Verify in Vercel dashboard

**Need help?**
- Vercel docs: https://vercel.com/docs
- Support: https://vercel.com/support

