# Migration to TV-Style Synchronized Playback

## Overview
Converted Takeoff from client-side random video playback to a TV-style synchronized experience where all viewers watch the same video at approximately the same time.

## Architecture Changes

### Before
- Videos stored in `/src/assets/videos.json`
- Client-side random selection
- Each user watches different videos
- No viewer interaction

### After
- Videos managed by Cloudflare Worker
- Server maintains global playback state
- All users synchronized to same video/position
- Real-time viewer count
- Foundation for social features

## Components

### 1. Cloudflare Worker (`/worker`)
**Purpose**: Manage synchronized playback state and serve video data

**Files**:
- `src/index.ts` - HTTP API endpoints
- `src/playback-state.ts` - Durable Object for state management
- `src/videos.ts` - Video database
- `wrangler.toml` - Worker configuration

**API Endpoints**:
- `GET /api/videos` - Get all videos
- `GET /api/playback` - Get current synchronized playback state
- `POST /api/heartbeat` - Send viewer heartbeat

**How It Works**:
The Durable Object stores:
- Current video index
- Current position in video
- Last update timestamp
- Viewer count

When clients request playback state:
1. Calculate elapsed time since last update
2. Advance position accordingly
3. Auto-advance to next video when current ends
4. Return exact video ID and start position

### 2. Frontend Updates (`/src`)
**New Files**:
- `src/api/client.ts` - API client for worker communication
- `.env.local` - Local development config
- `.env.production` - Production config template

**Updated Files**:
- `src/components/Root.vue`:
  - Fetch videos from API instead of local JSON
  - Request synchronized playback state on start
  - Seek to correct position when video loads
  - Send heartbeat every 20 seconds
  - Display viewer count

## How Synchronization Works

1. **User loads page**: Videos are fetched from API
2. **User clicks "Gear up"**: 
   - Request current playback state from worker
   - Worker calculates current position based on elapsed time
   - Client receives video ID and exact second to start
3. **Video starts**: YouTube player seeks to specified position
4. **Heartbeat**: Client sends heartbeat every 20s to update viewer count
5. **Video ends**: Client advances to next video (still synced via state)

## Approximate Synchronization

The system provides "approximate" synchronization (±few seconds) because:
- Network latency varies per user
- YouTube player load time varies
- No WebSocket real-time updates (yet)

This is acceptable for TV-style viewing and can be improved with WebSockets.

## Development Workflow

### Running Locally
Two terminals required:

**Terminal 1 - Worker:**
```bash
cd worker
npm run dev
# Runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
pnpm run dev
# Runs on http://localhost:5173
# Configured to use localhost:8787 via .env.local
```

### Testing
1. Open multiple browser windows to http://localhost:5173
2. Click "Gear up" in each
3. All windows should start the same video at approximately the same position
4. Viewer count should increment

## Deployment

### Worker
```bash
cd worker
npm run deploy
```
Note worker URL (e.g., `https://takeoff-api.your-name.workers.dev`)

### Frontend (Cloudflare Pages)
1. Update `.env.production` with worker URL
2. Push to GitHub
3. Cloudflare Pages auto-deploys
4. Set `VITE_API_URL` environment variable in Pages dashboard

## Future Enhancements

### Phase 1: Real-time Features (WebSockets)
- Live viewer count updates
- Presence indicators
- Typing indicators for future chat

### Phase 2: Social Features
- Emoji reactions overlay on video
- Chat sidebar
- User avatars/names

### Phase 3: Channels
- Multiple synchronized "channels" with different playlists
- User can switch between channels
- Each channel has its own Durable Object instance

### Phase 4: Admin Controls
- Admin dashboard to:
  - Pause/play for all viewers
  - Skip videos
  - Schedule specific videos
  - Moderate content

## Trade-offs Made

**Chose Durable Objects over:**
- KV Store: Need consistency, not eventual consistency
- D1: Overkill for simple state, adds complexity
- R2: Not designed for rapidly changing state

**Chose Approximate Sync over Perfect Sync:**
- Perfect sync would require WebSockets and complex time synchronization
- Approximate sync (±5s) is acceptable for casual viewing
- Keeps architecture simpler for MVP
- Can improve later with WebSockets

**Chose Heartbeat over WebSocket (for now):**
- Simpler to implement
- Lower worker cost
- Good enough for viewer count
- Will migrate to WebSocket for Phase 1

## Testing the System

### Verify Playback Advances
```bash
# Call twice with ~10 second delay
curl http://localhost:8787/api/playback | jq '.position'
sleep 10
curl http://localhost:8787/api/playback | jq '.position'
# Position should have advanced by ~10 seconds
```

### Verify Video Transitions
```bash
# Get current state
STATE=$(curl -s http://localhost:8787/api/playback)
echo $STATE | jq '.videoId, .position, .duration'
# If position is close to duration, wait and call again to see video change
```

### Verify Viewer Count
```bash
# Send heartbeat
curl -X POST http://localhost:8787/api/heartbeat

# Check count increased
curl http://localhost:8787/api/playback | jq '.viewers'
```
