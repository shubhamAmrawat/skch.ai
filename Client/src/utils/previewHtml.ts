/**
 * Utility functions for generating preview HTML
 */

/**
 * Prepare the code for execution in the browser
 */
function prepareCode(code: string): string {
  let prepared = code;

  // Remove ALL import statements from 'react' (handles various patterns)
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
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  
  <!-- Babel for JSX transpilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Lucide Icons -->
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

    // Common Lucide icons
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

    window.LucideIcons = icons;
    
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
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(exports.default || Component || App));
      
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

