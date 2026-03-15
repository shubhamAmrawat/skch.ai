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
import { generateFullPageHTML } from '../utils/previewHtml';
import { exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';

// Tab type
type TabType = 'preview' | 'code' | 'chat';

// Conversation history entry for refine tab
export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// App state interface
interface AppState {
  isGenerating: boolean;
  generatedCode: string;
  activeTab: TabType;
  selectedModel: string;
  conversationHistory: ConversationEntry[];
  error: string | null;
  currentSketchId: string | null;
  currentSketchTitle: string | null;
  tldrawSnapshot: string | null;
  visibility: 'public' | 'private';
  tags: string[];
  suggestedTags: string[];
  isSaving: boolean;
  saveMessage: string | null;
}

export function SketchApp() {
  const [searchParams] = useSearchParams();
  const sketchIdParam = searchParams.get('sketchId');
  const { isAuthenticated } = useAuth();
  const editorRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const exportDataRef = useRef<(() => Promise<ExportData | null>) | null>(null);
  const conversationHistoryRef = useRef<ConversationEntry[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastKnownSceneRef = useRef<{ elements: unknown[]; files: Record<string, unknown> }>({ elements: [], files: {} });
  const leftPanelRef = useRef<PanelImperativeHandle | null>(null);

  const [state, setState] = useState<AppState>({
    isGenerating: false,
    generatedCode: '',
    activeTab: 'preview',
    selectedModel: 'gpt-4o',
    conversationHistory: [],
    error: null,
    currentSketchId: null,
    currentSketchTitle: null,
    tldrawSnapshot: null,
  visibility: 'public',
  tags: [],
  suggestedTags: [],
  isSaving: false,
    saveMessage: null,
  });

  // Load sketch from URL param (only when sketchId changes - avoid overwriting in-session refinements)
  const prevSketchIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sketchIdParam || !isAuthenticated) return;

    const isNewSketch = prevSketchIdRef.current !== sketchIdParam;
    prevSketchIdRef.current = sketchIdParam;

    if (isNewSketch) {
      setState((prev) => ({ ...prev, tldrawSnapshot: null }));
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
          generatedCode: sketch.code,
          currentSketchId: sketch.id,
          currentSketchTitle: sketch.title,
          tldrawSnapshot: snapshotData,
          visibility: (sketch as { visibility?: string }).visibility === 'public' ? 'public' : 'private',
          tags: (sketch as { tags?: string[] }).tags ?? [],
          activeTab: 'preview',
          conversationHistory: loadedHistory,
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

  // Keep ref in sync so handleSave always has latest conversationHistory (avoids stale closure on quick Save after refine)
  conversationHistoryRef.current = state.conversationHistory;

  // Collapse left panel (canvas) when Refine tab is active; expand when switching back
  const showSplitView = state.generatedCode.length > 0 || state.isGenerating;
  useEffect(() => {
    if (!showSplitView) return;
    if (state.activeTab === 'chat') {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand();
    }
  }, [state.activeTab, showSplitView]);

  const handleGenerate = useCallback(async (editor: ExcalidrawImperativeAPI | null) => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null, activeTab: 'code' }));

    try {
      let imageBase64: string | null = null;

      if (editor) {
        const elements = editor.getSceneElements().filter((el) => !el.isDeleted);
        const appState = editor.getAppState();
        const files = editor.getFiles();

        if (elements.length === 0) {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            error: 'Please draw something on the canvas first!',
          }));
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
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: 'Failed to capture canvas. Please try again.',
        }));
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
            setState((prev) => ({ ...prev, generatedCode: accumulatedCode }));
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
                error:
                  'AI could not process the image. Please try drawing directly on the canvas instead of pasting an image.',
              }));
              return;
            }

            setState((prev) => ({
              ...prev,
              isGenerating: false,
              generatedCode: code,
              activeTab: 'preview',
              error: null,
              conversationHistory: hadExistingCode ? prev.conversationHistory : [],
              suggestedTags: result.tags ?? [],
            }));
            console.log('[App] Stream complete, tokens used:', result.usage?.totalTokens);
          },
          onError: (errorMsg) => {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              error: errorMsg,
            }));
          },
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      console.error('[App] Generation error:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, [state.generatedCode, state.selectedModel]);

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
      error: null,
      activeTab: 'code',
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
              activeTab: 'preview',
              error: null,
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        conversationHistory: prev.conversationHistory.slice(0, -1),
      }));
    }
  }, [state.generatedCode, state.conversationHistory, state.selectedModel]);

  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      generatedCode: '',
      activeTab: 'preview',
      conversationHistory: [],
      error: null,
      currentSketchId: null,
      currentSketchTitle: null,
      tldrawSnapshot: null,
      tags: [],
      suggestedTags: [],
      saveMessage: null,
    }));
  }, []);

  const handleSave = useCallback(
    async (title?: string) => {
      if (!state.generatedCode || !isAuthenticated) return;
      if (state.tags.length === 0) {
        setState((prev) => ({ ...prev, error: 'Add at least one tag before saving' }));
        return;
      }

      setState((prev) => ({ ...prev, isSaving: true, saveMessage: null }));

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
            saveMessage: 'Sketch updated!',
          }));
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
    [state.generatedCode, state.currentSketchId, state.currentSketchTitle, state.visibility, state.tags, isAuthenticated]
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

      {/* Main Content - single layout: canvas collapses when Refine tab is active (stays mounted to preserve state) */}
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

          {showSplitView && (
            <PanelResizeHandle className="sketch-drag-handle" />
          )}

          {showSplitView && (
            <Panel defaultSize={45} minSize={25} className="sketch-right-pane">
              <CodePreviewPanel
                activeTab={state.activeTab}
                generatedCode={state.generatedCode}
                isGenerating={state.isGenerating}
                conversationHistory={state.conversationHistory}
                onIterate={handleIterate}
              />
            </Panel>
          )}
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

