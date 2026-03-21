import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { generateIframeDocumentHtml } from './livePreview/livePreviewIframeDocument';

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevCodeRef = useRef<string>('');

  const renderPreview = useCallback(() => {
    if (!code || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const htmlContent = generateIframeDocumentHtml(code, 'editor');
    iframe.srcdoc = htmlContent;
  }, [code]);

  useEffect(() => {
    if (code !== prevCodeRef.current) {
      prevCodeRef.current = code;
      if (code) {
        queueMicrotask(() => {
          setIsLoading(true);
          setError(null);
        });
      }
    }
  }, [code]);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    renderPreview();

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setError(event.data.message);
        setIsLoading(false);
      } else if (event.data.type === 'ready') {
        setIsLoading(false);
        setError(null);
      }
    };

    window.addEventListener('message', handleMessage);

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [code, renderPreview]);

  const handleRetry = () => {
    if (iframeRef.current && code) {
      setIsLoading(true);
      setError(null);
      iframeRef.current.srcdoc = generateIframeDocumentHtml(code, 'editor');
    }
  };

  if (!code) {
    return null;
  }

  return (
    <div className="h-full w-full relative bg-white rounded-lg overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Rendering component...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10 p-4">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Render Error</h3>
              <p className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded-lg">
                {error}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Iframe for rendering */}
      <iframe
        ref={iframeRef}
        title="Live Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
