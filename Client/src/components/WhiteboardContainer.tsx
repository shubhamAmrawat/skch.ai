import { Sparkles, Trash2, Pencil, Image, MousePointer2 } from 'lucide-react';
import { Tldraw, Editor, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCallback, useState, useEffect, useRef } from 'react';

interface WhiteboardContainerProps {
  isGenerating: boolean;
  onGenerate: (editor: Editor | null) => void;
  onClear: () => void;
  onEditorMount?: (editor: Editor | null) => void;
  initialSnapshot?: string | null;
  /** When loading a saved sketch, pass sketchId so switching sketches remounts with correct snapshot */
  sketchId?: string | null;
  /** When true, show "Regenerate" for iterative drawing support */
  hasExistingCode?: boolean;
}

export function WhiteboardContainer({
  isGenerating,
  onGenerate,
  onClear,
  onEditorMount,
  initialSnapshot,
  sketchId,
  hasExistingCode,
}: WhiteboardContainerProps) {
  const [hasContent, setHasContent] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const snapshotLoadedRef = useRef(false);
  const initialSnapshotRef = useRef(initialSnapshot);

  useEffect(() => {
    initialSnapshotRef.current = initialSnapshot;
  }, [initialSnapshot]);

  // Reset snapshot load state when switching sketches
  useEffect(() => {
    snapshotLoadedRef.current = false;
  }, [sketchId]);

  const tryLoadSnapshot = useCallback((editor: Editor, snapshotStr: string | null | undefined) => {
    if (!snapshotStr?.trim() || snapshotLoadedRef.current) return;
    try {
      const parsed = JSON.parse(snapshotStr);
      if (parsed && typeof parsed === 'object' && (parsed.document || parsed.session)) {
        loadSnapshot(editor.store, parsed);
        snapshotLoadedRef.current = true;
        const shapeIds = editor.getCurrentPageShapeIds();
        setHasContent(shapeIds.size > 0);
      }
    } catch (e) {
      console.warn('[Whiteboard] Failed to load snapshot:', e);
    }
  }, []);

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      editorRef.current = editorInstance;
      snapshotLoadedRef.current = false;
      onEditorMount?.(editorInstance);

      // Load snapshot if it arrived before editor (e.g. opening saved sketch)
      tryLoadSnapshot(editorInstance, initialSnapshotRef.current);

      const unsubscribe = editorInstance.store.listen(() => {
        const shapeIds = editorInstance.getCurrentPageShapeIds();
        setHasContent(shapeIds.size > 0);
      });

      return () => {
        unsubscribe();
        editorRef.current = null;
        onEditorMount?.(null);
      };
    },
    [onEditorMount, tryLoadSnapshot]
  );

  // Load snapshot when it arrives after editor has mounted (e.g. fetch completes)
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && initialSnapshot) {
      tryLoadSnapshot(editor, initialSnapshot);
    }
  }, [initialSnapshot, tryLoadSnapshot]);

  const handleClear = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      const allShapeIds = editor.getCurrentPageShapeIds();
      if (allShapeIds.size > 0) {
        editor.deleteShapes([...allShapeIds]);
      }
    }
    onClear();
  }, [onClear]);

  const handleGenerate = useCallback(() => {
    onGenerate(editorRef.current);
  }, [onGenerate]);

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      {/* <div className="absolute inset-0 bg-linear-to-br from-indigo-500/2 via-transparent to-purple-500/2 pointer-events-none z-10" /> */}

      {/* Tldraw Canvas - snapshot loaded via loadSnapshot in useEffect when opening saved sketch */}
      <div className="flex-1 relative overflow-hidden tldraw-container">
        <Tldraw
          key={sketchId ?? 'new'}
          onMount={handleMount}
          inferDarkMode={false}
          licenseKey={import.meta.env.VITE_TLDRAW_LICENSE}
        />

        {/* Empty State Overlay */}
        {!hasContent && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-100">
            <div className="text-center max-w-sm px-8">
              {/* Animated Illustration */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-indigo-200 animate-ping [animation-duration:3s]" />
                <div className="absolute inset-2 rounded-full border border-purple-200 animate-ping [animation-duration:3s] [animation-delay:0.5s]" />

                {/* Main container */}
                <div className="absolute inset-4 rounded-2xl bg-white backdrop-blur-sm border border-slate-200 flex items-center justify-center shadow-lg">
                  <Pencil className="w-8 h-8 text-indigo-500" />
                </div>

                {/* Floating elements */}
                <div className="absolute -top-1 -right-1 w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center animate-float">
                  <MousePointer2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center animate-float-delayed">
                  <Image className="w-4 h-4 text-cyan-600" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Start Sketching Your UI
              </h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Draw wireframes or <span className="text-indigo-600 font-medium">paste an image</span> to generate code
              </p>

              {/* Keyboard hints */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-mono">D</kbd>
                  <span className="text-xs text-slate-600">Draw</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-mono">Ctrl/Cmd+V</kbd>
                  <span className="text-xs text-slate-600">Paste</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar - Top Right to avoid tldraw toolbar overlap */}
      <div className="absolute top-3 right-3 z-1001">
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={isGenerating || !hasContent}
            title="Clear Canvas"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 group"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !hasContent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed ${isGenerating
              ? 'bg-indigo-100 border border-indigo-200 text-indigo-600'
              : hasContent
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-100 border border-slate-200 text-slate-400'
              }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
            />
            <span>
              {isGenerating
                ? (hasExistingCode ? 'Regenerating...' : 'Generating...')
                : (hasExistingCode ? 'Regenerate' : 'Generate')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
