import { videos } from './videos';

interface PlaybackStateData {
  // Each video has its own virtual playback starting from when it was first accessed
  videoStates: {
    [videoId: string]: {
      startTime: number; // When this video's playback started (timestamp)
      viewers: number; // Current viewers for this video
    };
  };
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
        return this.heartbeat(corsHeaders, request);
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
        if ('currentVideoIndex' in stored || 'viewers' in stored) {
          // Old format detected - migrate to new format
          const migratedStates: any = {};
          if (stored.videoStates) {
            // Migrate existing video states and add viewers field
            for (const [vid, state] of Object.entries(stored.videoStates)) {
              const oldState = state as any;
              migratedStates[vid] = {
                startTime: oldState.startTime,
                viewers: 0,
              };
            }
          }
          this.playbackData = {
            videoStates: migratedStates,
          };
          await this.state.storage.put('playback', this.playbackData);
        } else {
          this.playbackData = stored as PlaybackStateData;
        }
      } else {
        // Initialize empty state
        this.playbackData = {
          videoStates: {},
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
        viewers: 0,
      };
      await this.state.storage.put('playback', this.playbackData);
    }

    // Ensure viewers field exists (migration)
    if (this.playbackData.videoStates[videoId].viewers === undefined) {
      this.playbackData.videoStates[videoId].viewers = 0;
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
        viewers: this.playbackData.videoStates[videoId].viewers,
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

  private async heartbeat(corsHeaders: Record<string, string>, request: Request): Promise<Response> {
    if (!this.playbackData) {
      const stored = await this.state.storage.get<any>('playback');
      if (stored) {
        // Migration: convert old format to new format
        if ('currentVideoIndex' in stored || 'viewers' in stored) {
          this.playbackData = {
            videoStates: stored.videoStates || {},
          };
        } else {
          this.playbackData = stored as PlaybackStateData;
        }
      } else {
        this.playbackData = {
          videoStates: {},
        };
      }
    }

    // Get videoId from request body
    let videoId: string | null = null;
    try {
      const body = await request.json() as { videoId?: string };
      videoId = body.videoId || null;
    } catch {
      // No body or invalid JSON - ignore
    }

    // If no videoId, default to first video
    if (!videoId) {
      videoId = videos[0].id;
    }

    // Initialize video state if needed
    if (!this.playbackData.videoStates[videoId]) {
      this.playbackData.videoStates[videoId] = {
        startTime: Date.now(),
        viewers: 0,
      };
    }

    // Increment viewer count for this specific video
    this.playbackData.videoStates[videoId].viewers += 1;
    await this.state.storage.put('playback', this.playbackData);

    // Decay viewer count after 30 seconds
    setTimeout(async () => {
      if (this.playbackData && this.playbackData.videoStates[videoId]) {
        this.playbackData.videoStates[videoId].viewers = Math.max(0, this.playbackData.videoStates[videoId].viewers - 1);
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
