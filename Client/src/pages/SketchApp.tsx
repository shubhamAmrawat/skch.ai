import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { WhiteboardContainer } from '../components/WhiteboardContainer';
import { CodePreviewPanel } from '../components/CodePreviewPanel';
import { ResizableSplitPane } from '../components/ResizableSplitPane';
import { generateUI, iterateUI } from '../services/api';
import { getSketch, createSketch, updateSketch } from '../services/sketchApi';
import { useAuth } from '../hooks/useAuth';
import { generateFullPageHTML } from '../utils/previewHtml';
import { getSnapshot } from 'tldraw';
import type { Editor } from 'tldraw';

// Tab type
type TabType = 'preview' | 'code' | 'chat';

// App state interface
interface AppState {
  isGenerating: boolean;
  generatedCode: string;
  activeTab: TabType;
  selectedModel: string;
  error: string | null;
  currentSketchId: string | null;
  currentSketchTitle: string | null;
  tldrawSnapshot: string | null;
  isSaving: boolean;
  saveMessage: string | null;
}

export function SketchApp() {
  const [searchParams] = useSearchParams();
  const sketchIdParam = searchParams.get('sketchId');
  const { isAuthenticated } = useAuth();
  const editorRef = useRef<Editor | null>(null);

  const [state, setState] = useState<AppState>({
    isGenerating: false,
    generatedCode: '',
    activeTab: 'preview',
    selectedModel: 'gpt-4o',
    error: null,
    currentSketchId: null,
    currentSketchTitle: null,
    tldrawSnapshot: null,
    isSaving: false,
    saveMessage: null,
  });

  // Load sketch from URL param
  useEffect(() => {
    if (!sketchIdParam || !isAuthenticated) return;

    // Clear tldrawSnapshot when switching sketches to avoid loading wrong canvas data
    setState((prev) => ({ ...prev, tldrawSnapshot: null }));

    let cancelled = false;
    getSketch(sketchIdParam)
      .then((res) => {
        if (cancelled || !res.data?.sketch) return;
        setState((prev) => ({
          ...prev,
          generatedCode: res.data!.sketch.code,
          currentSketchId: res.data!.sketch.id,
          currentSketchTitle: res.data!.sketch.title,
          tldrawSnapshot: res.data!.sketch.tldrawSnapshot ?? null,
          activeTab: 'preview',
        }));
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Failed to load sketch',
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sketchIdParam, isAuthenticated]);

  const handleGenerate = useCallback(async (editor: Editor | null) => {
    // Set generating state and clear any previous errors
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      let imageBase64: string | null = null;

      // If we have an editor, export the canvas as PNG
      if (editor) {
        const shapeIds = editor.getCurrentPageShapeIds();

        if (shapeIds.size === 0) {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            error: 'Please draw something on the canvas first!',
          }));
          return;
        }

        // Export the canvas as PNG blob
        const blob = await editor.toImage([...shapeIds], {
          format: 'png',
          background: true,
          padding: 20,
          scale: 2, // Higher resolution for better AI understanding
        });

        if (blob) {
          // Convert blob to base64
          imageBase64 = await blobToBase64(blob.blob);
          console.log('[App] Canvas exported, size:', imageBase64.length, 'chars');
        }
      }

      if (!imageBase64) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: 'Failed to capture canvas. Please try again.',
        }));
        return;
      }

      // Call the API - pass currentCode for iterative drawing (refine existing UI from updated sketch)
      const response = await generateUI({
        image: imageBase64,
        currentCode: state.generatedCode || undefined,
      });

      if (response.success && response.code) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generatedCode: response.code ?? '',
          activeTab: 'preview',
          error: null,
        }));
        console.log('[App] Generated code successfully, tokens used:', response.usage?.totalTokens);
      } else {
        throw new Error(response.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('[App] Generation error:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, [state.generatedCode]);

  const handleIterate = useCallback(async (feedback: string) => {
    console.log('[App] handleIterate called with feedback:', feedback);
    console.log('[App] Current code length:', state.generatedCode?.length || 0);

    if (!state.generatedCode || !feedback.trim()) {
      console.log('[App] Early return - missing code or feedback');
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      console.log('[App] Calling iterateUI API...');
      const response = await iterateUI(state.generatedCode, feedback);
      console.log('[App] API response:', { success: response.success, codeLength: response.code?.length });

      if (response.success && response.code) {
        console.log('[App] Updating state with new code');
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generatedCode: response.code ?? '',
          activeTab: 'preview',
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to iterate on code');
      }
    } catch (error) {
      console.error('[App] Iteration error:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, [state.generatedCode]);

  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      generatedCode: '',
      activeTab: 'preview',
      error: null,
      currentSketchId: null,
      currentSketchTitle: null,
      tldrawSnapshot: null,
      saveMessage: null,
    }));
  }, []);

  const handleSave = useCallback(
    async (title?: string) => {
      if (!state.generatedCode || !isAuthenticated) return;

      setState((prev) => ({ ...prev, isSaving: true, saveMessage: null }));

      try {
        let tldrawSnapshot: string | null = null;
        let thumbnail: string | null = null;
        const editor = editorRef.current;

        if (editor) {
          // Capture tldraw snapshot (includes all shapes: drawings, pasted images, etc.)
          try {
            const snapshot = getSnapshot(editor.store);
            tldrawSnapshot = JSON.stringify(snapshot);
          } catch (snapErr) {
            console.warn('[Save] Failed to capture tldraw snapshot:', snapErr);
          }

          // Capture thumbnail from canvas
          const shapeIds = editor.getCurrentPageShapeIds();
          if (shapeIds.size > 0) {
            try {
              const result = await editor.toImage([...shapeIds], {
                format: 'png',
                background: true,
                padding: 12,
                scale: 0.5,
              });
              const imageBlob = result?.blob ?? (result as { blob?: Blob })?.blob;
              if (imageBlob) {
                thumbnail = await blobToBase64(imageBlob);
                // Limit size for DB - compress if too large (>500KB base64)
                if (thumbnail.length > 500_000) {
                  thumbnail = null; // Skip oversized thumbnails to avoid DB issues
                }
              }
            } catch (thumbErr) {
              console.warn('[Save] Failed to capture thumbnail:', thumbErr);
            }
          }
        }

        const saveTitle = title ?? state.currentSketchTitle ?? 'Untitled Sketch';

        if (state.currentSketchId) {
          await updateSketch(state.currentSketchId, {
            code: state.generatedCode,
            title: saveTitle,
            tldrawSnapshot,
            thumbnail,
          });
          setState((prev) => ({
            ...prev,
            isSaving: false,
            currentSketchTitle: saveTitle,
            tldrawSnapshot,
            saveMessage: 'Sketch updated!',
          }));
        } else {
          const res = await createSketch({
            title: saveTitle,
            code: state.generatedCode,
            tldrawSnapshot,
            thumbnail,
          });
          const id = res.data?.sketch?.id;
          setState((prev) => ({
            ...prev,
            isSaving: false,
            currentSketchId: id ?? null,
            currentSketchTitle: saveTitle,
            tldrawSnapshot,
            saveMessage: 'Sketch saved!',
          }));
        }
        setTimeout(() => {
          setState((prev) => (prev.saveMessage ? { ...prev, saveMessage: null } : prev));
        }, 3000);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: err instanceof Error ? err.message : 'Failed to save sketch',
        }));
      }
    },
    [state.generatedCode, state.currentSketchId, state.currentSketchTitle, isAuthenticated]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  const handleExport = useCallback(() => {
    if (!state.generatedCode) return;
    const blob = new Blob([state.generatedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (state.currentSketchTitle || 'GeneratedComponent').replace(/[^a-z0-9-_]/gi, '_') + '.tsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state.generatedCode, state.currentSketchTitle]);

  const handleFullscreen = useCallback(() => {
    if (!state.generatedCode) return;
    const fullHTML = generateFullPageHTML(state.generatedCode);
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [state.generatedCode]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header with integrated sketch controls */}
      <Header
        selectedModel={state.selectedModel}
        onModelChange={handleModelChange}
        sketchControls={{
          activeTab: state.activeTab,
          onTabChange: handleTabChange,
          generatedCode: state.generatedCode,
          isGenerating: state.isGenerating,
          isIterating: false,
          sketchTitle: state.currentSketchTitle ?? '',
          onSketchTitleChange: (t) =>
            setState((prev) => ({ ...prev, currentSketchTitle: t || null })),
          onSave: () => handleSave(state.currentSketchTitle ?? undefined),
          isAuthenticated: !!isAuthenticated,
          isSaving: state.isSaving,
          onExport: handleExport,
          onFullscreen: handleFullscreen,
        }}
      />

      {/* Error Banner */}
      {state.error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="text-red-400 text-sm text-center">
            ⚠️ {state.error}
          </p>
        </div>
      )}

      {/* Save success message */}
      {state.saveMessage && (
        <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2">
          <p className="text-green-600 text-sm text-center">
            ✓ {state.saveMessage}
          </p>
        </div>
      )}

      {/* Main Content - Resizable Split Pane */}
      <main className="flex-1 overflow-hidden">
        <ResizableSplitPane
          left={
            <WhiteboardContainer
              isGenerating={state.isGenerating}
              onGenerate={handleGenerate}
              onClear={handleClear}
              onEditorMount={(ed) => {
                editorRef.current = ed;
              }}
              initialSnapshot={state.tldrawSnapshot}
              sketchId={sketchIdParam}
              hasExistingCode={!!state.generatedCode}
            />
          }
          right={
            <CodePreviewPanel
              activeTab={state.activeTab}
              generatedCode={state.generatedCode}
              isGenerating={state.isGenerating}
              onIterate={handleIterate}
            />
          }
          defaultLeftWidth={50}
          minLeftWidth={30}
          maxLeftWidth={70}
        />
      </main>
    </div>
  );
}

/**
 * Convert a Blob to a base64 data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

