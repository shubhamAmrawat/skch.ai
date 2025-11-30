import { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { WhiteboardContainer } from '../components/WhiteboardContainer';
import { CodePreviewPanel } from '../components/CodePreviewPanel';
import { ResizableSplitPane } from '../components/ResizableSplitPane';
import { generateUI, iterateUI } from '../services/api';
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
}

export function SketchApp() {
  const [state, setState] = useState<AppState>({
    isGenerating: false,
    generatedCode: '',
    activeTab: 'preview',
    selectedModel: 'gpt-4o',
    error: null,
  });

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

      // Call the API
      const response = await generateUI({ image: imageBase64 });

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
  }, []);

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
    }));
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setState((prev) => ({ ...prev, selectedModel: model }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <Header
        selectedModel={state.selectedModel}
        onModelChange={handleModelChange}
      />

      {/* Error Banner */}
      {state.error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="text-red-400 text-sm text-center">
            ⚠️ {state.error}
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
            />
          }
          right={
            <CodePreviewPanel
              activeTab={state.activeTab}
              onTabChange={handleTabChange}
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

