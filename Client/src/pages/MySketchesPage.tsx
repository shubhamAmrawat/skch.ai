import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, FileCode2, ExternalLink, Download,
  Trash2, Loader2, Plus, Globe, Lock, Tag,
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
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
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

  useEffect(() => { loadSketches(); }, [loadSketches]);

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

      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Sketches</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {loading ? 'Loading...' : `${sketches.length} sketch${sketches.length !== 1 ? 'es' : ''} saved`}
              </p>
            </div>
            <Link
              to="/app"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New sketch</span>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-500">Loading your sketches...</p>
            </div>
          ) : sketches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                <FileCode2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">No sketches yet</h2>
              <p className="text-sm text-slate-500 max-w-xs mb-6">
                Create your first sketch by drawing on the canvas and generating code.
              </p>
              <Link
                to="/app"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Start sketching
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all"
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-video bg-slate-100 overflow-hidden cursor-pointer relative"
                    onClick={() => navigate(`/app?sketchId=${sketch.id}`)}
                  >
                    {sketch.thumbnail ? (
                      <img
                        src={sketch.thumbnail}
                        alt={sketch.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileCode2 className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {/* Visibility badge */}
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm ${
                      sketch.visibility === 'public'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-slate-800/70 text-white'
                    }`}>
                      {sketch.visibility === 'public'
                        ? <Globe className="w-3 h-3" />
                        : <Lock className="w-3 h-3" />
                      }
                      {sketch.visibility === 'public' ? 'Public' : 'Private'}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Title + date */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/app?sketchId=${sketch.id}`)}
                      >
                        {sketch.title}
                      </h3>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(sketch.createdAt)}</span>
                    </div>

                    {/* Tags */}
                    {sketch.tags && sketch.tags.length > 0 && (
                      <div className="flex items-center gap-1 mb-3 flex-wrap">
                        <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        {sketch.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {tag}
                          </span>
                        ))}
                        {sketch.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{sketch.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/app?sketchId=${sketch.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </button>
                      <div className="w-px h-5 bg-slate-100" />
                      <button
                        onClick={() => downloadCodeAsFile(sketch.code, sketch.title)}
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Download .tsx"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-5 bg-slate-100" />
                      <button
                        onClick={() => handleDelete(sketch.id)}
                        disabled={deletingId === sketch.id}
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === sketch.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
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