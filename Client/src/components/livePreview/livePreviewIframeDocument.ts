/**
 * HTML document (srcdoc) for LivePreview-style iframes.
 * `editor` — fixed viewport behavior (min-height 100vh), for editor/detail panels.
 * `gallery` — intrinsic document height, posts height to parent to avoid iframe scrollbars.
 */
import { prepareCode, getPreviewCdnScriptTags, LUCIDE_ICON_SHIM_SCRIPT } from '../../utils/iframeDocumentShared';

export type LivePreviewIframeVariant = 'editor' | 'gallery';

export function generateIframeDocumentHtml(
  code: string,
  variant: LivePreviewIframeVariant
): string {
  const cleanedCode = prepareCode(code);
  const isGallery = variant === 'gallery';

  const layoutStyles = isGallery
    ? `
    html, body {
      width: 100%;
      min-height: 0;
      height: auto;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      overflow: hidden;
    }
    #root {
      width: 100%;
      min-height: 0;
      height: auto;
      overflow: visible;
      display: block;
    }
    `
    : `
    html, body {
      width: 100%;
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: none;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
    #root {
      width: 100%;
      min-height: 100vh;
    }
    `;

  const imageContainerFixes = isGallery
    ? ''
    : `
    div[class*="relative"]:has(img[class*="absolute"]) {
      min-height: 300px;
    }
    div[class*="flex-1"][class*="relative"] {
      min-height: 300px;
    }
    `;

  const galleryHeightBridge = isGallery
    ? `
      window.parent.postMessage({ type: 'ready' }, '*');
      (function setupGalleryHeight() {
        var debounceTimer = null;
        var lastPosted = -1;
        function measureRootHeight() {
          var root = document.getElementById('root');
          if (!root) return 1;
          var h = Math.max(root.scrollHeight, root.offsetHeight);
          return Math.max(1, Math.ceil(h));
        }
        function flushHeight() {
          debounceTimer = null;
          var h = measureRootHeight();
          if (lastPosted === h) return;
          lastPosted = h;
          window.parent.postMessage({ type: 'sketch2code-preview-height', height: h }, '*');
        }
        function scheduleFlush() {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(flushHeight, 100);
        }
        function sendHeight() {
          requestAnimationFrame(function() {
            requestAnimationFrame(scheduleFlush);
          });
        }
        sendHeight();
        [200, 550, 1100].forEach(function(ms) { setTimeout(sendHeight, ms); });
        if (window.ResizeObserver) {
          var ro = new ResizeObserver(function() { scheduleFlush(); });
          ro.observe(document.getElementById('root'));
        }
        window.addEventListener('load', sendHeight);
        var moTimer = null;
        var mo = new MutationObserver(function() {
          if (moTimer) clearTimeout(moTimer);
          moTimer = setTimeout(sendHeight, 200);
        });
        mo.observe(document.getElementById('root'), { childList: true, subtree: true, attributes: false });
      })();
    `
    : `
      window.parent.postMessage({ type: 'ready' }, '*');
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <title>Preview</title>
  ${isGallery ? '<script>window.__SKETCH2CODE_GALLERY__=true;</script>' : ''}
  ${isGallery ? `<script>(function(){var w=console.warn;console.warn=function(){var a=arguments[0];if(typeof a==='string'&&(a.indexOf('cdn.tailwindcss.com')!==-1||a.indexOf('in-browser Babel')!==-1||a.indexOf('Babel transformer')!==-1))return;w.apply(console,arguments);};})();</script>` : ''}
  
  <script>window.__sketchLoadError = function (name) { try { window.parent.postMessage({ type: 'error', message: 'Failed to load ' + name + ' from the CDN (network issue or an ad-blocker can cause this). Click Retry.' }, '*'); } catch (e) {} };</script>
  <script>
    window.addEventListener('error', function (event) {
      try {
        var msg = (event && event.error && event.error.message) || (event && event.message) || 'Unknown error while rendering the preview.';
        window.parent.postMessage({ type: 'error', message: msg }, '*');
      } catch (e) {}
    });
    window.addEventListener('unhandledrejection', function (event) {
      try {
        var reason = event && event.reason;
        var msg = (reason && reason.message) || String(reason) || 'Unknown promise rejection while rendering the preview.';
        window.parent.postMessage({ type: 'error', message: msg }, '*');
      } catch (e) {}
    });
  </script>
  ${getPreviewCdnScriptTags()}
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    ${layoutStyles}
    html {
      scroll-behavior: smooth;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    img[class*="absolute"] {
      position: absolute;
    }
    ${imageContainerFixes}
    .w-full {
      width: 100% !important;
    }
  </style>
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
          }
        }
      }
    }
  </script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" data-presets="react">
    ${LUCIDE_ICON_SHIM_SCRIPT}
    
    const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } = React;
    
    function fixImages() {
      const images = document.querySelectorAll('img[src^="http"]');
      images.forEach(function(img) {
        if (!img.hasAttribute('referrerpolicy')) {
          img.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        }
        
        const parent = img.parentElement;
        if (!window.__SKETCH2CODE_GALLERY__ && parent && parent.classList.contains('relative') && img.classList.contains('absolute')) {
          if (parent.offsetHeight === 0 || parent.offsetHeight < 200) {
            const computedStyle = window.getComputedStyle(parent);
            if (computedStyle.flex === '1 1 0%' || parent.classList.contains('flex-1')) {
              parent.style.minHeight = '400px';
            } else {
              parent.style.minHeight = '300px';
            }
          }
        }
        
        img.addEventListener('error', function() {
          console.warn('Image failed to load:', img.src);
          if (img.parentElement) {
            console.log('Parent container:', img.parentElement.className);
            console.log('Parent height:', img.parentElement.offsetHeight);
          }
        }, { once: true });
      });
    }
    
    try {
      ${cleanedCode}

      const resolveComponentToRender = () => {
        if (typeof exports !== 'undefined' && exports && typeof exports.default === 'function') {
          return exports.default;
        }
        if (typeof window !== 'undefined') {
          if (typeof window.Component === 'function') return window.Component;
          if (typeof window.App === 'function') return window.App;
        }
        return null;
      };

      const componentToRender = resolveComponentToRender();
      if (!componentToRender) {
        throw new Error('No valid React component found. Export a default component or define App/Component.');
      }

      class PreviewErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, message: '' };
        }
        static getDerivedStateFromError(error) {
          return {
            hasError: true,
            message: error && error.message ? String(error.message) : 'Unknown render error',
          };
        }
        componentDidCatch(error) {
          const message = error && error.message ? String(error.message) : String(error);
          window.parent.postMessage({ type: 'error', message }, '*');
        }
        render() {
          if (this.state.hasError) {
            return React.createElement(
              'div',
              { style: { color: '#dc2626', padding: '20px', fontFamily: 'monospace' } },
              'Error: ' + this.state.message
            );
          }
          return this.props.children;
        }
      }

      const root = ReactDOM.createRoot(document.getElementById('root'), {
        onRecoverableError: function(error) {
          const message = error && error.message ? String(error.message) : String(error);
          console.warn('Recoverable render error:', message);
          window.parent.postMessage({ type: 'error', message }, '*');
        }
      });
      root.render(
        React.createElement(
          PreviewErrorBoundary,
          null,
          React.createElement(componentToRender)
        )
      );
      
      setTimeout(fixImages, 50);
      setTimeout(fixImages, 200);
      setTimeout(fixImages, 500);
      
      const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) {
                if (node.tagName === 'IMG' || node.querySelectorAll('img').length > 0) {
                  shouldFix = true;
                }
              }
            });
          }
        });
        if (shouldFix) {
          setTimeout(fixImages, 50);
        }
      });
      
      observer.observe(document.getElementById('root'), {
        childList: true,
        subtree: true
      });
      
      ${galleryHeightBridge}
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
      window.parent.postMessage({ type: 'error', message: error.message }, '*');
    }
  </script>
</body>
</html>
`;
}

