/**
 * Utility functions for generating preview HTML
 */
import { prepareCode, getPreviewCdnScriptTags, LUCIDE_ICON_SHIM_SCRIPT } from './iframeDocumentShared';

/**
 * Generate a full standalone HTML page for opening in a new tab
 */
export function generateFullPageHTML(code: string): string {
  const cleanedCode = prepareCode(code);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <title>Generated UI Preview</title>
  
  <!-- Error helper: if a CDN script below fails to load, show a clear message instead of a blank page -->
  <script>window.__sketchLoadError = function (name) { var el = document.getElementById('root'); if (el) el.innerHTML = '<div style="color:#dc2626;padding:20px;font-family:monospace">Failed to load ' + name + ' from the CDN (network issue or an ad-blocker can cause this). Please refresh.</div>'; };</script>
  <script>
    window.addEventListener('error', function (event) {
      try {
        var msg = (event && event.error && event.error.message) || (event && event.message) || 'Unknown error while rendering the preview.';
        var el = document.getElementById('root');
        if (el) el.innerHTML = '<div style="color:#dc2626;padding:20px;font-family:monospace">Render error: ' + msg + '</div>';
      } catch (e) {}
    });
    window.addEventListener('unhandledrejection', function (event) {
      try {
        var reason = event && event.reason;
        var msg = (reason && reason.message) || String(reason) || 'Unknown promise rejection while rendering the preview.';
        var el = document.getElementById('root');
        if (el) el.innerHTML = '<div style="color:#dc2626;padding:20px;font-family:monospace">Render error: ' + msg + '</div>';
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
    html, body {
      width: 100%;
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      overflow-x: hidden;
    }
    #root {
      width: 100%;
      min-height: 100vh;
    }
    html {
      scroll-behavior: smooth;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    /* Fix for absolutely positioned images */
    img[class*="absolute"] {
      position: absolute;
    }
    /* Ensure image containers with relative positioning have proper sizing */
    div[class*="relative"]:has(img[class*="absolute"]) {
      min-height: 300px;
    }
    /* Fallback for browsers without :has() support */
    div[class*="flex-1"][class*="relative"] {
      min-height: 300px;
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
    // Mock lucide-react icons (shared shim)
    ${LUCIDE_ICON_SHIM_SCRIPT}
    
    // Make React hooks available globally
    const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } = React;
    
    // Helper function to fix images after React renders
    function fixImages() {
      const images = document.querySelectorAll('img[src^="http"]');
      images.forEach(function(img) {
        // Add referrerpolicy for better compatibility
        if (!img.hasAttribute('referrerpolicy')) {
          img.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        }
        
        // Fix for absolutely positioned images in relative containers
        const parent = img.parentElement;
        if (parent && parent.classList.contains('relative') && img.classList.contains('absolute')) {
          // If parent has no height, set a minimum height
          if (parent.offsetHeight === 0 || parent.offsetHeight < 200) {
            // Try to get height from flex context or set a reasonable default
            const computedStyle = window.getComputedStyle(parent);
            if (computedStyle.flex === '1 1 0%' || parent.classList.contains('flex-1')) {
              parent.style.minHeight = '400px';
            } else {
              parent.style.minHeight = '300px';
            }
          }
        }
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
          console.error('Render error:', message);
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
        }
      });
      root.render(
        React.createElement(
          PreviewErrorBoundary,
          null,
          React.createElement(componentToRender)
        )
      );
      
      // Fix images after React renders (multiple attempts to catch async rendering)
      setTimeout(fixImages, 50);
      setTimeout(fixImages, 200);
      setTimeout(fixImages, 500);
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
}

