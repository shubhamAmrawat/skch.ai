import { LogoIcon } from './Logo';

interface LoadingTransitionProps {
  title?: string;
  subtitle?: string;
}

export function LoadingTransition({
  title = "Preparing Your Canvas",
  subtitle = "Setting up the perfect sketching environment..."
}: LoadingTransitionProps) {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative">
          {/* Outer rings */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 w-28 h-28 rounded-full border-4 border-purple-500/30 animate-spin [animation-duration:3s]" />
          <div className="absolute inset-4 w-24 h-24 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />

          {/* Center logo */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <LogoIcon size={64} />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            {title}
          </h2>
          <p className="text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

