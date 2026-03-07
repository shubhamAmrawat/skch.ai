import { tokenStorage } from './auth';
import { refreshAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Make authenticated request to main API (sketches, etc.)
 * Uses VITE_API_BASE_URL and adds JWT token.
 * Handles 401 by attempting token refresh and retry.
 */
async function authApiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const base = API_BASE_URL?.replace(/\/$/, '') || '';
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;
  const token = tokenStorage.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Try token refresh on 401
  if (response.status === 401) {
    try {
      const data = await response.clone().json();
      if (data.code === 'TOKEN_EXPIRED') {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const newToken = tokenStorage.getAccessToken();
          if (newToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...options, headers, credentials: 'include' });
          }
        } else {
          tokenStorage.clearAll();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'Session expired') throw e;
      // If JSON parse fails, continue with original response
    }
  }

  return response;
}

// ===================
// Types
// ===================

export interface Sketch {
  id: string;
  title: string;
  code: string;
  thumbnail?: string | null;
  tldrawSnapshot?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSketchResponse {
  success: boolean;
  data?: { sketch: Sketch };
  error?: string;
  message?: string;
}

export interface ListSketchesResponse {
  success: boolean;
  data?: {
    sketches: Sketch[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
  message?: string;
}

export interface GetSketchResponse {
  success: boolean;
  data?: { sketch: Sketch };
  error?: string;
  message?: string;
}

/**
 * Create a new sketch
 */
export async function createSketch(params: {
  title?: string;
  code: string;
  tldrawSnapshot?: string | null;
  thumbnail?: string | null;
}): Promise<CreateSketchResponse> {
  const response = await authApiFetch('/sketches', {
    method: 'POST',
    body: JSON.stringify({
      title: params.title?.trim() || 'Untitled Sketch',
      code: params.code,
      tldrawSnapshot: params.tldrawSnapshot ?? null,
      thumbnail: params.thumbnail ?? null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to save sketch');
  }

  return data;
}

/**
 * List user's sketches (paginated)
 */
export async function getSketches(params?: {
  page?: number;
  limit?: number;
}): Promise<ListSketchesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();

  const response = await authApiFetch(`/sketches${query ? `?${query}` : ''}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to load sketches');
  }

  return data;
}

/**
 * Get a single sketch
 */
export async function getSketch(id: string): Promise<GetSketchResponse> {
  const response = await authApiFetch(`/sketches/${id}`);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Sketch not found');
    }
    throw new Error(data.message || data.error || 'Failed to load sketch');
  }

  return data;
}

/**
 * Update a sketch
 */
export async function updateSketch(
  id: string,
  params: { title?: string; code?: string; tldrawSnapshot?: string | null; thumbnail?: string | null }
): Promise<CreateSketchResponse> {
  const response = await authApiFetch(`/sketches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to update sketch');
  }

  return data;
}

/**
 * Delete a sketch
 */
export async function deleteSketch(id: string): Promise<void> {
  const response = await authApiFetch(`/sketches/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to delete sketch');
  }
}
