import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Heart, Eye, ExternalLink, Loader2,
  X, Globe, FileCode2, TrendingUp, Clock, Flame,
} from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import {
  getPublicSketches, getPublicSketch, likePublicSketch, forkPublicSketch,
  type PublicSketch, type PublicSketchDetail,
} from '../services/sketchApi';
import { useAuth } from '../hooks/useAuth';
import { AvatarImage } from '../components/AvatarImage';

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

type SortOption = 'recent' | 'popular' | 'trending';

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'recent', label: 'Recent', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'popular', label: 'Popular', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5" /> },
];

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const detailId = searchParams.get('id');

  const [sketches, setSketches] = useState<PublicSketch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [detailSketch, setDetailSketch] = useState<PublicSketchDetail | null>(null);
  const isOwnSketch = detailSketch?.author?.id && user?.id && detailSketch.author.id === user.id;
  const [detailLoading, setDetailLoading] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [forkingId, setForkingId] = useState<string | null>(null);

  const loadSketches = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicSketches({ page, limit, q: search || undefined, sort }, signal);
      setSketches(res.data?.sketches ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load sketches');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => {
    const controller = new AbortController();
    loadSketches(controller.signal);
    return () => controller.abort();
  }, [loadSketches]);

  useEffect(() => {
    if (!detailId) { setDetailSketch(null); return; }
    setDetailLoading(true);
    getPublicSketch(detailId)
      .then((res) => {
        const sketch = res.data?.sketch;
        if (sketch) {
          setDetailSketch(sketch);
          setSketches((prev) =>
            prev.map((s) => s.id === detailId ? { ...s, likedByMe: sketch.likedByMe, likesCount: sketch.likesCount } : s)
          );
        }
      })
      .catch(() => setDetailSketch(null))
      .finally(() => setDetailLoading(false));
  }, [detailId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadSketches();
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setLikingId(id);
    try {
      await likePublicSketch(id);
      setSketches((prev) =>
        prev.map((s) => s.id === id ? { ...s, likesCount: s.likedByMe ? s.likesCount - 1 : s.likesCount + 1, likedByMe: !s.likedByMe } : s)
      );
      if (detailSketch?.id === id) {
        setDetailSketch((prev) => prev ? { ...prev, likesCount: prev.likedByMe ? prev.likesCount - 1 : prev.likesCount + 1, likedByMe: !prev.likedByMe } : null);
      }
    } catch { /* ignore */ }
    finally { setLikingId(null); }
  };

  const handleFork = async () => {
    if (!detailSketch || !isAuthenticated) { navigate('/login'); return; }
    setForkingId(detailSketch.id);
    try {
      const res = await forkPublicSketch(detailSketch.id);
      const newId = res.data?.sketch?.id;
      if (newId) {
        setSearchParams((p) => { p.delete('id'); return p; });
        setDetailSketch(null);
        navigate(`/app?sketchId=${newId}`);
      }
    } catch { /* ignore */ }
    finally { setForkingId(null); }
  };

  const openDetail = (id: string) => setSearchParams((p) => { p.set('id', id); return p; });
  const closeDetail = () => { setSearchParams((p) => { p.delete('id'); return p; }); setDetailSketch(null); };
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />

      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-bold text-slate-900">Explore</h1>
            </div>
            <p className="text-sm text-slate-500">
              UI designs created by the community. Like, fork, and customize.
            </p>
          </div>

          {/* Search + Sort */}
         {/* Search + Sort — unified bar */}
         <form onSubmit={handleSearch} className="mb-6">
            {/* Desktop: single unified bar */}
            <div className="hidden sm:flex items-center gap-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              {/* Search icon + input */}
              <div className="flex items-center gap-2.5 flex-1 px-4 py-0">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by title or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                />
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

              {/* Sort pills */}
              <div className="flex items-center gap-1 px-2 py-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSort(opt.value); setPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      sort === opt.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              {/* <div className="w-px h-6 bg-slate-200 flex-shrink-0" /> */}

              {/* Search button */}
              {/* <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 mx-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors flex-shrink-0"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button> */}
            </div>

            {/* Mobile: stacked layout */}
            <div className="flex sm:hidden flex-col gap-2">
              {/* Search row */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-300 transition-all">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by title or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort pills — horizontal scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSort(opt.value); setPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      sort === opt.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-500">Loading generations...</p>
            </div>
          ) : sketches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                <FileCode2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-medium text-slate-700 mb-1">No generations found</p>
              <p className="text-sm text-slate-400">
                {search ? 'Try a different search term.' : 'Be the first to share your design!'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-4">{total} generation{total !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sketches.map((sketch) => (
                  <div
                    key={sketch.id}
                    onClick={() => openDetail(sketch.id)}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
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
                      {/* Like button overlay */}
                      <button
                        onClick={(e) => handleLike(sketch.id, e)}
                        className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm transition-all ${
                          sketch.likedByMe
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/80 text-slate-600 hover:bg-rose-50 hover:text-rose-500'
                        }`}
                      >
                        {likingId === sketch.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Heart className={`w-3 h-3 ${sketch.likedByMe ? 'fill-current' : ''}`} />
                        )}
                        {sketch.likesCount}
                      </button>
                    </div>

                    <div className="p-3.5">
                      <h3 className="text-sm font-semibold text-slate-900 truncate mb-1.5">{sketch.title}</h3>

                      {sketch.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {sketch.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />{sketch.views}
                          </span>
                          <span>{formatDate(sketch.createdAt)}</span>
                        </div>
                        {sketch.author && (
                          <div className="flex items-center gap-1.5">
                            <AvatarImage
                              src={sketch.author.avatar}
                              alt={sketch.author.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="truncate max-w-[80px]">{sketch.author.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {(detailId || detailSketch) && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={closeDetail}
        >
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading sketch...</p>
              </div>
            ) : detailSketch ? (
              <>
                {/* Full bleed thumbnail with overlaid header */}
                <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '16/9' }}>
                  {detailSketch.thumbnail ? (
                    <div className="absolute inset-2 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={detailSketch.thumbnail}
                        alt={detailSketch.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
                      <FileCode2 className="w-16 h-16 text-slate-300" />
                    </div>
                  )}

                  {/* Top gradient overlay for close button */}
                  <div
                    className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 100%)' }}
                  />

                  {/* Close button — top right on image */}
                  <button
                    onClick={closeDetail}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

          

                  {/* Bottom gradient + title overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 p-4 pt-8"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
                  >
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {detailSketch.title}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Eye className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-xs text-white/60">{detailSketch.views} views</span>
                      <span className="text-white/40 mx-1">·</span>
                      <span className="text-xs text-white/60">{formatDate(detailSketch.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Content below thumbnail */}
                <div className="p-5 space-y-4 overflow-y-auto">

                  {/* Author row */}
                  {detailSketch.author && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AvatarImage
                          src={detailSketch.author.avatar}
                          alt={detailSketch.author.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{detailSketch.author.name}</p>
                          <p className="text-xs text-slate-400">Creator</p>
                        </div>
                      </div>
                      {/* Fork count if available */}
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                        <Heart className="w-3 h-3" />
                        {detailSketch.likesCount} likes
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {detailSketch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {detailSketch.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {isOwnSketch ? (
                    <button
                      onClick={() => { closeDetail(); navigate(`/app?sketchId=${detailSketch.id}`); }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in editor
                    </button>
                  ) : (
                    <button
                      onClick={handleFork}
                      disabled={!isAuthenticated || forkingId === detailSketch.id}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                    >
                      {forkingId === detailSketch.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          {isAuthenticated ? 'Open & Customize' : 'Log in to customize'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FileCode2 className="w-10 h-10 text-slate-300" />
                <p className="text-sm text-slate-400">Failed to load sketch</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}