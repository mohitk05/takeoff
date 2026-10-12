# Takeoff ✈️

A TV-style synchronized video playback app featuring aviation videos. Watch cockpit views, takeoffs, and landings together with others in real-time.

## Features

- **TV Mode**: Synchronized playback across all viewers - everyone watches the same video at the same time
- **Curated Aviation Content**: Pilot POV, passenger views, takeoffs, landings, and more
- **Real-time Viewer Count**: See how many people are watching with you
- **Tag Filtering**: Filter videos by tags like pilot-pov, landing, night-landing, etc.
- **Keyboard Controls**: Navigate videos and seek with arrow keys
- **Clean UI**: Minimalist design with video metadata display

## Architecture

### Frontend (Vue 3)
- `/src` - Vue 3 + TypeScript application
- `/src/api/client.ts` - API client for worker communication
- `/src/components/Root.vue` - Main video player component

### Backend (Cloudflare Worker)
- `/worker` - Cloudflare Worker API
- `/worker/src/index.ts` - Main worker entry point
- `/worker/src/playback-state.ts` - Durable Object for synchronized state
- `/worker/src/videos.ts` - Video database

The worker uses a Cloudflare Durable Object to maintain a global playback state, ensuring all clients watch the same video at approximately the same time.

## Development

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- Cloudflare account (for worker deployment)

### Frontend Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build
```

### Worker Development

```bash
# Navigate to worker directory
cd worker

# Install dependencies
npm install

# Start local worker
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### Running Both

You'll need two terminals:

**Terminal 1 - Worker:**
```bash
cd worker
npm run dev
# Worker runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
pnpm run dev
# Frontend runs on http://localhost:5173
```

## Environment Variables

Create `.env.local` for local development:
```bash
VITE_API_URL=http://localhost:8787
```

For production, update `.env.production` with your deployed worker URL:
```bash
VITE_API_URL=https://takeoff-api.your-subdomain.workers.dev
```

## Deployment

### Deploy Worker
```bash
cd worker
npm run deploy
```

### Deploy Frontend (Cloudflare Pages)
1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `pnpm run build`
3. Set build output directory: `dist`
4. Add environment variable: `VITE_API_URL=<your-worker-url>`

## Future Enhancements

- [ ] WebSocket support for live viewer updates
- [ ] Reactions and emoji system
- [ ] Chat functionality
- [ ] Multiple "channels" with different playlists
- [ ] Admin controls to manage playback
- [ ] User authentication
- [ ] Favorites and history

## License

MIT
