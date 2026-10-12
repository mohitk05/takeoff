import { videos } from './videos';
import { PlaybackState } from './playback-state';

export { PlaybackState };

interface Env {
  PLAYBACK_STATE: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/videos - Get all videos
      if (url.pathname === '/api/videos') {
        return new Response(JSON.stringify(videos), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // GET /api/playback - Get current playback state
      if (url.pathname === '/api/playback') {
        const id = env.PLAYBACK_STATE.idFromName('global');
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
        const id = env.PLAYBACK_STATE.idFromName('global');
        const stub = env.PLAYBACK_STATE.get(id);
        return stub.fetch(new Request(new URL('/heartbeat', request.url), {
          method: 'POST',
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
