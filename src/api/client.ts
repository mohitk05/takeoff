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

export async function getPlaybackState(): Promise<PlaybackState> {
  const response = await fetch(`${API_BASE_URL}/api/playback`);
  if (!response.ok) {
    throw new Error('Failed to fetch playback state');
  }
  return response.json();
}

export async function sendHeartbeat(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/heartbeat`, {
    method: 'POST',
  });
}
