import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { WhiteboardContainer } from '../components/WhiteboardContainer';
import { CodePreviewPanel } from '../components/CodePreviewPanel';
import { ResizableSplitPane } from '../components/ResizableSplitPane';
import { generateUIStreaming } from '../services/api';
import { getSketch, createSketch, updateSketch } from '../services/sketchApi';
import { useAuth } from '../hooks/useAuth';
import { generateFullPageHTML } from '../utils/previewHtml';
import { getSnapshot } from 'tldraw';
import type { Editor } from 'tldraw';

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
  refineOnlyMode: boolean;
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
  const conversationHistoryRef = useRef<ConversationEntry[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<AppState>({
    isGenerating: false,
    generatedCode: '',
    activeTab: 'preview',
    selectedModel: 'gpt-4o',
    conversationHistory: [],
    refineOnlyMode: false,
    error: null,
    currentSketchId: null,
    currentSketchTitle: null,
    tldrawSnapshot: null,
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
      .then((res) => {
        if (cancelled || !res.data?.sketch) return;
        const sketch = res.data!.sketch;
        const loadedHistory = (sketch.conversationHistory ?? []).map(
          (h: { role: string; content: string; timestamp: string }) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
            timestamp: new Date(h.timestamp),
          })
        );
        setState((prev) => ({
          ...prev,
          generatedCode: sketch.code,
          currentSketchId: sketch.id,
          currentSketchTitle: sketch.title,
          tldrawSnapshot: sketch.tldrawSnapshot ?? null,
          activeTab: 'preview',
          conversationHistory: loadedHistory, // Always use server data when loading
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

  const handleGenerate = useCallback(async (editor: Editor | null) => {
    // Set generating state, switch to Code tab to show streaming, clear errors
    setState((prev) => ({ ...prev, isGenerating: true, error: null, activeTab: 'code' }));

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
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              generatedCode: result.code ?? '',
              activeTab: 'preview',
              error: null,
              conversationHistory: hadExistingCode ? prev.conversationHistory : [],
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

        // Build update payload - only include thumbnail/tldrawSnapshot when we captured them
        // (in refine-only mode canvas is hidden, so we skip to avoid overwriting existing values with null)
        const updatePayload: {
          code: string;
          title: string;
          tldrawSnapshot?: string | null;
          thumbnail?: string | null;
          conversationHistory: ConversationEntry[];
        } = {
          code: state.generatedCode,
          title: saveTitle,
          conversationHistory: conversationHistoryRef.current,
        };
        if (tldrawSnapshot !== null) updatePayload.tldrawSnapshot = tldrawSnapshot;
        if (thumbnail !== null) updatePayload.thumbnail = thumbnail;

        if (state.currentSketchId) {
          await updateSketch(state.currentSketchId, updatePayload);
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
            conversationHistory: conversationHistoryRef.current,
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
          refineOnlyMode: state.refineOnlyMode,
          onRefineOnlyModeChange: (enabled) => {
            setState((prev) => ({
              ...prev,
              refineOnlyMode: enabled,
              activeTab: enabled && prev.activeTab === 'chat' ? 'preview' : prev.activeTab,
            }));
          },
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

      {/* Main Content - Refine-only mode hides canvas, normal mode shows canvas | preview */}
      <main className="flex-1 overflow-hidden">
        {state.refineOnlyMode ? (
          <>
            {/* Keep canvas mounted but off-screen so we can capture tldrawSnapshot/thumbnail on save */}
            <div
              className="fixed -left-[9999px] top-0 w-[800px] h-[600px] overflow-hidden -z-10"
              aria-hidden="true"
            >
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
            </div>
            <CodePreviewPanel
              activeTab={state.activeTab}
              generatedCode={state.generatedCode}
              isGenerating={state.isGenerating}
              conversationHistory={state.conversationHistory}
              onIterate={handleIterate}
              refineOnlyMode
            />
          </>
        ) : (
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
                conversationHistory={state.conversationHistory}
                onIterate={handleIterate}
              />
            }
            defaultLeftWidth={50}
            minLeftWidth={30}
            maxLeftWidth={70}
          />
        )}
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

