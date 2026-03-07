import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileCode2,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  Plus,
} from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { getSketches, deleteSketch, type Sketch } from '../services/sketchApi';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function downloadCodeAsFile(code: string, title: string) {
  const safeName = title.replace(/[^a-z0-9-_]/gi, '_').slice(0, 50) || 'sketch';
  const blob = new Blob([code], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.tsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function MySketchesPage() {
  const navigate = useNavigate();
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSketches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSketches({ limit: 50 });
      setSketches(res.data?.sketches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sketches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSketches();
  }, [loadSketches]);

  const handleOpen = (id: string) => {
    navigate(`/app?sketchId=${id}`);
  };

  const handleExport = (sketch: Sketch) => {
    downloadCodeAsFile(sketch.code, sketch.title);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this sketch? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteSketch(id);
      setSketches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sketch');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Sketches</h1>
              <p className="text-slate-600 mt-1">
                {loading ? 'Loading...' : `${sketches.length} sketch${sketches.length !== 1 ? 'es' : ''}`}
              </p>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              New Sketch
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-600">Loading your sketches...</p>
            </div>
          ) : sketches.length === 0 ? (
            /* Empty state */
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-12 shadow-lg shadow-slate-200/50">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl" />
              </div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 mb-8 shadow-xl shadow-indigo-500/30">
                  <FileCode2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No sketches yet</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  Create your first sketch by drawing on the canvas and generating code. Save it here to revisit anytime.
                </p>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium text-white transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Sketching
                </Link>
              </div>
            </div>
          ) : (
            /* Sketch grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all"
                >
                  {/* Thumbnail or placeholder */}
                  <div className="w-full aspect-video rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mb-4">
                    {sketch.thumbnail ? (
                      <img
                        src={sketch.thumbnail}
                        alt={sketch.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileCode2 className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* Title & date */}
                  <h3 className="font-semibold text-slate-900 truncate mb-1" title={sketch.title}>
                    {sketch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{formatDate(sketch.createdAt)}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpen(sketch.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => handleExport(sketch)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Export as .tsx"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sketch.id)}
                      disabled={deletingId === sketch.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === sketch.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
