#!/bin/bash

# Railway Deployment Script
echo "🚂 Deploying to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm i -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

echo "📦 Linking project..."
railway link

echo "🚀 Deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL shown above"
echo ""
echo "💡 To view logs: railway logs"
echo "💡 To open site: railway open"



