#!/bin/bash

# Quick deployment script for Cloudflare Pages
# This sets the environment variable and triggers a redeploy

echo "🚀 Setting up Takeoff deployment..."

API_URL="https://takeoff-api.karekar-mohit.workers.dev"

echo ""
echo "📝 To complete deployment, you need to:"
echo ""
echo "1. Go to Cloudflare Pages Dashboard:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "2. Select your 'takeoff' project"
echo ""
echo "3. Go to Settings → Environment variables"
echo ""
echo "4. Add this variable:"
echo "   Name:  VITE_API_URL"
echo "   Value: $API_URL"
echo "   Environment: Production"
echo ""
echo "5. Save and trigger a redeploy (or push to GitHub)"
echo ""
echo "✅ Your Worker API is already live at:"
echo "   $API_URL"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://takeoff.mohitkarekar.com/"
echo ""

# Optional: Trigger redeploy via empty commit
read -p "Would you like to trigger a redeploy by pushing an empty commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git commit --allow-empty -m "Deploy: Connect frontend to production API"
    git push
    echo "✅ Pushed to GitHub - Cloudflare Pages will auto-deploy"
fi
