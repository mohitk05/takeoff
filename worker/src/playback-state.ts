import { videos } from './videos';

interface PlaybackStateData {
  currentVideoIndex: number;
  currentPosition: number; // seconds into the current video
  lastUpdated: number; // timestamp
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
        return this.getState(corsHeaders);
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

  private async getState(corsHeaders: Record<string, string>): Promise<Response> {
    // Load state from storage if not in memory
    if (!this.playbackData) {
      const stored = await this.state.storage.get<PlaybackStateData>('playback');
      if (stored) {
        this.playbackData = stored;
      } else {
        // Initialize with first video
        this.playbackData = {
          currentVideoIndex: 0,
          currentPosition: 0,
          lastUpdated: Date.now(),
          viewers: 0,
        };
        await this.state.storage.put('playback', this.playbackData);
      }
    }

    // Calculate current position based on elapsed time
    const now = Date.now();
    const elapsedSeconds = (now - this.playbackData.lastUpdated) / 1000;
    let position = this.playbackData.currentPosition + elapsedSeconds;
    let videoIndex = this.playbackData.currentVideoIndex;

    // Advance to next video if current one has ended
    while (position >= videos[videoIndex].duration) {
      position -= videos[videoIndex].duration;
      videoIndex = (videoIndex + 1) % videos.length;
    }

    const currentVideo = videos[videoIndex];

    return new Response(
      JSON.stringify({
        videoId: currentVideo.id,
        videoIndex,
        position: Math.floor(position),
        duration: currentVideo.duration,
        tags: currentVideo.tags,
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
      const stored = await this.state.storage.get<PlaybackStateData>('playback');
      if (stored) {
        this.playbackData = stored;
      } else {
        this.playbackData = {
          currentVideoIndex: 0,
          currentPosition: 0,
          lastUpdated: Date.now(),
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
