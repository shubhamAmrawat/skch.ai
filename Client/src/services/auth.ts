// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

// Debug: Log to verify environment variable is loaded
if (import.meta.env.DEV) {
  console.log('[Auth] Environment Variables:', {
    VITE_AUTH_API_BASE_URL: import.meta.env.VITE_AUTH_API_BASE_URL,
    'Using (final)': API_BASE_URL,
    'MODE': import.meta.env.MODE,
  });
}

// ===================
// Types
// ===================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isEmailVerified?: boolean;
  authProvider?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleAuthData {
  idToken: string;
}

// ===================
// Token Management
// ===================

const ACCESS_TOKEN_KEY = 'sktch_access_token';
const REFRESH_TOKEN_KEY = 'sktch_refresh_token';
const USER_KEY = 'sktch_user';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAll: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ===================
// API Helpers
// ===================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Make authenticated API request with automatic token refresh
 */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = tokenStorage.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const data = await response.json();

    if (data.code === 'TOKEN_EXPIRED') {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshed = await refreshAccessToken();
          isRefreshing = false;

          if (refreshed) {
            onTokenRefreshed(tokenStorage.getAccessToken()!);

            // Retry original request
            (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenStorage.getAccessToken()}`;
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
              credentials: 'include',
            });
          } else {
            tokenStorage.clearAll();
            window.location.href = '/login';
          }
        } catch (error) {
          isRefreshing = false;
          tokenStorage.clearAll();
          window.location.href = '/login';
          throw error;
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh(async (token) => {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
              credentials: 'include',
            });
            resolve(retryResponse);
          });
        });
      }
    }
  }

  return response;
}

// ===================
// Auth API Functions
// ===================

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
      tokenStorage.setUser(result.data.user);
    }

    return result;
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to connect to server. Please try again.',
    };
  }
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
      tokenStorage.setUser(result.data.user);
    }

    return result;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to connect to server. Please try again.',
    };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();

    await authFetch('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
  } finally {
    tokenStorage.clearAll();
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    const result = await response.json();

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Auth] Refresh token error:', error);
    return false;
  }
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<User | null> {
  try {
    const response = await authFetch('/me');
    const result = await response.json();

    if (result.success && result.data?.user) {
      tokenStorage.setUser(result.data.user);
      return result.data.user;
    }

    return null;
  } catch (error) {
    console.error('[Auth] Get me error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; avatar?: string }): Promise<AuthResponse> {
  try {
    const response = await authFetch('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success && result.data?.user) {
      tokenStorage.setUser(result.data.user);
    }

    return result;
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to update profile.',
    };
  }
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
  try {
    const response = await authFetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();

    if (result.success && result.data?.accessToken) {
      tokenStorage.setAccessToken(result.data.accessToken);
    }

    return result;
  } catch (error) {
    console.error('[Auth] Change password error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to change password.',
    };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!tokenStorage.getAccessToken();
}

/**
 * Login with Google OAuth
 * @param token - Google ID token or access token
 */
export async function loginWithGoogle(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token }), // Send as accessToken since useGoogleLogin returns access tokens
      credentials: 'include',
    });

    const result: AuthResponse = await response.json();

    if (result.success && result.data) {
      tokenStorage.setAccessToken(result.data.accessToken);
      tokenStorage.setRefreshToken(result.data.refreshToken);
      tokenStorage.setUser(result.data.user);
    }

    return result;
  } catch (error) {
    console.error('[Auth] Google login error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to connect to server. Please try again.',
    };
  }
}

/**
 * Initialize auth state (call on app start)
 */
export async function initializeAuth(): Promise<User | null> {
  const accessToken = tokenStorage.getAccessToken();

  if (!accessToken) {
    return null;
  }

  // Try to get fresh user data
  const user = await getMe();

  if (!user) {
    // Token might be expired, try to refresh
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return await getMe();
    }

    // Failed to refresh, clear tokens
    tokenStorage.clearAll();
    return null;
  }

  return user;
}

