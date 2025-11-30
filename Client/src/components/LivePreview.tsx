import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

    // Create the HTML content for the iframe
    const htmlContent = generateIframeContent(code);

    // Write to iframe
    iframe.srcdoc = htmlContent;
  }, [code]);

  useEffect(() => {
    // Check if code has changed
    if (code !== prevCodeRef.current) {
      prevCodeRef.current = code;
      if (code) {
        // Use a microtask to batch state updates
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

    // Listen for messages from iframe
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

    // Timeout for loading
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
      iframeRef.current.srcdoc = generateIframeContent(code);
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
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

/**
 * Generate the HTML content for the iframe with all dependencies
 */
function generateIframeContent(code: string): string {
  // Clean and prepare the code
  const cleanedCode = prepareCode(code);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  
  <!-- Babel for JSX transpilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Lucide React Icons (as a simple substitute) -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  
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
    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    /* Better image defaults */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    /* Ensure full-width sections work */
    .w-full {
      width: 100% !important;
    }
  </style>
  
  <!-- Configure Tailwind for full-width layouts -->
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
    // Create mock lucide-react icons
    const createIcon = (name) => {
      return function Icon({ className = '', size = 24, ...props }) {
        const iconElement = React.useRef(null);
        
        React.useEffect(() => {
          if (iconElement.current && window.lucide) {
            const icon = window.lucide.icons[name.toLowerCase()] || window.lucide.icons['circle'];
            if (icon) {
              iconElement.current.innerHTML = '';
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('width', size);
              svg.setAttribute('height', size);
              svg.setAttribute('viewBox', '0 0 24 24');
              svg.setAttribute('fill', 'none');
              svg.setAttribute('stroke', 'currentColor');
              svg.setAttribute('stroke-width', '2');
              svg.setAttribute('stroke-linecap', 'round');
              svg.setAttribute('stroke-linejoin', 'round');
              svg.innerHTML = icon[2].join('');
              if (className) {
                className.split(' ').forEach(c => svg.classList.add(c));
              }
              iconElement.current.appendChild(svg);
            }
          }
        }, []);
        
        return React.createElement('span', { ref: iconElement, className: 'inline-flex', ...props });
      };
    };

    // Common Lucide icons used in UI components
    const iconNames = [
      'Search', 'Menu', 'X', 'Check', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Plus', 'Minus', 'Edit', 'Trash',
      'Settings', 'User', 'Users', 'Mail', 'Phone', 'Calendar', 'Clock', 'Star', 'Heart',
      'Home', 'Bell', 'Image', 'Camera', 'Video', 'File', 'Folder', 'Download', 'Upload',
      'Share', 'Link', 'ExternalLink', 'Copy', 'Clipboard', 'Save', 'Send', 'MessageCircle',
      'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle', 'Eye', 'EyeOff', 'Lock', 'Unlock',
      'Key', 'Shield', 'Globe', 'Map', 'MapPin', 'Navigation', 'Compass', 'Sun', 'Moon',
      'Cloud', 'Zap', 'Activity', 'BarChart', 'PieChart', 'TrendingUp', 'TrendingDown',
      'Filter', 'Grid', 'List', 'Layout', 'Columns', 'Sidebar', 'Terminal', 'Code', 'Package',
      'ShoppingCart', 'ShoppingBag', 'CreditCard', 'DollarSign', 'Percent', 'Tag', 'Gift',
      'Award', 'Target', 'Bookmark', 'Flag', 'ThumbsUp', 'ThumbsDown', 'RefreshCw', 'RotateCw',
      'Loader', 'MoreHorizontal', 'MoreVertical', 'Sparkles', 'Wand', 'Palette', 'Droplet'
    ];

    const icons = {};
    iconNames.forEach(name => {
      icons[name] = createIcon(name);
    });

    // Make icons available globally for the component
    window.LucideIcons = icons;
    
    // Make React hooks available globally (since imports are removed)
    const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } = React;
    
    try {
      ${cleanedCode}
      
      // Get the default export and render it
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(exports.default || Component || App));
      
      // Notify parent that rendering is complete
      window.parent.postMessage({ type: 'ready' }, '*');
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

/**
 * Prepare the code for execution in the iframe
 */
function prepareCode(code: string): string {
  let prepared = code;

  // Remove ALL import statements from 'react' (handles various patterns)
  // Pattern: import React from 'react'
  // Pattern: import { useState } from 'react'
  // Pattern: import React, { useState, useEffect } from 'react'
  prepared = prepared.replace(
    /import\s+.*?\s+from\s+['"]react['"];?\s*/g,
    ''
  );

  // Replace lucide-react imports with window.LucideIcons references
  prepared = prepared.replace(
    /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?\s*/g,
    (_, imports) => {
      const iconList = imports.split(',').map((s: string) => s.trim()).filter(Boolean);
      return iconList.map((icon: string) => `const ${icon} = window.LucideIcons['${icon}'] || window.LucideIcons.Sparkles;`).join('\n') + '\n';
    }
  );

  // Remove any other import statements (for safety)
  prepared = prepared.replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?\s*/g, '');

  // Remove side-effect imports (e.g., import 'tailwindcss/tailwind.css')
  prepared = prepared.replace(/import\s+['"][^'"]+['"];?\s*/g, '');

  // Handle default export with function declaration
  prepared = prepared.replace(
    /export\s+default\s+function\s+(\w+)/g,
    'const exports = {}; function $1'
  );

  // Handle "export default ComponentName;" at end of file
  prepared = prepared.replace(
    /export\s+default\s+(\w+);?\s*$/gm,
    'exports.default = $1;'
  );

  // Handle inline "export default" (arrow functions, etc.)
  prepared = prepared.replace(
    /export\s+default\s+/g,
    'exports.default = '
  );

  // Add exports object if not present
  if (!prepared.includes('const exports = {}')) {
    prepared = 'const exports = {};\n' + prepared;
  }

  // Ensure the component is assigned to exports.default
  const functionMatch = prepared.match(/(?:function|const)\s+(\w+)\s*(?:=\s*\([^)]*\)\s*=>|\([^)]*\))/);
  if (functionMatch && !prepared.includes('exports.default')) {
    prepared += `\nexports.default = ${functionMatch[1]};`;
  }

  return prepared;
}

