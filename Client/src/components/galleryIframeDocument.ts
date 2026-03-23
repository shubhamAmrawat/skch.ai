/**
 * Dedicated iframe HTML for gallery (landing) previews.
 *
 * The parent scales the iframe via CSS transform — no height messaging needed.
 * Only gallery-error messages are posted so the parent can surface render failures.
 */

import { prepareCode } from './livePreview/livePreviewIframeDocument';

export function generateGalleryIframeHtml(code: string, galleryId: number): string {
  const cleanedCode = prepareCode(code);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gallery Preview</title>

  <script>
    (function(){
      var _w = console.warn;
      console.warn = function() {
        var a = arguments[0];
        if (typeof a === 'string' && (
          a.indexOf('cdn.tailwindcss.com') !== -1 ||
          a.indexOf('in-browser Babel') !== -1 ||
          a.indexOf('Babel transformer') !== -1
        )) return;
        _w.apply(console, arguments);
      };
    })();
  </script>

  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
    }
    #root { width: 100%; }
    img { max-width: 100%; display: block; }
  </style>

  <script>
    tailwind.config = {
      theme: { extend: { colors: { primary: '#6366f1', secondary: '#8b5cf6' } } }
    };
  </script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" data-presets="react">
    // ── Lucide icon shim ──────────────────────────────────────────────────────
    const _iconCache = {};
    window.LucideIcons = new Proxy(_iconCache, {
      get(target, prop) {
        if (typeof prop !== 'string') return () => null;
        if (!target[prop]) {
          target[prop] = function Icon({ className = '', size = 24, ...props }) {
            const ref = React.useRef(null);
            const kebab = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            React.useEffect(() => {
              if (!ref.current || !window.lucide?.createIcons) return;
              ref.current.innerHTML = '<i data-lucide="' + kebab + '"></i>';
              window.lucide.createIcons({ icons: window.lucide.icons, root: ref.current, attrs: { width: String(size), height: String(size) } });
              const svg = ref.current.querySelector('svg');
              if (svg && className) className.split(' ').filter(Boolean).forEach(c => svg.classList.add(c));
            }, []);
            return React.createElement('span', { ref, className: 'inline-flex items-center justify-center', ...props });
          };
        }
        return target[prop];
      }
    });

    // ── React hooks globals ───────────────────────────────────────────────────
    const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } = React;

    // ── Render component ──────────────────────────────────────────────────────
    const GALLERY_ID = ${galleryId};

    try {
      ${cleanedCode}

      const ComponentToRender = (typeof exports !== 'undefined' && exports.default) || null;

      if (!ComponentToRender || typeof ComponentToRender !== 'function') {
        throw new Error('No valid React component exported. exports.default must be a function.');
      }

      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ComponentToRender));

    } catch (err) {
      const msg = (err && typeof err === 'object' && err.message) ? String(err.message) : String(err);
      document.getElementById('root').innerHTML =
        '<div style="color:#ef4444;padding:16px;font-size:12px;font-family:monospace;white-space:pre-wrap;word-break:break-all">Error: ' + msg + '</div>';
      window.parent.postMessage({ type: 'gallery-error', message: msg, __galleryId: GALLERY_ID }, '*');
    }
  </script>
</body>
</html>`;
}
