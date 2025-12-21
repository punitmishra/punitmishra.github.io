# Vercel Deployment Guide 🚀

## Why Vercel?

- ✅ **Better for Vue.js**: Optimized for modern frameworks
- ✅ **Faster builds**: Better caching and CDN
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Better routing**: Handles SPA routing perfectly
- ✅ **Analytics**: Built-in performance monitoring
- ✅ **Preview deployments**: Test before production

## Quick Setup

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/punitmishra/punitmishra.github.io
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import repository: `punitmishra/punitmishra.github.io`
4. Vercel auto-detects Vite configuration
5. Deploy!

### Option 3: Connect Custom Domain

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add `punitmishra.com` and `www.punitmishra.com`
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## Configuration

The `vercel.json` file is already configured:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing: All routes → `index.html`
- ✅ Asset caching: Optimized headers

## GitHub Pages → Vercel

After deploying to Vercel:

1. **Get Vercel URL**: Your site will be at `punitmishra.vercel.app`
2. **Update CNAME** (if using custom domain):
   - Point DNS to Vercel's servers
   - Vercel handles SSL automatically
3. **Keep GitHub Pages** (optional):
   - Can redirect to Vercel
   - Or disable GitHub Pages

## Benefits Over GitHub Pages

- ⚡ **Faster**: Global CDN, better caching
- 🔄 **Auto-deploy**: Every push to main
- 📊 **Analytics**: Built-in performance metrics
- 🔍 **Preview**: Test PRs before merging
- 🛠️ **Better DX**: Faster builds, better errors

## Environment Variables

If needed, add in Vercel dashboard:
- Settings → Environment Variables
- Add any API keys or secrets

## Next Steps

1. Deploy to Vercel
2. Test the deployment
3. Connect custom domain
4. Update DNS if needed
5. Enjoy faster, more reliable hosting!

