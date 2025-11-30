import { tokenStorage } from './auth';

// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '/api/upload');

// Debug: Log to verify environment variable is loaded
if (import.meta.env.DEV) {
  console.log('[Upload] Environment Variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    'Using (final)': API_BASE_URL,
    'MODE': import.meta.env.MODE,
  });
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    avatar: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  };
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<UploadResponse> {
  try {
    const token = tokenStorage.getAccessToken();

    if (!token) {
      return {
        success: false,
        error: 'Not authenticated',
        message: 'Please log in to upload an avatar.',
      };
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    // Update stored user if successful
    if (result.success && result.data?.user) {
      const storedUser = tokenStorage.getUser();
      if (storedUser) {
        storedUser.avatar = result.data.user.avatar;
        tokenStorage.setUser(storedUser);
      }
    }

    return result;
  } catch (error) {
    console.error('[Upload] Avatar upload error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to upload avatar. Please try again.',
    };
  }
}

/**
 * Remove avatar image
 */
export async function removeAvatar(): Promise<UploadResponse> {
  try {
    const token = tokenStorage.getAccessToken();

    if (!token) {
      return {
        success: false,
        error: 'Not authenticated',
        message: 'Please log in to remove your avatar.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/avatar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const result = await response.json();

    // Update stored user if successful
    if (result.success && result.data?.user) {
      const storedUser = tokenStorage.getUser();
      if (storedUser) {
        storedUser.avatar = null;
        tokenStorage.setUser(storedUser);
      }
    }

    return result;
  } catch (error) {
    console.error('[Upload] Remove avatar error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to remove avatar. Please try again.',
    };
  }
}

