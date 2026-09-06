import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  History,
  RotateCcw,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  PenLine,
  Pencil,
  Search,
  X,
  Columns2,
} from 'lucide-react';
import { LivePreview } from './LivePreview';
import { generateIframeDocumentHtml } from './livePreview/livePreviewIframeDocument';
import {
  listSketchVersions,
  getSketchVersion,
  restoreSketchVersion,
} from '../services/sketchApi';
import type { SketchVersionMeta } from '../services/sketchApi';

interface VersionHistoryPanelProps {
  sketchId: string;
  onRestore: (code: string) => void;
}

function formatAbsoluteTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Groups history rows into "Today" / "Yesterday" / "Earlier" buckets, based on
// local calendar day rather than a rolling 24h window.
function dayBucket(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

const TRIGGER_LABEL: Record<SketchVersionMeta['trigger'], string> = {
  generate: 'Generated',
  iterate: 'Refined',
  'manual-edit': 'Edited',
  restore: 'Restored',
};

const TRIGGER_ICON: Record<SketchVersionMeta['trigger'], typeof Sparkles> = {
  generate: Sparkles,
  iterate: PenLine,
  'manual-edit': Pencil,
  restore: RotateCcw,
};

// Style for the small round trigger-type icon badge on each row.
const TRIGGER_DOT_STYLE: Record<SketchVersionMeta['trigger'], string> = {
  generate: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  iterate: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'manual-edit': 'bg-amber-50 text-amber-600 border-amber-200',
  restore: 'bg-violet-50 text-violet-600 border-violet-200',
};

// Style for an active filter chip, matched to that trigger's color.
const TRIGGER_CHIP_ACTIVE_STYLE: Record<SketchVersionMeta['trigger'], string> = {
  generate: 'bg-indigo-600 text-white border-indigo-600',
  iterate: 'bg-emerald-600 text-white border-emerald-600',
  'manual-edit': 'bg-amber-600 text-white border-amber-600',
  restore: 'bg-violet-600 text-white border-violet-600',
};

const FILTER_TYPES: SketchVersionMeta['trigger'][] = ['generate', 'iterate', 'manual-edit', 'restore'];

interface VersionRowContentProps {
  version: SketchVersionMeta;
  isCurrent: boolean;
}

// Shared, purely presentational row content for both the pinned "Current"
// entry and every history entry below it, so the unified timeline reads as
// one continuous list. The clickable <button> wrapper (and its onClick,
// which touches selectedIdRef through selectVersion) stays in the parent's
// own render scope rather than being passed down as a prop — passing a
// ref-touching handler across a component boundary loses the "wrapped in
// useCallback" safety signal for the react-hooks/refs lint rule, even
// though the handler itself is memoized.
function VersionRowContent({ version, isCurrent }: VersionRowContentProps) {
  const Icon = TRIGGER_ICON[version.trigger];
  return (
    <>
      <span
        className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${TRIGGER_DOT_STYLE[version.trigger]}`}
      >
        <Icon className="w-3 h-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12.5px] font-semibold text-slate-800">{TRIGGER_LABEL[version.trigger]}</span>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide text-indigo-700 bg-white border border-indigo-200 rounded-full px-1.5 py-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> CURRENT
            </span>
          )}
        </span>
        <span className="block text-[12px] text-slate-500 line-clamp-2 mt-0.5">
          {version.label || 'Untitled version'}
        </span>
        <span className="block text-[10.5px] text-slate-400 mt-1">{formatAbsoluteTime(version.createdAt)}</span>
      </span>
    </>
  );
}

const COMPARE_PREVIEW_WIDTH = 1280;

interface ComparePreviewProps {
  code: string | null;
  loading: boolean;
}

// A side-by-side "thumbnail" preview for the Compare modal: renders the real
// page in a fixed-width iframe using the 'gallery' document variant (so it
// reports its own intrinsic content height instead of forcing a 100vh
// floor), then CSS-scales the whole thing down to fit fully inside whatever
// box this component is given — both width AND height — so two versions can
// sit side by side without either one getting clipped or needing to scroll.
function ComparePreview({ code, loading }: ComparePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState(800);
  const [frameLoading, setFrameLoading] = useState(true);
  const [frameError, setFrameError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !code) return;
    setFrameLoading(true);
    setFrameError(null);
    setContentHeight(800);
    iframeRef.current.srcdoc = generateIframeDocumentHtml(code, 'gallery');
  }, [code]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'ready') {
        setFrameLoading(false);
      } else if (d.type === 'error' && typeof d.message === 'string') {
        setFrameError(d.message);
        setFrameLoading(false);
      } else if (d.type === 'sketch2code-preview-height' && typeof d.height === 'number') {
        setContentHeight(Math.max(1, d.height));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // The container div (and its ResizeObserver-attached ref) must always be
  // rendered — never swapped out for a different early-return tree while
  // loading — or the observer's one-time [] effect can fire against a still-
  // null ref and never get a second chance to attach once the real content
  // mounts later, leaving containerSize stuck at {0,0} and the preview
  // rendering at native, unscaled size instead of fitted to the pane.
  const showSpinner = loading || !code || frameLoading;
  const scaleW = containerSize.width > 0 ? containerSize.width / COMPARE_PREVIEW_WIDTH : 1;
  const scaleH = containerSize.height > 0 ? containerSize.height / contentHeight : 1;
  const scale = Math.min(scaleW, scaleH) || 1;

  return (
    <div ref={containerRef} className="h-full w-full relative bg-white overflow-hidden flex items-center justify-center">
      {(showSpinner || frameError) && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          {frameError ? (
            <p className="text-xs text-red-500 text-center px-6">{frameError}</p>
          ) : (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          )}
        </div>
      )}
      {code && (
        <iframe
          ref={iframeRef}
          title="Compare preview"
          className="border-0 block shrink-0"
          style={{
            width: `${COMPARE_PREVIEW_WIDTH}px`,
            height: `${contentHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          sandbox="allow-scripts allow-popups"
        />
      )}
    </div>
  );
}

export function VersionHistoryPanel({ sketchId, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<SketchVersionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [justRestored, setJustRestored] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareCurrentCode, setCompareCurrentCode] = useState<string | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SketchVersionMeta['trigger'][]>([]);

  // Guards async responses (selecting a version, then quickly selecting a
  // different one) against overwriting the panel with a stale result.
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selectVersion = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedCode(null);
    setSelectedError(null);
    setConfirming(false);
    setSelectedLoading(true);
    getSketchVersion(sketchId, id)
      .then((res) => {
        if (selectedIdRef.current !== id) return;
        setSelectedCode(res.data?.version.code ?? '');
      })
      .catch((err) => {
        if (selectedIdRef.current !== id) return;
        setSelectedError(err instanceof Error ? err.message : 'Failed to load version');
      })
      .finally(() => {
        if (selectedIdRef.current === id) setSelectedLoading(false);
      });
  }, [sketchId]);

  // Fetch-only helper: sets state solely from async callbacks. Optionally
  // forces re-selecting the new first ("current") entry, used after a
  // restore where the previously-selected version still exists in the
  // refreshed list and would otherwise stay selected.
  const fetchVersions = useCallback((opts?: { forceSelectFirst?: boolean }) => {
    listSketchVersions(sketchId)
      .then((res) => {
        const list = res.data?.versions ?? [];
        setVersions(list);
        if (list.length > 0 && (opts?.forceSelectFirst || selectedIdRef.current === null)) {
          selectVersion(list[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load version history'))
      .finally(() => setLoading(false));
  }, [sketchId, selectVersion]);

  const loadVersions = useCallback((opts?: { forceSelectFirst?: boolean }) => {
    setLoading(true);
    setError(null);
    fetchVersions(opts);
  }, [fetchVersions]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // versions come back newest-first from the API. The newest entry always
  // mirrors whatever code is currently live, so it's treated as "Current".
  const current = versions[0];
  const history = versions.slice(1);

  const filteredHistory = history.filter((v) => {
    if (activeFilters.length > 0 && !activeFilters.includes(v.trigger)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (!(v.label || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Flattened into a single list of rows (bucket-header markers interleaved
  // with versions) rather than nested groups, so the JSX below only ever
  // needs one level of .map() — a doubly-nested map (groups.map(... items.map))
  // was enough to make the react-hooks/refs lint rule lose track of the
  // (useCallback-memoized, otherwise-safe) selectVersion ref access.
  type TimelineRow = { kind: 'header'; key: string; bucket: string } | { kind: 'version'; key: string; version: SketchVersionMeta };
  const historyRows: TimelineRow[] = [];
  let lastBucket: string | null = null;
  for (const v of filteredHistory) {
    const bucket = dayBucket(v.createdAt);
    if (bucket !== lastBucket) {
      historyRows.push({ kind: 'header', key: `header-${bucket}-${v.id}`, bucket });
      lastBucket = bucket;
    }
    historyRows.push({ kind: 'version', key: v.id, version: v });
  }

  const toggleFilter = (trigger: SketchVersionMeta['trigger']) => {
    setActiveFilters((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleConfirmRestore = useCallback(() => {
    if (!selectedId) return;
    setRestoring(true);
    restoreSketchVersion(sketchId, selectedId)
      .then((res) => {
        const code = res.data?.code;
        if (code) onRestore(code);
        setConfirming(false);
        loadVersions({ forceSelectFirst: true });
        setJustRestored(true);
        setTimeout(() => setJustRestored(false), 1100);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to restore version'))
      .finally(() => setRestoring(false));
  }, [selectedId, sketchId, onRestore, loadVersions]);

  const openCompare = () => {
    if (!current) return;
    setCompareOpen(true);
    setCompareLoading(true);
    getSketchVersion(sketchId, current.id)
      .then((res) => setCompareCurrentCode(res.data?.version.code ?? ''))
      .catch(() => setCompareCurrentCode(null))
      .finally(() => setCompareLoading(false));
  };

  // Lock page scroll and allow Escape to close while the Compare or restore-
  // confirmation modal is open.
  useEffect(() => {
    if (!compareOpen && !confirming) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCompareOpen(false);
        setConfirming(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [compareOpen, confirming]);

  const selectedVersion = versions.find((v) => v.id === selectedId) ?? null;
  const isSelectedCurrent = !!current && selectedId === current.id;
  const SelectedIcon = selectedVersion ? TRIGGER_ICON[selectedVersion.trigger] : History;

  return (
    <div className="h-full flex flex-col bg-white rounded-tl-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-500" /> Version History
        </h3>
        {versions.length > 0 && (
          <p className="text-[11px] text-slate-400">
            {versions.length} version{versions.length === 1 ? '' : 's'} · up to 30 kept
          </p>
        )}
      </div>

      {loading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => loadVersions()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : !current ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
            <History className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-medium text-slate-700 mb-1.5">No history yet</h3>
          <p className="text-sm text-slate-500 max-w-[240px]">
            Every edit you make from here on will show up as a restorable version.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex">
          {/* Left column: search + filters + unified timeline (Current first, always visible) */}
          <div className="w-[260px] shrink-0 border-r border-slate-200 flex flex-col">
            <div className="p-2.5 border-b border-slate-100 shrink-0 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {FILTER_TYPES.map((t) => {
                  const active = activeFilters.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleFilter(t)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                        active ? TRIGGER_CHIP_ACTIVE_STYLE[t] : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {TRIGGER_LABEL[t]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => selectVersion(current.id)}
                    className={`w-full text-left px-2.5 py-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                      selectedId === current.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <VersionRowContent version={current} isCurrent />
                  </button>
                </li>
              </ul>

              {historyRows.length === 0 ? (
                <p className="text-center text-[11px] text-slate-300 mt-6">
                  {history.length === 0 ? "That's the full history for this sketch." : 'No versions match your search.'}
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {historyRows.map((row, idx) =>
                    row.kind === 'header' ? (
                      <li
                        key={row.key}
                        className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 ${
                          idx === 0 ? 'mt-3' : 'mt-4'
                        }`}
                      >
                        {row.bucket}
                      </li>
                    ) : (
                      <li key={row.key}>
                        <button
                          onClick={() => selectVersion(row.version.id)}
                          className={`w-full text-left px-2.5 py-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                            selectedId === row.version.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <VersionRowContent version={row.version} isCurrent={false} />
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Right column: detail header + framed live preview + action bar */}
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedVersion && (
              <>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <SelectedIcon className="w-3.5 h-3.5 text-slate-500" />
                      {TRIGGER_LABEL[selectedVersion.trigger]}
                      {isSelectedCurrent && (
                        <span className="text-[9px] font-bold tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-1.5 py-0.5">
                          CURRENT
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[320px]">
                      {selectedVersion.label || 'Untitled version'} · {formatAbsoluteTime(selectedVersion.createdAt)}
                    </p>
                  </div>
                  {!isSelectedCurrent && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={openCompare}
                        disabled={!selectedCode}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-all"
                      >
                        <Columns2 className="w-3 h-3" /> Compare
                      </button>
                      <button
                        onClick={() => setConfirming(true)}
                        disabled={!selectedCode || restoring}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0 p-3">
                  <div
                    className={`h-full rounded-xl border overflow-hidden relative transition-shadow duration-500 ${
                      justRestored && isSelectedCurrent ? 'ring-2 ring-indigo-300 border-indigo-200' : 'border-slate-200'
                    }`}
                  >
                    {selectedLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      </div>
                    ) : selectedError || !selectedCode ? (
                      <div className="h-full flex items-center justify-center text-sm text-slate-400">
                        {selectedError || "Couldn't load this version."}
                      </div>
                    ) : (
                      <LivePreview code={selectedCode} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirming && selectedVersion && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-slate-900/60 flex items-center justify-center p-6"
          onClick={() => !restoring && setConfirming(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-800">Restore this version?</p>
              <p className="text-xs text-slate-600">
                Replace your current code with this version? This will also be added to your history, so you can undo it.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={restoring}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestore}
                  disabled={restoring}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
                >
                  {restoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Confirm restore
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {compareOpen && current && selectedVersion && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-slate-900/60 flex items-center justify-center p-6"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="w-full max-w-7xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-slate-500" /> Compare versions
              </p>
              <button
                onClick={() => setCompareOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 flex">
              <div className="flex-1 min-w-0 flex flex-col border-r border-slate-200">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-100 bg-indigo-50 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide text-indigo-700 bg-white border border-indigo-200 rounded-full px-1.5 py-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> CURRENT
                  </span>
                  <span className="text-[11px] text-indigo-700/70 truncate">{formatAbsoluteTime(current.createdAt)}</span>
                </div>
                <div className="flex-1 min-h-0">
                  <ComparePreview code={compareCurrentCode} loading={compareLoading} />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-wide rounded-full border px-1.5 py-0.5 ${TRIGGER_CHIP_ACTIVE_STYLE[selectedVersion.trigger]}`}
                  >
                    {TRIGGER_LABEL[selectedVersion.trigger]}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">{formatAbsoluteTime(selectedVersion.createdAt)}</span>
                </div>
                <div className="flex-1 min-h-0">
                  <ComparePreview code={selectedCode} loading={selectedLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
