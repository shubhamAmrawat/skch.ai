import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle, type PanelImperativeHandle } from 'react-resizable-panels';
import { Header } from '../components/Header';
import { WhiteboardContainer } from '../components/WhiteboardContainer';
import type { ExportData } from '../components/WhiteboardContainer';
import { CodePreviewPanel } from '../components/CodePreviewPanel';
import { generateUIStreaming } from '../services/api';
import { getSketch, getSketchSnapshot, createSketch, updateSketch, uploadSketchAssets } from '../services/sketchApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { generateFullPageHTML } from '../utils/previewHtml';
import { exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { Sparkles } from 'lucide-react';

// Tab type
type TabType = 'canvas' | 'preview' | 'code' | 'chat';

// Conversation history entry for refine tab
export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// App state interface
interface AppState {
  isGenerating: boolean;
  isLoadingSketch: boolean;
  generatedCode: string;
  activeTab: TabType;
  selectedModel: string;
  conversationHistory: ConversationEntry[];
  currentSketchId: string | null;
  currentSketchTitle: string | null;
  tldrawSnapshot: string | null;
  visibility: 'public' | 'private';
  tags: string[];
  suggestedTags: string[];
  isSaving: boolean;
  
}

export function SketchApp() {
  const [searchParams] = useSearchParams();
  const sketchIdParam = searchParams.get('sketchId');
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const editorRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const exportDataRef = useRef<(() => Promise<ExportData | null>) | null>(null);
  const conversationHistoryRef = useRef<ConversationEntry[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastKnownSceneRef = useRef<{ elements: unknown[]; files: Record<string, unknown> }>({ elements: [], files: {} });
  const leftPanelRef = useRef<PanelImperativeHandle | null>(null);
  const rightPanelRef = useRef<PanelImperativeHandle | null>(null);

  const [state, setState] = useState<AppState>({
    isGenerating: false,
    isLoadingSketch: !!sketchIdParam,
    generatedCode: '',
    activeTab: 'canvas',
    selectedModel: 'gpt-4.1-mini',
    conversationHistory: [],
    currentSketchId: null,
    currentSketchTitle: null,
    tldrawSnapshot: null,
  visibility: 'public',
  tags: [],
  suggestedTags: [],
  isSaving: false,
  });

  // Load sketch from URL param (only when sketchId changes - avoid overwriting in-session refinements)
  const prevSketchIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sketchIdParam || !isAuthenticated) return;

    const isNewSketch = prevSketchIdRef.current !== sketchIdParam;
    prevSketchIdRef.current = sketchIdParam;

    if (isNewSketch) {
      setState((prev) => ({ ...prev, tldrawSnapshot: null, isLoadingSketch: true }));
    }

    let cancelled = false;
    getSketch(sketchIdParam)
      .then(async (res) => {
        if (cancelled || !res.data?.sketch) return;
        const sketch = res.data!.sketch;
        const loadedHistory = (sketch.conversationHistory ?? []).map(
          (h: { role: string; content: string; timestamp: string }) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
            timestamp: new Date(h.timestamp),
          })
        );

        let snapshotData = sketch.tldrawSnapshot ?? null;

        // If snapshot is an R2 URL, fetch via backend proxy (avoids CORS)
        if (snapshotData && snapshotData.startsWith('http')) {
          try {
            snapshotData = await getSketchSnapshot(sketch.id);
          } catch (err) {
            console.error('[Load] Failed to fetch snapshot:', err);
            snapshotData = null;
          }
        }

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          isLoadingSketch: false,
          generatedCode: sketch.code,
          currentSketchId: sketch.id,
          currentSketchTitle: sketch.title,
          tldrawSnapshot: snapshotData,
          visibility: (sketch as { visibility?: string }).visibility === 'public' ? 'public' : 'private',
          tags: (sketch as { tags?: string[] }).tags ?? [],
          activeTab: 'chat',
          conversationHistory: loadedHistory,
        }));
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoadingSketch: false }));
          addToast('error', err instanceof Error ? err.message : 'Failed to load sketch');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sketchIdParam, isAuthenticated, addToast]);

  // Keep ref in sync so handleSave always has latest conversationHistory (avoids stale closure on quick Save after refine)
  conversationHistoryRef.current = state.conversationHistory;

  const showSplitView = state.generatedCode.length > 0 || state.isGenerating;

  // Panel collapse: Canvas = canvas full width; Preview/Code/Refine = right panel full width
  // Defer to next tick so panels are fully registered (avoids "Panel constraints not found")
  useEffect(() => {
    if (!showSplitView) return;
    const id = setTimeout(() => {
      if (state.activeTab === 'canvas') {
        leftPanelRef.current?.expand();
        rightPanelRef.current?.collapse();
      } else {
        leftPanelRef.current?.collapse();
        rightPanelRef.current?.expand();
      }
    }, 0);
    return () => clearTimeout(id);
  }, [state.activeTab, showSplitView]);

  const handleGenerate = useCallback(async (editor: ExcalidrawImperativeAPI | null) => {
    setState((prev) => ({ ...prev, isGenerating: true, activeTab: 'preview' }));

    try {
      let imageBase64: string | null = null;

      if (editor) {
        const elements = editor.getSceneElements().filter((el) => !el.isDeleted);
        const appState = editor.getAppState();
        const files = editor.getFiles();

        if (elements.length === 0) {
          setState((prev) => ({ ...prev, isGenerating: false }));
          addToast('warning', 'Please draw something on the canvas first!');
          return;
        }

        const blob = await exportToBlob({
          elements,
          appState: {
            ...appState,
            exportBackground: true,
            exportWithDarkMode: false,
          },
          files,
          mimeType: 'image/png',
          quality: 1,
        });

        console.log('[App] Canvas exported, blob size:', blob?.size ?? 0, 'bytes');

        if (blob) {
          imageBase64 = await blobToBase64(blob);
        }
      }

      if (!imageBase64) {
        setState((prev) => ({ ...prev, isGenerating: false }));
        addToast('error', 'Failed to capture canvas. Please try again.');
        return;
      }

      // Abort any previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const modelToUse = state.selectedModel;
      const hadExistingCode = !!state.generatedCode;
      console.log('[App] Sending streaming generate request:', {
        model: modelToUse,
        hasImage: !!imageBase64,
        hasCurrentCode: hadExistingCode,
      });

      let accumulatedCode = '';

      await generateUIStreaming(
        {
          image: imageBase64,
          currentCode: state.generatedCode || undefined,
          model: modelToUse,
        },
        {
          onDelta: (chunk) => {
            accumulatedCode += chunk;
            setState((prev) => ({
              ...prev,
              generatedCode: accumulatedCode,
              activeTab: prev.activeTab === 'preview' ? 'code' : prev.activeTab,
            }));
          },
          onDone: (result) => {
            const code = result.code || '';

            if (
              code.includes("I'm sorry") ||
              code.includes("I can't assist") ||
              code.includes("I cannot assist") ||
              code.trim().length < 50
            ) {
              setState((prev) => ({
                ...prev,
                isGenerating: false,
                generatedCode: '',
              }));
              addToast(
                'error',
                "AI could not process the image. Please try drawing directly on the canvas instead of pasting an image."
              );
              return;
            }

            setState((prev) => ({
              ...prev,
              isGenerating: false,
              generatedCode: code,
              activeTab: 'chat',
              conversationHistory: hadExistingCode ? prev.conversationHistory : [],
              suggestedTags: result.tags ?? [],
            }));
            console.log('[App] Stream complete, tokens used:', result.usage?.totalTokens);
          },
          onError: (errorMsg) => {
            setState((prev) => ({ ...prev, isGenerating: false }));
            addToast('error', errorMsg);
          },
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      console.error('[App] Generation error:', error);
      setState((prev) => ({ ...prev, isGenerating: false }));
      addToast('error', error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }, [state.generatedCode, state.selectedModel, addToast]);

  const handleIterate = useCallback(async (feedback: string) => {
    console.log('[App] handleIterate called with feedback:', feedback);
    console.log('[App] Current code length:', state.generatedCode?.length || 0);

    if (!state.generatedCode || !feedback.trim()) {
      console.log('[App] Early return - missing code or feedback');
      return;
    }

    // Add user message to history immediately
    const userEntry: ConversationEntry = {
      role: 'user',
      content: feedback.trim(),
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      activeTab: 'chat',
      conversationHistory: [...prev.conversationHistory, userEntry],
    }));

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const historyForApi = [...state.conversationHistory, userEntry].map((h) => ({
      role: h.role,
      content: h.content,
    }));

    let accumulatedCode = '';

    try {
      await generateUIStreaming(
        {
          feedback: feedback.trim(),
          currentCode: state.generatedCode,
          history: historyForApi,
          model: state.selectedModel,
        },
        {
          onDelta: (chunk) => {
            accumulatedCode += chunk;
            setState((prev) => ({ ...prev, generatedCode: accumulatedCode }));
          },
          onDone: (result) => {
            const replyText =
              result.assistantReply?.trim() ||
              "I've applied your changes. Check the Preview tab.";
            const assistantEntry: ConversationEntry = {
              role: 'assistant',
              content: replyText,
              timestamp: new Date(),
            };
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              generatedCode: result.code ?? '',
              activeTab: 'chat',
              conversationHistory: [...prev.conversationHistory, assistantEntry],
              suggestedTags: result.tags?.length ? result.tags : prev.suggestedTags,
            }));
            console.log('[App] Iteration stream complete, tokens:', result.usage?.totalTokens);
          },
          onError: (errorMsg) => {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              error: errorMsg,
              conversationHistory: prev.conversationHistory.slice(0, -1),
            }));
          },
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      console.error('[App] Iteration error:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        conversationHistory: prev.conversationHistory.slice(0, -1),
      }));
      addToast('error', error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }, [state.generatedCode, state.conversationHistory, state.selectedModel, addToast]);

  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      generatedCode: '',
      activeTab: 'canvas',
      conversationHistory: [],
      currentSketchId: null,
      currentSketchTitle: null,
      tldrawSnapshot: null,
      tags: [],
      suggestedTags: [],
    }));
  }, []);

  const handleSave = useCallback(
    async (title?: string) => {
      if (!state.generatedCode || !isAuthenticated) return;
      if (state.tags.length === 0) {
        addToast('warning', 'Add at least one tag before saving');
        return;
      }

      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        let snapshotJson: string | null = null;
        let thumbnailBlob: Blob | null = null;

        if (exportDataRef.current) {
          try {
            const data = await exportDataRef.current();
            if (data) {
              snapshotJson = data.snapshot;
              thumbnailBlob = data.thumbnailBlob;
              console.log('[Save] snapshot length:', snapshotJson.length, 'blob size:', thumbnailBlob?.size ?? 0);
            }
          } catch (exportErr) {
            console.error('[Save] getExportData failed:', exportErr);
          }
        } else {
          console.warn('[Save] exportDataRef not available — cannot capture snapshot/thumbnail');
        }

        const saveTitle = title ?? state.currentSketchTitle ?? 'Untitled Sketch';

        if (state.currentSketchId) {
          // EXISTING SKETCH: upload assets to R2, then update sketch with URLs
          let thumbnailUrl: string | undefined;
          let snapshotUrl: string | undefined;

          if (snapshotJson || thumbnailBlob) {
            try {
              const r2Result = await uploadSketchAssets(state.currentSketchId, thumbnailBlob, snapshotJson);
              thumbnailUrl = r2Result.thumbnailUrl;
              snapshotUrl = r2Result.snapshotUrl;
              console.log('[Save] R2 upload complete:', { thumbnailUrl, snapshotUrl });
            } catch (uploadErr) {
              console.error('[Save] R2 upload failed, saving without assets:', uploadErr);
            }
          }

          const updatePayload: {
            code: string;
            title: string;
            tldrawSnapshot?: string | null;
            thumbnail?: string | null;
            conversationHistory: ConversationEntry[];
            visibility?: 'public' | 'private';
            tags?: string[];
          } = {
            code: state.generatedCode,
            title: saveTitle,
            conversationHistory: conversationHistoryRef.current,
            visibility: state.visibility,
            tags: state.tags,
          };
          if (snapshotUrl) updatePayload.tldrawSnapshot = snapshotUrl;
          if (thumbnailUrl) updatePayload.thumbnail = thumbnailUrl;

          await updateSketch(state.currentSketchId, updatePayload);
          setState((prev) => ({
            ...prev,
            isSaving: false,
            currentSketchTitle: saveTitle,
            tldrawSnapshot: snapshotJson ?? prev.tldrawSnapshot,
          }));
          addToast('success', 'Sketch updated!');
        } else {
          // NEW SKETCH: create first to get ID, then upload assets, then update with URLs
          const res = await createSketch({
            title: saveTitle,
            code: state.generatedCode,
            conversationHistory: conversationHistoryRef.current,
            visibility: state.visibility,
            tags: state.tags,
          });
          const id = res.data?.sketch?.id;

          if (id && (snapshotJson || thumbnailBlob)) {
            try {
              const r2Result = await uploadSketchAssets(id, thumbnailBlob, snapshotJson);
              console.log('[Save] R2 upload for new sketch:', r2Result);
              await updateSketch(id, {
                ...(r2Result.snapshotUrl && { tldrawSnapshot: r2Result.snapshotUrl }),
                ...(r2Result.thumbnailUrl && { thumbnail: r2Result.thumbnailUrl }),
              });
            } catch (uploadErr) {
              console.error('[Save] R2 upload failed for new sketch:', uploadErr);
            }
          }

          setState((prev) => ({
            ...prev,
            isSaving: false,
            currentSketchId: id ?? null,
            currentSketchTitle: saveTitle,
            tldrawSnapshot: snapshotJson ?? prev.tldrawSnapshot,
          }));
          addToast('success', 'Sketch saved!');
        }
      } catch (err) {
        setState((prev) => ({ ...prev, isSaving: false }));
        addToast('error', err instanceof Error ? err.message : 'Failed to save sketch');
      }
    },
    [state.generatedCode, state.currentSketchId, state.currentSketchTitle, state.visibility, state.tags, isAuthenticated, addToast]
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
       {/* Sketch loading overlay — shown while fetching sketch data from server */}
       {state.isLoadingSketch && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      {/* Header with integrated sketch controls */}
      <Header
        selectedModel={state.selectedModel}
        onModelChange={handleModelChange}
        sketchControls={{
          activeTab: state.activeTab,
          onTabChange: handleTabChange,
          generatedCode: state.generatedCode,
          isGenerating: state.isGenerating,
          isIterating:
            state.isGenerating &&
            state.conversationHistory.length > 0 &&
            state.conversationHistory[state.conversationHistory.length - 1]?.role === 'user',
          sketchTitle: state.currentSketchTitle ?? '',
          onSketchTitleChange: (t) =>
            setState((prev) => ({ ...prev, currentSketchTitle: t || null })),
          onSave: () => handleSave(state.currentSketchTitle ?? undefined),
          isAuthenticated: !!isAuthenticated,
          isSaving: state.isSaving,
          onExport: handleExport,
          onFullscreen: handleFullscreen,
          visibility: state.visibility,
          onVisibilityChange: (v) => setState((prev) => ({ ...prev, visibility: v })),
          tags: state.tags,
          onTagsChange: (t) => setState((prev) => ({ ...prev, tags: t })),
          suggestedTags: state.suggestedTags,
        }}
      />

      {/* Main Content - both panels always mounted to avoid react-resizable-panels "Panel constraints not found" */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <PanelGroup orientation="horizontal" className="sketch-panel-group">
          <Panel
            id="canvas-panel"
            panelRef={leftPanelRef}
            defaultSize={showSplitView ? 55 : 100}
            minSize={showSplitView ? 0 : 25}
            collapsible={showSplitView}
            collapsedSize={0}
            className="sketch-left-pane"
          >
            
            <WhiteboardContainer
              key={sketchIdParam ?? 'new'}
              isGenerating={state.isGenerating}
              onGenerate={handleGenerate}
              onClear={handleClear}
              onEditorMount={(ed) => {
                editorRef.current = ed;
              }}
              onSceneChange={(elements, files) => {
                lastKnownSceneRef.current = { elements, files };
              }}
              exportDataRef={exportDataRef}
              lastKnownSceneRef={lastKnownSceneRef}
              initialSnapshot={state.tldrawSnapshot}
              sketchId={sketchIdParam}
              hasExistingCode={!!state.generatedCode}
            />
          </Panel>

          <PanelResizeHandle className="sketch-drag-handle" />

          <Panel
            id="code-preview-panel"
            panelRef={rightPanelRef}
            defaultSize={showSplitView ? 45 : 0}
            minSize={0}
            collapsible
            collapsedSize={0}
            className="sketch-right-pane"
          >
            {showSplitView ? (
              <CodePreviewPanel
                activeTab={state.activeTab}
                generatedCode={state.generatedCode}
                isGenerating={state.isGenerating}
                conversationHistory={state.conversationHistory}
                onIterate={handleIterate}
              />
            ) : (
              <div className="h-full" aria-hidden />
            )}
          </Panel>
        </PanelGroup>
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

