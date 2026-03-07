import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableSplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export function ResizableSplitPane({
  left,
  right,
  defaultLeftWidth = 50,
  minLeftWidth = 25,
  maxLeftWidth = 75,
}: ResizableSplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const captureTargetRef = useRef<HTMLElement | null>(null);
  const capturePointerIdRef = useRef<number | null>(null);
  const clamp = useCallback(
    (value: number) => Math.max(minLeftWidth, Math.min(maxLeftWidth, value)),
    [minLeftWidth, maxLeftWidth]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = leftWidth;
      captureTargetRef.current = target;
      capturePointerIdRef.current = e.pointerId;
      target.setPointerCapture(e.pointerId);
    },
    [leftWidth]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current || !leftPanelRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - startXRef.current;
      const deltaPercent = (deltaX / container.width) * 100;
      const newWidth = clamp(startWidthRef.current + deltaPercent);
      // Direct DOM update - no React re-renders during drag = smooth, no lag
      leftPanelRef.current.style.width = `${newWidth}%`;
    },
    [clamp]
  );

  const handlePointerUp = useCallback(() => {
    // Sync final width to React state (single re-render when drag ends)
    if (leftPanelRef.current) {
      const w = leftPanelRef.current.style.width;
      const num = parseFloat(w);
      if (!Number.isNaN(num)) setLeftWidth(clamp(num));
    }
    if (captureTargetRef.current && capturePointerIdRef.current !== null) {
      try {
        captureTargetRef.current.releasePointerCapture(capturePointerIdRef.current);
      } catch {
        /* ignore */
      }
      captureTargetRef.current = null;
      capturePointerIdRef.current = null;
    }
    isDraggingRef.current = false;
  }, [clamp]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => handlePointerMove(e);
    const onPointerUp = () => handlePointerUp();

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full min-h-0 bg-slate-50"
      style={{ overflow: 'hidden' }}
    >
      {/* Left Panel - drawing area */}
      <div
        ref={leftPanelRef}
        className="h-full min-w-0 shrink-0 overflow-hidden"
        style={{ width: `${leftWidth}%`, flexShrink: 0 }}
      >
        {left}
      </div>

      {/* Resize Handle - 12px hit area, stops propagation to prevent tldraw capture */}
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex shrink-0 items-center justify-center w-3 cursor-col-resize touch-none select-none hover:bg-indigo-100/50 active:bg-indigo-200/50 transition-colors"
        style={{ flexShrink: 0 }}
      >
        <div className="flex items-center justify-center w-1 h-12 rounded-full bg-slate-200 hover:bg-indigo-400 transition-colors pointer-events-none">
          <GripVertical className="w-3 h-3 text-slate-500" />
        </div>
        {/* Extended hit area for easier grabbing */}
        <div className="absolute inset-y-0 -left-2 -right-2" aria-hidden />
      </div>

      {/* Right Panel - preview area */}
      <div className="h-full flex-1 min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
