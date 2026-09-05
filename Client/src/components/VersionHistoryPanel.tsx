import { useState, useEffect, useCallback } from 'react';
import {
  History,
  RotateCcw,
  Loader2,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PenLine,
  Pencil,
} from 'lucide-react';
import { LivePreview } from './LivePreview';
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

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

// Groups history rows into "Today" / "Yesterday" / "Earlier" buckets, based on
// local calendar day rather than a rolling 24h window (matches how most
// version-history UIs group entries).
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

// Style for the small timeline dot per trigger type.
const TRIGGER_DOT_STYLE: Record<SketchVersionMeta['trigger'], string> = {
  generate: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  iterate: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'manual-edit': 'bg-amber-50 text-amber-600 border-amber-200',
  restore: 'bg-violet-50 text-violet-600 border-violet-200',
};

// Style for the small trigger-type chip on the right of each row.
const TRIGGER_CHIP_STYLE: Record<SketchVersionMeta['trigger'], string> = {
  generate: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  iterate: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'manual-edit': 'bg-amber-50 text-amber-600 border-amber-200',
  restore: 'bg-violet-50 text-violet-600 border-violet-200',
};

export function VersionHistoryPanel({ sketchId, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<SketchVersionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<SketchVersionMeta | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [justRestored, setJustRestored] = useState(false);

  // Fetch-only helper: sets state solely from async callbacks (never synchronously
  // inside the mount effect below). Initial loading/error state already starts
  // correct (loading: true, error: null) so the mount effect doesn't need to
  // reset them itself.
  const fetchVersions = useCallback(() => {
    listSketchVersions(sketchId)
      .then((res) => setVersions(res.data?.versions ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load version history'))
      .finally(() => setLoading(false));
  }, [sketchId]);

  // Used by the Retry button and after a restore completes — resets
  // loading/error synchronously (fine outside an effect) then refetches.
  const loadVersions = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchVersions();
  }, [fetchVersions]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // versions come back newest-first from the API. The newest entry always
  // mirrors whatever code is currently live (every generate/iterate/restore
  // both appends a version AND updates the sketch's live code in the same
  // write), so it's pinned separately as "Current" rather than shown as a
  // restorable history row — restoring it would just recreate itself.
  const current = versions[0];
  const history = versions.slice(1);

  const handleOpenPreview = (version: SketchVersionMeta) => {
    setPreviewVersion(version);
    setPreviewCode(null);
    setConfirming(false);
    setPreviewLoading(true);
    getSketchVersion(sketchId, version.id)
      .then((res) => setPreviewCode(res.data?.version.code ?? ''))
      .catch((err) => {
        setPreviewCode(null);
        setError(err instanceof Error ? err.message : 'Failed to load version');
      })
      .finally(() => setPreviewLoading(false));
  };

  const handleBackToList = () => {
    setPreviewVersion(null);
    setPreviewCode(null);
    setConfirming(false);
  };

  const handleConfirmRestore = () => {
    if (!previewVersion) return;
    setRestoring(true);
    restoreSketchVersion(sketchId, previewVersion.id)
      .then((res) => {
        const code = res.data?.code;
        if (code) onRestore(code);
        handleBackToList();
        loadVersions();
        setJustRestored(true);
        setTimeout(() => setJustRestored(false), 1100);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to restore version'))
      .finally(() => setRestoring(false));
  };

  // --- Preview-before-restore view ---
  if (previewVersion) {
    return (
      <div className="h-full flex flex-col bg-white rounded-tl-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to history
          </button>
          <div className="text-right min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate max-w-[220px]">
              {previewVersion.label || 'Untitled version'}
            </p>
            <p className="text-[11px] text-slate-400">{formatRelativeTime(previewVersion.createdAt)}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {previewLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          ) : previewCode ? (
            <LivePreview code={previewCode} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Couldn't load this version.
            </div>
          )}
        </div>
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={!previewCode || restoring}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore this version
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-600 text-center">
                Replace your current code with this version? This will also be added to your history, so you can undo it.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={restoring}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestore}
                  disabled={restoring}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {restoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Confirm restore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- List view ---
  return (
    <div className="h-full flex flex-col bg-white rounded-tl-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-500" /> Version History
        </h3>
        {versions.length > 0 && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {versions.length} version{versions.length === 1 ? '' : 's'} saved · up to 30 kept
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
            onClick={loadVersions}
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
        <>
          {/* Pinned "current" card — never itself a restore target, since it's
              always identical to whatever's currently live. */}
          <div className="px-3 pt-3 shrink-0">
            <div
              className={`relative rounded-xl border border-indigo-200 bg-indigo-50 pl-4 pr-3 py-3 overflow-hidden transition-shadow duration-500 ${
                justRestored ? 'ring-2 ring-indigo-300' : ''
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-indigo-700 bg-white border border-indigo-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> CURRENT
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">{formatRelativeTime(current.createdAt)}</span>
              </div>
              <p className="text-[13.5px] font-semibold text-slate-800 leading-snug">
                {current.label || 'Untitled version'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">This is what's live in your preview right now.</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {history.length === 0 ? (
              <p className="text-center text-[11px] text-slate-300 mt-8">
                That's the full history for this sketch.
              </p>
            ) : (
              (() => {
                // Group the remaining (non-current) versions into contiguous
                // day buckets, preserving newest-first order within each.
                const groups: { bucket: string; items: SketchVersionMeta[] }[] = [];
                for (const v of history) {
                  const bucket = dayBucket(v.createdAt);
                  const last = groups[groups.length - 1];
                  if (last && last.bucket === bucket) last.items.push(v);
                  else groups.push({ bucket, items: [v] });
                }

                return groups.map((group, groupIdx) => (
                  <div key={group.bucket + groupIdx} className={groupIdx === 0 ? 'mt-2' : 'mt-4'}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-10 mb-1.5">
                      {group.bucket}
                    </p>
                    <ol>
                      {group.items.map((v, i) => {
                        const Icon = TRIGGER_ICON[v.trigger];
                        const isFirst = i === 0;
                        const isLast = i === group.items.length - 1;
                        return (
                          <li key={v.id} className="flex gap-3">
                            <div className="relative w-7 shrink-0 flex justify-center">
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-px bg-slate-200 ${
                                  isFirst ? 'top-1/2' : 'top-0'
                                } ${isLast ? 'bottom-1/2' : 'bottom-0'}`}
                              />
                              <span
                                className={`relative z-10 mt-1 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${TRIGGER_DOT_STYLE[v.trigger]}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenPreview(v)}
                              className="group flex-1 min-w-0 text-left py-2 pr-1 rounded-lg hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                            >
                              <div className="min-w-0 pt-1">
                                <p className="text-sm text-slate-700 line-clamp-2">{v.label || 'Untitled version'}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(v.createdAt)}</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-1 pt-1">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${TRIGGER_CHIP_STYLE[v.trigger]}`}
                                >
                                  <Icon className="w-2.5 h-2.5" />
                                  {TRIGGER_LABEL[v.trigger]}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ));
              })()
            )}
          </div>
        </>
      )}
    </div>
  );
}
