import { useState } from 'react';
import { getAvatarUrl } from '../utils/avatarUrl';

interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  getInitials?: (name: string) => string;
}

/**
 * Avatar image with proper URL resolution and error fallback.
 * Fixes display issues with relative URLs and external CDNs (Cloudinary, Google).
 */
export function AvatarImage({
  src,
  alt,
  className = '',
  fallback,
  getInitials,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getAvatarUrl(src);

  if (!resolvedUrl || hasError) {
    return fallback ?? (
      <div className={`flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold ${className}`}>
        {getInitials ? getInitials(alt) : alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
