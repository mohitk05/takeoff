import { PlaybackState } from './playback-state';
import { VideoLibrary } from './video-library';

export { PlaybackState, VideoLibrary };

interface Env {
  PLAYBACK_STATE: DurableObjectNamespace;
  VIDEO_LIBRARY: DurableObjectNamespace;
  ADMIN_TOKEN?: string; // secret: bearer token required for POST /api/videos
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/videos - list, POST /api/videos - add a video (admin only)
      if (url.pathname === '/api/videos') {
        const library = env.VIDEO_LIBRARY.get(env.VIDEO_LIBRARY.idFromName('library'));

        if (request.method === 'POST') {
          if (!env.ADMIN_TOKEN) {
            return new Response(JSON.stringify({ error: 'Adding videos is not configured' }), {
              status: 503,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          if (request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        const res = await library.fetch(
          new Request(new URL('/videos', request.url), {
            method: request.method,
            body: request.method === 'POST' ? request.body : undefined,
            headers: request.headers,
          })
        );
        return res;
      }

      // GET /api/playback - Get current playback state
      if (url.pathname === '/api/playback') {
        const id = env.PLAYBACK_STATE.idFromName('global-v3'); // New DO instance with per-video viewers
        const stub = env.PLAYBACK_STATE.get(id);
        const stateUrl = new URL('/state', request.url);
        // Pass through videoId query parameter if present
        const videoId = url.searchParams.get('videoId');
        if (videoId) {
          stateUrl.searchParams.set('videoId', videoId);
        }
        return stub.fetch(new Request(stateUrl));
      }

      // POST /api/heartbeat - Send viewer heartbeat
      if (url.pathname === '/api/heartbeat' && request.method === 'POST') {
        const id = env.PLAYBACK_STATE.idFromName('global-v3'); // New DO instance with per-video viewers
        const stub = env.PLAYBACK_STATE.get(id);
        return stub.fetch(new Request(new URL('/heartbeat', request.url), {
          method: 'POST',
          body: request.body,
          headers: request.headers,
        }));
      }

      return new Response('Not found', {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};
