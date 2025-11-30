interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 52, text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { text } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className} border border-purple-500/20 rounded-lg px-4 py-0.5 shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow duration-200 cursor-cell`}>
      {/* Custom SVG Logo */}
      {/* <LogoIcon size={icon} /> */}

      {/* Text */}
      {showText && (
        <span className={`font-bold tracking-tight ${text}`}>
          <span className="text-white">sktch</span>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">.ai</span>
        </span>
      )}
    </div>
  );
}

// Standalone icon version for favicon-like uses
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="bgGrad" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        {/* Subtle inner glow */}
        <radialGradient id="innerGlow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#bgGrad)" />
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#innerGlow)" />

      {/* Inner container */}
      <rect x="14" y="14" width="36" height="36" rx="10" fill="rgba(15,23,42,0.18)" />

      {/* Left side: rough sketch stroke */}
      <path
        d="M19 35 C21 28, 22 25, 21 22 C20 19, 22 18, 24 19 C27 21, 28 23, 27 26 C26 29, 24 31, 24 33 C24 36, 26 38, 29 39"
        fill="none"
        stroke="#F9FAFB"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Right side: structured UI blocks */}
      {/* Header bar */}
      <rect x="31" y="19" width="14" height="5" rx="2.5" fill="#E5E7EB" opacity="0.95" />
      {/* Main card */}
      <rect x="31" y="27" width="14" height="10" rx="2.5" fill="#F9FAFB" opacity="0.95" />
      {/* Small rows */}
      <rect x="31" y="40" width="6" height="3" rx="1.5" fill="#E5E7EB" opacity="0.95" />
      <rect x="39" y="40" width="6" height="3" rx="1.5" fill="#E5E7EB" opacity="0.7" />

      {/* Code hint: <> at bottom-left */}
      <path d="M22 42 L19 45 L22 48" stroke="#E5E7EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
      <path d="M26 42 L29 45 L26 48" stroke="#E5E7EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />

      {/* Tiny AI orbit dot */}
      <circle cx="45" cy="18" r="1.8" fill="#A5B4FC" opacity="0.95" />
    </svg>
  );
}
