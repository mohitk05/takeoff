export interface Video {
  id: string;
  tags: string[];
  duration: number;
}

export interface PlaybackState {
  videoId: string;
  videoIndex: number;
  position: number;
  duration: number;
  tags: string[];
  viewers: number;
  serverTime: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function getVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/api/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
}

export async function getPlaybackState(videoId?: string): Promise<PlaybackState> {
  const url = videoId
    ? `${API_BASE_URL}/api/playback?videoId=${encodeURIComponent(videoId)}`
    : `${API_BASE_URL}/api/playback`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch playback state');
  }
  return response.json();
}

export async function sendHeartbeat(videoId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId }),
  });
}
