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

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string from API
}

export interface Sketch {
  id: string;
  title: string;
  code: string;
  thumbnail?: string | null;
  tldrawSnapshot?: string | null;
  visibility?: 'public' | 'private';
  tags?: string[];
  conversationHistory?: ConversationEntry[];
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

// ===================
// Public Sketches Types
// ===================

export interface PublicSketchAuthor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface PublicSketch {
  id: string;
  title: string;
  thumbnail?: string | null;
  tags: string[];
  likesCount: number;
  likedByMe: boolean;
  views: number;
  createdAt: string;
  author: PublicSketchAuthor | null;
}

export interface PublicSketchDetail extends Sketch {
  tags: string[];
  likesCount: number;
  likedByMe: boolean;
  views: number;
  author: PublicSketchAuthor | null;
}

export interface ListPublicSketchesResponse {
  success: boolean;
  data?: {
    sketches: PublicSketch[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
  message?: string;
}

export interface GetPublicSketchResponse {
  success: boolean;
  data?: { sketch: PublicSketchDetail };
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
  conversationHistory?: Array<{ role: string; content: string; timestamp: Date }>;
  visibility?: 'public' | 'private';
  tags?: string[];
}): Promise<CreateSketchResponse> {
  const response = await authApiFetch('/sketches', {
    method: 'POST',
    body: JSON.stringify({
      title: params.title?.trim() || 'Untitled Sketch',
      code: params.code,
      tldrawSnapshot: params.tldrawSnapshot ?? null,
      thumbnail: params.thumbnail ?? null,
      conversationHistory: params.conversationHistory?.map((h) => ({
        role: h.role,
        content: h.content,
        timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
      })) ?? [],
      visibility: params.visibility === 'public' ? 'public' : 'private',
      tags: params.tags ?? [],
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
  params: {
    title?: string;
    code?: string;
    tldrawSnapshot?: string | null;
    thumbnail?: string | null;
    conversationHistory?: Array<{ role: string; content: string; timestamp: Date }>;
    visibility?: 'public' | 'private';
    tags?: string[];
  }
): Promise<CreateSketchResponse> {
  const body: Record<string, unknown> = { ...params };
  if (params.conversationHistory) {
    body.conversationHistory = params.conversationHistory.map((h) => ({
      role: h.role,
      content: h.content,
      timestamp: h.timestamp instanceof Date ? h.timestamp.toISOString() : h.timestamp,
    }));
  }
  const response = await authApiFetch(`/sketches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to update sketch');
  }

  return data;
}

/**
 * List public sketches (paginated, searchable, sortable)
 * Pass signal to abort the request (e.g. on effect cleanup to avoid duplicate requests in Strict Mode).
 */
export async function getPublicSketches(
  params?: {
    page?: number;
    limit?: number;
    q?: string;
    tags?: string;
    sort?: 'recent' | 'popular' | 'trending';
  },
  signal?: AbortSignal
): Promise<ListPublicSketchesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.tags) searchParams.set('tags', params.tags);
  if (params?.sort) searchParams.set('sort', params.sort);
  const query = searchParams.toString();

  const response = await authApiFetch(`/sketches/public${query ? `?${query}` : ''}`, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to load public sketches');
  }

  return data;
}

/**
 * Get a single public sketch (increments view count)
 */
export async function getPublicSketch(id: string): Promise<GetPublicSketchResponse> {
  const response = await authApiFetch(`/sketches/public/${id}`);
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
 * Toggle like on a public sketch
 */
export async function likePublicSketch(id: string): Promise<{
  success: boolean;
  data?: { likesCount: number; likedByMe: boolean };
}> {
  const response = await authApiFetch(`/sketches/public/${id}/like`, {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to update like');
  }

  return data;
}

/**
 * Fork a public sketch (create a copy for the current user)
 */
export async function forkPublicSketch(id: string): Promise<CreateSketchResponse> {
  const response = await authApiFetch(`/sketches/public/${id}/fork`, {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fork sketch');
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
