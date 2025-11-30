import { tokenStorage } from './auth';

const API_BASE_URL = 'http://localhost:3000/api/upload';

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

