import { videos } from './videos';

interface PlaybackStateData {
  // Each video has its own virtual playback starting from when it was first accessed
  videoStates: {
    [videoId: string]: {
      startTime: number; // When this video's playback started (timestamp)
    };
  };
  viewers: number;
}

export class PlaybackState implements DurableObject {
  private state: DurableObjectState;
  private playbackData: PlaybackStateData | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
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
      if (url.pathname === '/state' && request.method === 'GET') {
        const videoId = url.searchParams.get('videoId');
        return this.getState(corsHeaders, videoId);
      }

      if (url.pathname === '/heartbeat' && request.method === 'POST') {
        return this.heartbeat(corsHeaders);
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  private async getState(corsHeaders: Record<string, string>, videoId: string | null): Promise<Response> {
    // Load state from storage if not in memory
    if (!this.playbackData) {
      const stored = await this.state.storage.get<any>('playback');
      if (stored) {
        // Migration: convert old format to new format
        if ('currentVideoIndex' in stored && !('videoStates' in stored)) {
          // Old format detected - migrate to new format
          this.playbackData = {
            videoStates: {},
            viewers: stored.viewers || 0,
          };
          await this.state.storage.put('playback', this.playbackData);
        } else {
          this.playbackData = stored as PlaybackStateData;
        }
      } else {
        // Initialize empty state
        this.playbackData = {
          videoStates: {},
          viewers: 0,
        };
        await this.state.storage.put('playback', this.playbackData);
      }
    }

    // If no videoId specified, return first video
    if (!videoId) {
      videoId = videos[0].id;
    }

    // Find the video
    const video = videos.find(v => v.id === videoId);
    if (!video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();

    // If this video hasn't been accessed before, initialize it
    if (!this.playbackData.videoStates[videoId]) {
      this.playbackData.videoStates[videoId] = {
        startTime: now,
      };
      await this.state.storage.put('playback', this.playbackData);
    }

    // Calculate position: loops continuously based on elapsed time
    const startTime = this.playbackData.videoStates[videoId].startTime;
    const elapsedSeconds = (now - startTime) / 1000;
    const position = Math.floor(elapsedSeconds % video.duration);

    const videoIndex = videos.findIndex(v => v.id === videoId);

    return new Response(
      JSON.stringify({
        videoId: video.id,
        videoIndex,
        position,
        duration: video.duration,
        tags: video.tags,
        viewers: this.playbackData.viewers,
        serverTime: now,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  private async heartbeat(corsHeaders: Record<string, string>): Promise<Response> {
    if (!this.playbackData) {
      const stored = await this.state.storage.get<any>('playback');
      if (stored) {
        // Migration: convert old format to new format
        if ('currentVideoIndex' in stored && !('videoStates' in stored)) {
          this.playbackData = {
            videoStates: {},
            viewers: stored.viewers || 0,
          };
        } else {
          this.playbackData = stored as PlaybackStateData;
        }
      } else {
        this.playbackData = {
          videoStates: {},
          viewers: 0,
        };
      }
    }

    // Increment viewer count (simplified, in production use WebSocket connections)
    this.playbackData.viewers += 1;
    await this.state.storage.put('playback', this.playbackData);

    // Decay viewer count after 30 seconds
    setTimeout(async () => {
      if (this.playbackData) {
        this.playbackData.viewers = Math.max(0, this.playbackData.viewers - 1);
        await this.state.storage.put('playback', this.playbackData);
      }
    }, 30000);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}
