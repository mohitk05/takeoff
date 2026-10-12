# Deployment Guide

## ✅ Worker Deployed
Your Cloudflare Worker is live at:
**https://takeoff-api.karekar-mohit.workers.dev**

API Endpoints:
- `GET /api/videos` - List all videos
- `GET /api/playback` - Get current synchronized playback state  
- `POST /api/heartbeat` - Send viewer heartbeat

## 🚀 Deploy Frontend to Cloudflare Pages

Since your site is already hosted at **https://takeoff.mohitkarekar.com/**, you need to update the environment variable:

### Option 1: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select your `takeoff` project
3. Go to **Settings** → **Environment variables**
4. Add/Update the variable:
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://takeoff-api.karekar-mohit.workers.dev`
   - **Environment**: Production (and Preview if you want)
5. Click **Save**
6. Go to **Deployments** and click **Retry deployment** on the latest one
   - OR just push to GitHub and it will auto-redeploy

### Option 2: Via CLI

```bash
# Install Wrangler if not already
npm install -g wrangler

# Set the environment variable
wrangler pages project env add VITE_API_URL production
# When prompted, enter: https://takeoff-api.karekar-mohit.workers.dev
```

### Trigger Redeploy

The easiest way is to push a change to GitHub:

```bash
git commit --allow-empty -m "Trigger redeploy with new API URL"
git push
```

Cloudflare Pages will automatically:
1. Pull the latest code
2. Run `npm run build` 
3. Use the `VITE_API_URL` environment variable
4. Deploy to https://takeoff.mohitkarekar.com/

## 🧪 Test the Production Site

Once deployed, visit https://takeoff.mohitkarekar.com/ and:

1. Click **"Gear up"**
2. Open the browser console (F12)
3. You should see the app fetching from `https://takeoff-api.karekar-mohit.workers.dev`
4. Open multiple browser tabs/windows
5. They should all show the same video at approximately the same position
6. The viewer count should increase

## 🔍 Troubleshooting

### Check if environment variable is set:
```bash
wrangler pages deployment list --project-name=takeoff
```

### View build logs:
Go to Cloudflare Pages dashboard → Deployments → Click on latest deployment

### Test API directly:
```bash
curl https://takeoff-api.karekar-mohit.workers.dev/api/playback
```

### Check browser console:
Open DevTools → Network tab → Look for requests to your worker URL

## 🎯 What Happens Next

Once deployed:
- All visitors to https://takeoff.mohitkarekar.com/ will watch synchronized videos
- The global playback state is managed by your Cloudflare Worker
- Viewer count updates in real-time
- Videos auto-advance in a continuous loop

## 📊 Monitor Your Worker

View worker analytics:
```bash
cd worker
npm run tail
```

Or visit: https://dash.cloudflare.com/ → Workers & Pages → takeoff-api

## 🔄 Future Updates

### Update Worker:
```bash
cd worker
# Make changes to src/
npm run deploy
```

### Update Frontend:
```bash
# Make changes
git add -A
git commit -m "Your changes"
git push
# Cloudflare Pages auto-deploys
```

### Add More Videos:
Edit `worker/src/videos.ts` and redeploy the worker
