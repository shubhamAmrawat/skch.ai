/**
 * Building blocks shared by every generated-preview HTML document:
 * the main editor preview / gallery iframe (`livePreviewIframeDocument.ts`),
 * the landing-page gallery thumbnails (`galleryIframeDocument.ts`), and the
 * standalone "open in new tab" export (`previewHtml.ts`).
 *
 * Previously each of those three files carried its own independent copy of
 * this logic, which had already drifted from each other in small ways. This
 * module is the single source of truth so a CDN version bump or a
 * code-transform fix only has to happen once.
 */

/**
 * Transform a generated React component's source into something that can run
 * directly inside a `<script type="text/babel">` block: strips import
 * statements, rewrites `lucide-react` imports to use the `window.LucideIcons`
 * shim below, and normalizes whatever "export default" form the AI produced
 * into an `exports.default` assignment.
 */
export function prepareCode(code: string): string {
  let prepared = code;

  // Remove React imports
  prepared = prepared.replace(
    /import\s+.*?\s+from\s+['"]react['"];?\s*/g,
    ''
  );

  // Transform lucide-react imports to use window.LucideIcons proxy
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

  // Remove all remaining imports
  prepared = prepared.replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?\s*/g, '');
  prepared = prepared.replace(/import\s+['"][^'"]+['"];?\s*/g, '');

  // Extract component name from common default-export forms:
  // - export default function Foo() {}
  // - export default const Foo = ...
  // - export default Foo;
  let componentName = '';
  const nameMatch = prepared.match(/export\s+default\s+(?:function|const)?\s*(\w+)/);
  if (nameMatch) {
    componentName = nameMatch[1];
  }

  // Handle: export default function () { ... } (anonymous default function)
  prepared = prepared.replace(
    /export\s+default\s+function\s*\(/g,
    'exports.default = function('
  );

  // Handle: export default () => ... and export default props => ...
  prepared = prepared.replace(
    /export\s+default\s+((?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>)/g,
    'exports.default = $1'
  );

  // Transform: export default function Foo() { → function Foo() {
  prepared = prepared.replace(
    /export\s+default\s+function\s+/g,
    'function '
  );

  // Transform: export default const Foo = → const Foo =
  prepared = prepared.replace(
    /export\s+default\s+const\s+/g,
    'const '
  );

  // Transform: export default Foo; → exports.default = Foo;
  prepared = prepared.replace(
    /export\s+default\s+(\w+);?\s*$/gm,
    'exports.default = $1;'
  );

  // Remove other export default patterns
  prepared = prepared.replace(/export\s+default\s+/g, '');

  // Initialize exports object at top
  if (!prepared.includes('const exports = {}') && !prepared.includes('var exports = {}')) {
    prepared = 'const exports = {};\n' + prepared;
  }

  // If we found a component name, explicitly export it
  if (componentName) {
    prepared += `\nexports.default = ${componentName};`;
  }

  // Final fallback: if we still don't have exports.default, use first declared component-like symbol.
  const functionMatch = prepared.match(/(?:function|const)\s+(\w+)\s*(?:=\s*\([^)]*\)\s*=>|\([^)]*\))/);
  if (functionMatch && !prepared.includes('exports.default')) {
    prepared += `\nexports.default = ${functionMatch[1]};`;
  }

  return prepared;
}

/**
 * Pinned CDN `<script>` tags for Tailwind, React, ReactDOM, Babel and Lucide.
 * Every consumer's `onerror` handlers call `window.__sketchLoadError(name)`,
 * which each document defines for itself (the failure-reporting mechanism
 * differs: a standalone page writes to the DOM directly, an iframe posts a
 * message to its parent).
 */
export function getPreviewCdnScriptTags(): string {
  return `<script src="https://cdn.tailwindcss.com" onerror="window.__sketchLoadError('Tailwind')"></script>
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" onerror="window.__sketchLoadError('React')"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" onerror="window.__sketchLoadError('ReactDOM')"></script>
  <script src="https://unpkg.com/@babel/standalone@7.28.4/babel.min.js" onerror="window.__sketchLoadError('Babel')"></script>
  <script src="https://unpkg.com/lucide@1.41.0/dist/umd/lucide.min.js" onerror="window.__sketchLoadError('Lucide')"></script>`;
}

/**
 * `window.LucideIcons` proxy shim: turns `lucide-react` icon names (rewritten
 * by `prepareCode` above) into rendered `<svg>` elements via the `window.lucide`
 * UMD global. Meant to be interpolated inside a `<script type="text/babel">`
 * block, ahead of any generated component code that references icons.
 */
export const LUCIDE_ICON_SHIM_SCRIPT = `const createIcon = (name) => {
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
    });`;
