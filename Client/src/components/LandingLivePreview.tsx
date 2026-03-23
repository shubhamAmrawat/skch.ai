import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw, MousePointer2, X } from 'lucide-react';
import { generateGalleryIframeHtml } from './galleryIframeDocument';

// Render iframe at a real desktop viewport, then CSS-scale to fit the card.
// Container height = PREVIEW_HEIGHT * scale, derived from card width — zero flicker.
const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 600;

// Module-level activation cache — survives React re-mounts within same session
const activatedCodes = new Set<string>();

// Stable counter for unique gallery IDs — module-level so it never resets
let _nextGalleryId = 1;

interface LandingLivePreviewProps {
  code: string;
}

export function LandingLivePreview({ code }: LandingLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // useState lazy initializer is pure — runs once, outside render cycle
  const [galleryId] = useState(() => _nextGalleryId++);

  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // interactive = true means the iframe receives pointer events directly
  const [interactive, setInteractive] = useState(false);

  // Derive container height from its own width — no postMessage needed
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / PREVIEW_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset interactive mode when the component code changes
  useEffect(() => {
    setInteractive(false);
  }, [code]);

  // Listen for error messages from this specific iframe instance
  useEffect(() => {
    const id = galleryId;
    const handler = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.__galleryId !== id) return;
      if (d.type === 'gallery-error' && typeof d.message === 'string') {
        setError(d.message);
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [galleryId]);

  // Inject srcdoc whenever code changes
  useEffect(() => {
    if (!iframeRef.current || !code) return;
    setIsLoading(true);
    setError(null);
    iframeRef.current.srcdoc = generateGalleryIframeHtml(code, galleryId);
  }, [code, galleryId]);

  const handleRetry = () => {
    if (!iframeRef.current || !code) return;
    setIsLoading(true);
    setError(null);
    setInteractive(false);
    iframeRef.current.srcdoc = generateGalleryIframeHtml(code, galleryId);
  };

  if (!code) return null;

  const scaledHeight = PREVIEW_HEIGHT * scale;
  const ready = !isLoading && !error;

  return (
    <div
      ref={containerRef}
      className="w-full relative bg-white overflow-hidden group/preview"
      style={{ height: `${scaledHeight}px` }}
    >
      {/* Loading state */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Rendering...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10 p-4">
          <div className="flex flex-col items-center gap-3 max-w-xs text-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            <p className="text-xs text-red-600 font-mono bg-red-100 px-3 py-2 rounded-lg break-all">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* The iframe — pointer events controlled by interactive mode */}
      <iframe
        ref={iframeRef}
        title="Gallery preview"
        className="border-0 block"
        style={{
          width: `${PREVIEW_WIDTH}px`,
          height: `${PREVIEW_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: interactive ? 'auto' : 'none',
        }}
        sandbox="allow-scripts allow-forms"
        onLoad={() => setIsLoading(false)}
      />

      {/* ── Hover-to-interact overlay (shown when ready and NOT interactive) ── */}
      {ready && !interactive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200">
          {/* Gradient fade at the bottom so the button is readable */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="relative z-10 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-white transition-colors"
          >
            <MousePointer2 className="w-3.5 h-3.5 text-indigo-500" />
            Click to interact
          </button>
        </div>
      )}

      {/* ── Interactive mode active indicator ── */}
      {ready && interactive && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
          {/* Pulsing live dot */}
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm px-2.5 py-1 text-[10px] font-semibold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
          <button
            type="button"
            onClick={() => setInteractive(false)}
            className="flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <X className="w-3 h-3" />
            Exit
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy wrapper — activates once when near viewport, never deactivates.
 * Placeholder uses the same aspect ratio as the preview so there's no layout
 * shift when the real preview mounts.
 */
export function LazyLandingLivePreview({ code }: { code: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() => activatedCodes.has(code));

  useEffect(() => {
    if (active) return;
    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          activatedCodes.add(code);
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, code]);

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      {active ? (
        <LandingLivePreview code={code} />
      ) : (
        // aspect-ratio matches PREVIEW_WIDTH/PREVIEW_HEIGHT (1200/600 = 2/1)
        // so the placeholder height is always proportional to the card width
        <div
          className="w-full bg-linear-to-br from-slate-50 to-slate-100 animate-pulse rounded-lg"
          style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
          aria-hidden
        />
      )}
    </div>
  );
}
