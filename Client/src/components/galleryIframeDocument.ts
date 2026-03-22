/**
 * Dedicated iframe HTML for gallery (landing) previews only.
 * Completely separate from generateIframeDocumentHtml used by the editor.
 *
 * Key design decisions vs the editor version:
 * - Messages are tagged with __galleryId so the single global bus can route them
 * - Height is sent ONCE after render settles, then only on ResizeObserver change
 *   (no MutationObserver loop, no repeated setTimeout spam)
 * - No `ready` / `sketch2code-preview-height` messages — uses `gallery-height` /
 *   `gallery-error` types exclusively so the editor message handler is never triggered
 * - Babel warnings suppressed in gallery context
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

  <!-- Suppress noisy CDN console warnings -->
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
    html {
      width: 100%;
      overflow-x: hidden;
      overflow-y: visible;
    }
    body {
      width: 100%;
      overflow-x: hidden;
      overflow-y: visible;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
    }
    #root {
      width: 100%;
      display: block;
    }
    /* Allow min-h-screen components to expand fully */

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

    // ── Height reporting — single global bus approach ─────────────────────────
    const GALLERY_ID = ${galleryId};
    let _lastPostedHeight = -1;

   

   function postHeight() {
      const root = document.getElementById('root');
     
      if (!root) return;
      
      // Use getBoundingClientRect for accurate rendered height
      const rect = root.getBoundingClientRect();
      const h = Math.max(
        root.scrollHeight,
        root.offsetHeight,
        Math.ceil(rect.height),
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      
  
      
      if (h < 10) return;
      
      const ceiled = Math.ceil(h);
    
      
      if (ceiled === _lastPostedHeight) {
        return;
      }
      
      _lastPostedHeight = ceiled;
    
      window.parent.postMessage({ type: 'gallery-height', height: ceiled, __galleryId: GALLERY_ID }, '*');
    }

    // ── Render component ──────────────────────────────────────────────────────
    let renderError = null;
    let ComponentToRender = null;
    
    try {
      ${cleanedCode}


      // After code runs, exports.default should be set by prepareCode logic
      ComponentToRender = (typeof exports !== 'undefined' && exports.default) || null;
      
       if (!ComponentToRender || typeof ComponentToRender !== 'function') {
        throw new Error('No valid React component exported. exports.default must be a function.');
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(ComponentToRender));

      // Measure after React has painted
      // Two rAF passes = after browser layout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          postHeight();
          setTimeout(postHeight, 300);
          setTimeout(postHeight, 800);
          setTimeout(postHeight, 1500);
        });
      });

      // Absolute safety: send height after maximum wait
      setTimeout(() => {
        if (_lastPostedHeight === -1) {
          postHeight();
        }
      }, 2500);

      // Only watch for genuine size changes after initial render
      if (window.ResizeObserver) {
        let roTimer = null;
        const ro = new ResizeObserver(() => {
          if (roTimer) clearTimeout(roTimer);
          roTimer = setTimeout(postHeight, 120);
        });
        const rootEl = document.getElementById('root');
        if (rootEl) ro.observe(rootEl);
      }

    } catch (err) {
      renderError = err;
      const errorMsg = (err && typeof err === 'object' && err.message) ? String(err.message) : (typeof err === 'string' ? err : String(err));
      document.getElementById('root').innerHTML =
        '<div style="color:#ef4444;padding:16px;font-size:12px;font-family:monospace;white-space:pre-wrap;word-break:break-all">Error: ' + errorMsg + '</div>';
      window.parent.postMessage({ type: 'gallery-error', message: errorMsg, __galleryId: GALLERY_ID }, '*');
    }

    // Final safety net: if no message was sent after 5 seconds, send something
    setTimeout(() => {
      if (_lastPostedHeight === -1 && !renderError) {
        postHeight();
      }
    }, 5000);
  </script>
</body>
</html>`;
}