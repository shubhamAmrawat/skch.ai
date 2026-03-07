/**
 * Resolve avatar URL for display.
 * Handles relative paths (prepends API base) and ensures full URLs work correctly.
 * Cloudinary and Google return full URLs; some backends may return relative paths.
 */
export function getAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
    return null;
  }

  const trimmed = avatar.trim();

  // Already a full URL (http/https)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative path - prepend API base URL
  const apiBase = import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (apiBase) {
    const origin = apiBase.replace(/\/api.*$/, ''); // e.g. http://localhost:5000
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${origin}${path}`;
  }

  return trimmed;
}
