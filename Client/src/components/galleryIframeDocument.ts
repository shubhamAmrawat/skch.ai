/**
 * Dedicated iframe HTML for gallery (landing) previews.
 *
 * The parent scales the iframe via CSS transform — no height messaging needed.
 * Only gallery-error messages are posted so the parent can surface render failures.
 */

import { prepareCode, getPreviewCdnScriptTags, LUCIDE_ICON_SHIM_SCRIPT } from '../utils/iframeDocumentShared';

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

  <script>window.__sketchLoadError = function (name) { try { window.parent.postMessage({ type: 'gallery-error', message: 'Failed to load ' + name + ' from the CDN.', __galleryId: ${galleryId} }, '*'); } catch (e) {} };</script>
  <script>
    window.addEventListener('error', function (event) {
      try {
        var msg = (event && event.error && event.error.message) || (event && event.message) || 'Unknown error while rendering the preview.';
        window.parent.postMessage({ type: 'gallery-error', message: msg, __galleryId: ${galleryId} }, '*');
      } catch (e) {}
    });
    window.addEventListener('unhandledrejection', function (event) {
      try {
        var reason = event && event.reason;
        var msg = (reason && reason.message) || String(reason) || 'Unknown promise rejection while rendering the preview.';
        window.parent.postMessage({ type: 'gallery-error', message: msg, __galleryId: ${galleryId} }, '*');
      } catch (e) {}
    });
  </script>
  ${getPreviewCdnScriptTags()}

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
    ${LUCIDE_ICON_SHIM_SCRIPT}

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
