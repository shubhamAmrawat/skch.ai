import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { generateGalleryIframeHtml } from './galleryIframeDocument';
import { registerGalleryIframe, unregisterGalleryIframe } from './galleryPreviewBus';

// Module-level activation cache — survives React re-mounts within same session
const activatedCodes = new Set<string>();

// Module-level height cache — once a component's height is known, reuse it instantly
const heightCache = new Map<string, number>();

const DEFAULT_PLACEHOLDER_HEIGHT = 320;

interface LandingLivePreviewProps {
  code: string;
}

/**
 * Gallery live preview.
 * - Uses a single global message bus (one window listener total).
 * - Caches measured height so re-mounts render at the right size immediately.
 * - Never resets height once locked.
 * - srcdoc is injected exactly once per (code, galleryId) pair.
 */
export function LandingLivePreview({ code }: LandingLivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const galleryIdRef = useRef<number | null>(null);
  const heightLockedRef = useRef(false);
  const injectedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(() => !heightCache.has(code));
  const [error, setError] = useState<string | null>(null);
  // Init from cache so re-mounts get the right size instantly
  const [height, setHeight] = useState<number>(() => heightCache.get(code) ?? DEFAULT_PLACEHOLDER_HEIGHT);

  const lockHeight = useCallback((h: number) => {
    if (heightLockedRef.current) return;
    heightLockedRef.current = true;
    const final = Math.max(h, 80);
    heightCache.set(code, final); // persist for next mount
    setHeight(final);
    setIsLoading(false);
  }, [code]);

  useEffect(() => {
    if (!code) return;

    // Register with the global bus - use code as stable identifier
    console.log('[LandingLivePreview] Registering iframe with bus for code:', code.substring(0, 50) + '...');
    const id = registerGalleryIframe(
      code,
      (h) => {
        console.log('[LandingLivePreview] onHeight callback triggered with height:', h);
        lockHeight(h);
      },
      (msg) => {
        console.log('[LandingLivePreview] onError callback triggered with message:', msg);
        setError(msg);
        setIsLoading(false);
      }
    );
    console.log('[LandingLivePreview] Registered with galleryId:', id);
    galleryIdRef.current = id;

    // If we already have a cached height, don't show loading
    if (heightCache.has(code)) {
      heightLockedRef.current = true;
      setIsLoading(false);
      console.log('[LandingLivePreview] Using cached height for code');
    }

    return () => {
      console.log('[LandingLivePreview] Unregistering iframe with galleryId:', id);
      unregisterGalleryIframe(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Inject srcdoc — only once per mount (the iframe element is recreated on mount)
  useEffect(() => {
    if (!code || !iframeRef.current || injectedRef.current) return;
    if (galleryIdRef.current == null) return;

    injectedRef.current = true;
    heightLockedRef.current = heightCache.has(code); // lock immediately if cached

    iframeRef.current.srcdoc = generateGalleryIframeHtml(code, galleryIdRef.current);

    // Safety fallback: if no message within 3.5s, force-measure or use default
    const fallback = setTimeout(() => {
      if (heightLockedRef.current) return;
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc) {
          const root = doc.getElementById('root');
          if (root) {
            const h = Math.max(root.scrollHeight, root.offsetHeight, root.clientHeight);
            if (h > 10) { 
              lockHeight(h); 
              return; 
            }
          }
          // If root is empty, try measuring body
          const h = Math.max(doc.body.scrollHeight, doc.body.offsetHeight, doc.documentElement.scrollHeight);
          if (h > 10) { lockHeight(h); return; }
        }
      } catch { /* cross-origin or doc not ready */ }
      // Fallback to default height so loading state doesn't infinite loop
      lockHeight(DEFAULT_PLACEHOLDER_HEIGHT);
    }, 3500);

    return () => clearTimeout(fallback);
  // galleryIdRef.current is stable after the register effect runs first
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, galleryIdRef.current]);

  const handleRetry = () => {
    if (!iframeRef.current || !code || galleryIdRef.current == null) return;
    injectedRef.current = false;
    heightLockedRef.current = false;
    heightCache.delete(code);
    setHeight(DEFAULT_PLACEHOLDER_HEIGHT);
    setIsLoading(true);
    setError(null);
    injectedRef.current = true;
    iframeRef.current.srcdoc = generateGalleryIframeHtml(code, galleryIdRef.current);
  };

  if (!code) return null;

  return (
    <div className="w-full relative bg-white overflow-hidden" style={{ height: `${height}px` }}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Rendering...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10 p-4">
          <div className="flex flex-col items-center gap-3 max-w-xs text-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            <p className="text-xs text-red-600 font-mono bg-red-100 px-3 py-2 rounded-lg break-all">{error}</p>
            <button type="button" onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Gallery preview"
        className="w-full border-0 block"
        style={{ height: `${height}px`, width: '100%', pointerEvents: isLoading ? 'none' : 'auto' }}
        scrolling="no"
        sandbox="allow-scripts allow-popups"
      />
    </div>
  );
}

/**
 * Lazy wrapper — activates once when near viewport, never deactivates.
 * Module-level Set means activation survives React re-mounts.
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

  // Use cached height for placeholder so layout doesn't shift on activation
  const placeholderHeight = heightCache.get(code) ?? DEFAULT_PLACEHOLDER_HEIGHT;

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      {active ? (
        <LandingLivePreview code={code} />
      ) : (
        <div
          className="w-full bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse rounded-lg"
          style={{ height: `${placeholderHeight}px` }}
          aria-hidden
        />
      )}
    </div>
  );
}