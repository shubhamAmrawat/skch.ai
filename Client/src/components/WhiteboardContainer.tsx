import { Sparkles, Trash2, Pencil, Image, MousePointer2 } from 'lucide-react';
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useState, useEffect, useRef } from 'react';

export interface ExportData {
  snapshot: string;
  thumbnailBlob: Blob | null;
}

interface WhiteboardContainerProps {
  isGenerating: boolean;
  onGenerate: (api: ExcalidrawImperativeAPI | null) => void;
  onClear: () => void;
  onEditorMount?: (api: ExcalidrawImperativeAPI | null) => void;
  initialSnapshot?: string | null;
  sketchId?: string | null;
  hasExistingCode?: boolean;
  exportDataRef?: React.MutableRefObject<(() => Promise<ExportData | null>) | null>;
}

export function WhiteboardContainer({
  isGenerating,
  onGenerate,
  onClear,
  onEditorMount,
  initialSnapshot,
  sketchId,
  hasExistingCode,
  exportDataRef,
}: WhiteboardContainerProps) {
  const [hasContent, setHasContent] = useState(false);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const isExcalidrawReady = useRef(false);
  const accumulatedFilesRef = useRef<ReturnType<ExcalidrawImperativeAPI['getFiles']>>({});
  const snapshotLoadedRef = useRef(false);
  const initialSnapshotRef = useRef(initialSnapshot);
  const onEditorMountRef = useRef(onEditorMount);

  useEffect(() => {
    onEditorMountRef.current = onEditorMount;
  }, [onEditorMount]);

  useEffect(() => {
    initialSnapshotRef.current = initialSnapshot;
  }, [initialSnapshot]);

  useEffect(() => {
    snapshotLoadedRef.current = false;
    isExcalidrawReady.current = false;
  }, [sketchId]);

  useEffect(() => {
    return () => {
      onEditorMountRef.current?.(null);
    };
  }, []);

  const tryLoadSnapshot = useCallback((api: ExcalidrawImperativeAPI, snapshotStr: string | null | undefined) => {
    if (!snapshotStr?.trim() || snapshotLoadedRef.current) return;
    try {
      const parsed = JSON.parse(snapshotStr);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.elements)) {
        api.updateScene({
          elements: parsed.elements,
          appState: {
            ...(parsed.appState ?? {}),
            collaborators: new Map(),
          },
        });

        if (parsed.files && typeof parsed.files === 'object' && Object.keys(parsed.files).length > 0) {
          const filesArray = Object.values(parsed.files) as Parameters<typeof api.addFiles>[0];
          api.addFiles(filesArray);
          accumulatedFilesRef.current = { ...accumulatedFilesRef.current, ...parsed.files };
          console.log('[Canvas] Restored files:', filesArray.length);
        }

        snapshotLoadedRef.current = true;
        const active = (parsed.elements as Array<{ isDeleted?: boolean }>).filter(
          (el) => !el.isDeleted
        );
        setHasContent(active.length > 0);
        console.log('[Canvas] Snapshot restored, elements:', parsed.elements.length, 'files:', Object.keys(parsed.files ?? {}).length);
      } else {
        console.warn('[Canvas] Snapshot is not Excalidraw format, skipping restore');
      }
    } catch (err) {
      console.warn('[Canvas] Failed to parse snapshot, starting blank:', err);
    }
  }, []);

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      excalidrawAPIRef.current = api;
      isExcalidrawReady.current = true;
      snapshotLoadedRef.current = false;
      console.log('[Canvas] Excalidraw API ready');
      onEditorMount?.(api);
      tryLoadSnapshot(api, initialSnapshotRef.current);
    },
    [onEditorMount, tryLoadSnapshot]
  );

  useEffect(() => {
    const api = excalidrawAPIRef.current;
    if (api && initialSnapshot) {
      tryLoadSnapshot(api, initialSnapshot);
    }
  }, [initialSnapshot, tryLoadSnapshot]);

  useEffect(() => {
    const container = document.querySelector('.excalidraw-container');
    if (!container) return;

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let panel: HTMLElement | null = null;

    const makeDraggable = (el: HTMLElement) => {
      if (el.dataset.draggable === 'true') return;
      el.dataset.draggable = 'true';

      el.style.position = 'fixed';
      el.style.left = '12px';
      el.style.top = '80px';
      el.style.zIndex = '100';
      el.style.borderRadius = '12px';
      el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
      el.style.cursor = 'grab';
      el.style.userSelect = 'none';
      el.style.maxHeight = 'calc(100vh - 100px)';
      el.style.overflowY = 'auto';

      const onMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input, label, select')) return;
        isDragging = true;
        panel = el;
        const rect = el.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        el.style.cursor = 'grabbing';
        e.preventDefault();
      };

      el.addEventListener('mousedown', onMouseDown);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !panel) return;
      panel.style.left = `${e.clientX - dragOffsetX}px`;
      panel.style.top = `${e.clientY - dragOffsetY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      if (panel) panel.style.cursor = 'grab';
      panel = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    const observer = new MutationObserver(() => {
      const propertiesPanel = container.querySelector(
        '.layer-ui__wrapper__left-top, .App-menu__left'
      ) as HTMLElement | null;
      if (propertiesPanel) {
        makeDraggable(propertiesPanel);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const getExportData = useCallback(async (): Promise<ExportData | null> => {
    const api = excalidrawAPIRef.current;
    if (!api || !isExcalidrawReady.current) {
      console.error('[Canvas] getExportData: Excalidraw not ready, aborting save');
      return null;
    }

    const elements = api.getSceneElements().filter(el => !el.isDeleted);
    const appState = api.getAppState();
    const files = { ...accumulatedFilesRef.current, ...api.getFiles() };

    console.log('[Canvas] Save triggered:', {
      elementCount: elements.length,
      fileCount: Object.keys(files).length,
      isReady: isExcalidrawReady.current,
    });

    if (elements.length === 0) {
      console.warn('[Canvas] getExportData: no elements on canvas');
    }

    const snapshot = serializeAsJSON(elements, appState, files, 'local');

    let thumbnailBlob: Blob | null = null;
    try {
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: '#ffffff',
        },
        files,
        mimeType: 'image/png',
        quality: 0.85,
      });

      if (!blob || blob.size === 0) {
        console.error('[Canvas] exportToBlob returned empty blob');
      } else {
        thumbnailBlob = blob;
        console.log('[Canvas] thumbnail blob size:', blob.size, 'files count:', Object.keys(files).length);
      }
    } catch (err) {
      console.error('[Canvas] Failed to export thumbnail:', err);
    }

    return { snapshot, thumbnailBlob };
  }, []);

  useEffect(() => {
    if (exportDataRef) {
      exportDataRef.current = getExportData;
    }
    return () => {
      if (exportDataRef) {
        exportDataRef.current = null;
      }
    };
  }, [getExportData, exportDataRef]);

  const handleChange = useCallback((elements: readonly { isDeleted?: boolean }[], _appState: unknown, files: ReturnType<ExcalidrawImperativeAPI['getFiles']>) => {
    if (files && Object.keys(files).length > 0) {
      accumulatedFilesRef.current = { ...accumulatedFilesRef.current, ...files };
    }
    setHasContent(elements.filter((el) => !el.isDeleted).length > 0);
  }, []);

  const handleClear = useCallback(() => {
    const api = excalidrawAPIRef.current;
    if (api) {
      api.updateScene({ elements: [] });
    }
    accumulatedFilesRef.current = {};
    setHasContent(false);
    onClear();
  }, [onClear]);

  return (
    <div className="whiteboard-wrapper">
      {/* Excalidraw fills this container */}
      <div className="excalidraw-container">
        <Excalidraw
          key={sketchId ?? 'new'}
          excalidrawAPI={handleExcalidrawAPI}
          theme="light"
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              clearCanvas: false,
              export: false,
              loadScene: false,
              saveAsImage: false,
              saveToActiveFile: false,
              toggleTheme: false,
            },
          }}
          renderTopRightUI={() => null}
        />
      </div>

      {/* Empty State Overlay */}
      {!hasContent && !isGenerating && (
        <div className="canvas-empty-state">
          <div className="text-center max-w-sm px-8">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border border-indigo-200 animate-ping [animation-duration:3s]" />
              <div className="absolute inset-2 rounded-full border border-purple-200 animate-ping [animation-duration:3s] [animation-delay:0.5s]" />

              <div className="absolute inset-4 rounded-2xl bg-white backdrop-blur-sm border border-slate-200 flex items-center justify-center shadow-lg">
                <Pencil className="w-8 h-8 text-indigo-500" />
              </div>

              <div className="absolute -top-1 -right-1 w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center animate-float">
                <MousePointer2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center animate-float-delayed">
                <Image className="w-4 h-4 text-cyan-600" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Start Sketching Your UI
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Draw wireframes or <span className="text-indigo-600 font-medium">paste an image</span> to generate code
            </p>

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

      {/* Floating Action Bar — always on top */}
      <div className="canvas-floating-actions">
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50">
          <button
            onClick={handleClear}
            disabled={isGenerating || !hasContent}
            title="Clear Canvas"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 group"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
          </button>

          <button
            onClick={() => onGenerate(excalidrawAPIRef.current)}
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
