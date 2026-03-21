/**
 * HTML document (srcdoc) for LivePreview-style iframes.
 * `editor` — fixed viewport behavior (min-height 100vh), for editor/detail panels.
 * `gallery` — intrinsic document height, posts height to parent to avoid iframe scrollbars.
 */

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
    }
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
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  
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
    const createIcon = (name) => {
      return function Icon({ className = '', size = 24, ...props }) {
        const iconElement = React.useRef(null);
        const normalizeIconName = (iconName) =>
          iconName
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/[ _]+/g, '-')
            .toLowerCase();
        
        React.useEffect(() => {
          if (iconElement.current && window.lucide?.createIcons && window.lucide?.icons) {
            const iconName = normalizeIconName(name);
            iconElement.current.innerHTML = '<i data-lucide="' + iconName + '"></i>';
            window.lucide.createIcons({
              icons: window.lucide.icons,
              root: iconElement.current,
              attrs: { width: String(size), height: String(size) }
            });

            const renderedSvg = iconElement.current.querySelector('svg');
            if (renderedSvg && className) {
              className.split(' ').filter(Boolean).forEach((c) => renderedSvg.classList.add(c));
            }
          }
        }, [className, name, size]);
        
        return React.createElement('span', { ref: iconElement, className: 'inline-flex items-center justify-center', ...props });
      };
    };

    const iconCache = {};
    window.LucideIcons = new Proxy(iconCache, {
      get(target, prop) {
        if (typeof prop !== 'string') return createIcon('circle');
        if (!target[prop]) {
          target[prop] = createIcon(prop);
        }
        return target[prop];
      }
    });
    
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
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(exports.default || Component || App));
      
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

function prepareCode(code: string): string {
  let prepared = code;

  prepared = prepared.replace(
    /import\s+.*?\s+from\s+['"]react['"];?\s*/g,
    ''
  );

  prepared = prepared.replace(
    /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?\s*/g,
    (_, imports) => {
      const iconList = imports.split(',').map((s: string) => s.trim()).filter(Boolean);
      return iconList.map((iconSpecifier: string) => {
        const [imported, local] = iconSpecifier.split(/\s+as\s+/).map((s) => s.trim());
        const localName = local || imported;
        return `const ${localName} = window.LucideIcons['${imported}'];`;
      }).join('\n') + '\n';
    }
  );

  prepared = prepared.replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?\s*/g, '');
  prepared = prepared.replace(/import\s+['"][^'"]+['"];?\s*/g, '');

  prepared = prepared.replace(
    /export\s+default\s+function\s+(\w+)/g,
    'const exports = {}; function $1'
  );

  prepared = prepared.replace(
    /export\s+default\s+(\w+);?\s*$/gm,
    'exports.default = $1;'
  );

  prepared = prepared.replace(
    /export\s+default\s+/g,
    'exports.default = '
  );

  if (!prepared.includes('const exports = {}')) {
    prepared = 'const exports = {};\n' + prepared;
  }

  const functionMatch = prepared.match(/(?:function|const)\s+(\w+)\s*(?:=\s*\([^)]*\)\s*=>|\([^)]*\))/);
  if (functionMatch && !prepared.includes('exports.default')) {
    prepared += `\nexports.default = ${functionMatch[1]};`;
  }

  return prepared;
}
