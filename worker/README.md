# Takeoff Worker

Cloudflare Worker API for synchronized TV-style video playback.

## Architecture

This worker provides a synchronized playback experience where all viewers watch the same video at approximately the same time, similar to watching TV.

### Components

1. **Video Data** (`videos.ts`): Static list of all available videos with metadata
2. **Durable Object** (`playback-state.ts`): Manages the global playback state
3. **Worker** (`index.ts`): HTTP API endpoints

### How It Works

The worker uses a Cloudflare Durable Object to maintain a single source of truth for:
- Which video is currently playing
- The current position in that video
- When it was last updated

When clients request the current playback state, the worker:
1. Calculates elapsed time since last update
2. Advances the position accordingly
3. Auto-advances to the next video when current one ends
4. Returns the exact video ID and position to start from

This ensures all clients are watching the same content at approximately the same time.

## API Endpoints

### GET `/api/videos`
Returns the complete list of videos.

**Response:**
```json
[
  {
    "id": "a9o-PE-DLNA",
    "tags": ["pilot-pov", "takeoff", "landing", "cockpit-view"],
    "duration": 1082
  },
  ...
]
```

### GET `/api/playback`
Returns the current playback state.

**Response:**
```json
{
  "videoId": "a9o-PE-DLNA",
  "videoIndex": 0,
  "position": 245,
  "duration": 1082,
  "tags": ["pilot-pov", "takeoff", "landing", "cockpit-view"],
  "viewers": 5,
  "serverTime": 1234567890
}
```

### POST `/api/heartbeat`
Send a viewer heartbeat to update viewer count.

**Response:**
```json
{
  "success": true
}
```

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# View logs
npm run tail
```

## Deployment

1. Make sure you have a Cloudflare account and are logged in via `wrangler login`
2. Update `wrangler.toml` with your desired worker name and routes
3. Run `npm run deploy`

## Future Enhancements

- WebSocket support for real-time viewer count
- Reactions and emoji system
- Chat functionality
- Multiple "channels" with different playlists
- Admin controls to pause/skip videos
