export interface SaveMediaRequest {
  key: string;
  publicUrl: string;
  contentType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  tag?: string;
  entityType?: string;
  entityId?: string | number;
}

export interface SaveMediaResponse {
  id: string;
  data: Record<string, unknown>;
}

const DEFAULT_BACKEND_URL = 'http://localhost:4000';
const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? DEFAULT_BACKEND_URL;

export async function saveMedia(payload: SaveMediaRequest): Promise<SaveMediaResponse> {
  const res = await fetch(`${API_BASE_URL}/api/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to save media');
  }
  return (await res.json()) as SaveMediaResponse;
}

