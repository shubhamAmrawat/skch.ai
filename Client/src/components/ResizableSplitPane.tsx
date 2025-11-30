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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isDragging, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden bg-slate-950">
      {/* Left Panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative w-[3px] shrink-0 cursor-col-resize group transition-all duration-150 ${isDragging
          ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
          : 'bg-slate-800 hover:bg-indigo-500/70'
          }`}
      >
        {/* Gradient glow on hover/drag */}
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
        >
          <div className="absolute inset-y-0 -left-2 w-2 bg-linear-to-r from-transparent to-indigo-500/20" />
          <div className="absolute inset-y-0 -right-2 w-2 bg-linear-to-l from-transparent to-indigo-500/20" />
        </div>

        {/* Drag Handle Visual */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-0.5 py-3 rounded-full transition-all duration-150 ${isDragging
            ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/30'
            : 'bg-slate-700/80 group-hover:bg-indigo-500/80 group-hover:scale-105'
            }`}
        >
          <GripVertical
            className={`w-3 h-3 transition-colors duration-150 ${isDragging ? 'text-white' : 'text-slate-500 group-hover:text-white'
              }`}
          />
        </div>

        {/* Extended hit area */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      {/* Right Panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
}
