import { videos as seedVideos, type Video } from './videos';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const TAG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function parseVideoInput(input: unknown): Video | string {
  if (!input || typeof input !== 'object') return 'Body must be an object';
  const { id, tags, duration } = input as Record<string, unknown>;
  if (typeof id !== 'string' || !YOUTUBE_ID.test(id)) {
    return 'id must be an 11-character YouTube video id';
  }
  if (
    !Array.isArray(tags) || tags.length === 0 || tags.length > 20 ||
    !tags.every((t) => typeof t === 'string' && TAG.test(t))
  ) {
    return 'tags must be a non-empty array of lowercase kebab-case strings';
  }
  if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
    return 'duration must be a positive integer (seconds)';
  }
  return { id, tags: [...new Set(tags as string[])], duration };
}

/** Single source of truth for the video list. Seeded from videos.ts on first use. */
export class VideoLibrary implements DurableObject {
  constructor(private state: DurableObjectState) {}

  private async load(): Promise<Video[]> {
    const stored = await this.state.storage.get<Video[]>('videos');
    if (stored) return stored;
    await this.state.storage.put('videos', seedVideos);
    return seedVideos;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/videos' && request.method === 'GET') {
      return json(await this.load());
    }

    if (url.pathname === '/videos' && request.method === 'POST') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Body must be valid JSON' }, 400);
      }
      const video = parseVideoInput(body);
      if (typeof video === 'string') return json({ error: video }, 400);

      // Durable Objects process requests with input gates, so this
      // read-modify-write is not interleaved with other requests.
      const videos = await this.load();
      if (videos.some((v) => v.id === video.id)) {
        return json({ error: `Video ${video.id} already exists` }, 409);
      }
      videos.push(video);
      await this.state.storage.put('videos', videos);
      return json({ success: true, video, total: videos.length }, 201);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
}
