import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { generateIframeDocumentHtml } from './livePreview/livePreviewIframeDocument';

const HEIGHT_MSG_DEBOUNCE_MS = 60;

interface LandingLivePreviewProps {
  code: string;
}

/**
 * Gallery-only live preview: iframe height follows document content so components
 * are not clipped inside a scrollable iframe. Uses `generateIframeDocumentHtml(..., 'gallery')`.
 * Editor/detail views should keep using `LivePreview` so their behavior stays independent.
 */
export function LandingLivePreview({ code }: LandingLivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const prevCodeRef = useRef<string>('');
  const heightMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderPreview = useCallback(() => {
    if (!code || !iframeRef.current) return;
    iframeRef.current.srcdoc = generateIframeDocumentHtml(code, 'gallery');
  }, [code]);

  useEffect(() => {
    if (code !== prevCodeRef.current) {
      prevCodeRef.current = code;
      if (code) {
        queueMicrotask(() => {
          setIsLoading(true);
          setError(null);
          setContentHeight(null);
        });
      }
    }
  }, [code]);

  const measureIframeRoot = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      const rootEl = doc?.getElementById('root');
      if (!rootEl) return null;
      const h = Math.max(rootEl.scrollHeight, rootEl.offsetHeight);
      return h > 0 ? Math.ceil(h) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    renderPreview();

    const handleMessage = (event: MessageEvent) => {
      const d = event.data;
      if (d?.type === 'error') {
        if (heightMsgTimerRef.current) clearTimeout(heightMsgTimerRef.current);
        setError(d.message);
        setIsLoading(false);
        return;
      }
      if (d?.type === 'ready') {
        setError(null);
        return;
      }
      if (d?.type === 'sketch2code-preview-height' && typeof d.height === 'number' && d.height > 0) {
        const next = Math.ceil(d.height);
        if (heightMsgTimerRef.current) clearTimeout(heightMsgTimerRef.current);
        heightMsgTimerRef.current = setTimeout(() => {
          heightMsgTimerRef.current = null;
          setContentHeight(next);
          setError(null);
          setIsLoading(false);
        }, HEIGHT_MSG_DEBOUNCE_MS);
      }
    };

    window.addEventListener('message', handleMessage);

    const timeout = setTimeout(() => {
      if (heightMsgTimerRef.current) clearTimeout(heightMsgTimerRef.current);
      setIsLoading(false);
      setContentHeight((h) => {
        if (h != null) return h;
        const measured = measureIframeRoot();
        return measured ?? 200;
      });
    }, 2500);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (heightMsgTimerRef.current) clearTimeout(heightMsgTimerRef.current);
      clearTimeout(timeout);
    };
  }, [code, renderPreview, measureIframeRoot]);

  const handleRetry = () => {
    if (iframeRef.current && code) {
      setIsLoading(true);
      setError(null);
      setContentHeight(null);
      iframeRef.current.srcdoc = generateIframeDocumentHtml(code, 'gallery');
    }
  };

  if (!code) {
    return null;
  }

  const iframeHeightPx =
    contentHeight != null ? contentHeight : isLoading ? 120 : 1;

  return (
    <div className="w-full relative bg-white rounded-lg overflow-hidden min-h-0">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 min-h-[120px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Rendering component...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10 p-4 min-h-[120px]">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Render Error</h3>
              <p className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded-lg">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Component preview"
        className="w-full max-w-full border-0 block"
        style={{ height: `${iframeHeightPx}px`, width: '100%', overflow: 'hidden' }}
        scrolling="no"
        sandbox="allow-scripts allow-popups"
      />
    </div>
  );
}

/**
 * Mounts the live iframe only when the card scrolls near the viewport so the
 * landing page does not run dozens of Babel/Tailwind instances at once.
 */
export function LazyLandingLivePreview({ code }: { code: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full min-h-[132px] min-w-0">
      {active ? (
        <LandingLivePreview code={code} />
      ) : (
        <div
          className="w-full h-[132px] rounded-lg bg-slate-100/90 animate-pulse"
          aria-hidden
        />
      )}
    </div>
  );
}
