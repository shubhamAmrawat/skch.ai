import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Eye,
  ExternalLink,
  Loader2,
  X,
  Globe,
  FileCode2,
} from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import {
  getPublicSketches,
  getPublicSketch,
  likePublicSketch,
  forkPublicSketch,
  type PublicSketch,
  type PublicSketchDetail,
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
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

type SortOption = 'recent' | 'popular' | 'trending';

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
      const res = await getPublicSketches(
        { page, limit, q: search || undefined, sort },
        signal
      );
      setSketches(res.data?.sketches ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load sketches');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  // Abort on cleanup so Strict Mode only results in one request
  useEffect(() => {
    const controller = new AbortController();
    loadSketches(controller.signal);
    return () => controller.abort();
  }, [loadSketches]);

  // Load detail when id in URL
  useEffect(() => {
    if (!detailId) {
      setDetailSketch(null);
      return;
    }
    setDetailLoading(true);
    getPublicSketch(detailId)
      .then((res) => {
        const sketch = res.data?.sketch;
        if (sketch) {
          setDetailSketch(sketch);
          // Sync like state from detail into list so cards show correct heart after opening
          setSketches((prev) =>
            prev.map((s) =>
              s.id === detailId ? { ...s, likedByMe: sketch.likedByMe, likesCount: sketch.likesCount } : s
            )
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLikingId(id);
    try {
      await likePublicSketch(id);
      setSketches((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                likesCount: s.likedByMe ? s.likesCount - 1 : s.likesCount + 1,
                likedByMe: !s.likedByMe,
              }
            : s
        )
      );
      if (detailSketch?.id === id) {
        setDetailSketch((prev) =>
          prev
            ? {
                ...prev,
                likesCount: prev.likedByMe ? prev.likesCount - 1 : prev.likesCount + 1,
                likedByMe: !prev.likedByMe,
              }
            : null
        );
      }
    } catch {
      // ignore
    } finally {
      setLikingId(null);
    }
  };

  const handleFork = async () => {
    if (!detailSketch || !isAuthenticated) {
      navigate('/login');
      return;
    }
    setForkingId(detailSketch.id);
    try {
      const res = await forkPublicSketch(detailSketch.id);
      const newId = res.data?.sketch?.id;
      if (newId) {
        setSearchParams((p) => {
          p.delete('id');
          return p;
        });
        setDetailSketch(null);
        navigate(`/app?sketchId=${newId}`);
      }
    } catch {
      // ignore
    } finally {
      setForkingId(null);
    }
  };

  const openDetail = (id: string) => {
    setSearchParams((p) => {
      p.set('id', id);
      return p;
    });
  };

  const closeDetail = () => {
    setSearchParams((p) => {
      p.delete('id');
      return p;
    });
    setDetailSketch(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-8 h-8 text-indigo-500" />
              Public Generations
            </h1>
            <p className="text-slate-600 mt-1">
              Explore UI designs created by the community. Like, fork, and customize.
            </p>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors"
              >
                Search
              </button>
            </form>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
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
              <p className="text-slate-600">Loading public generations...</p>
            </div>
          ) : sketches.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-12 shadow-lg shadow-slate-200/50">
              <div className="text-center">
                <FileCode2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No public generations yet</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  {search ? 'Try a different search term.' : 'Be the first to share your design with the community!'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                {total} generation{total !== 1 ? 's' : ''} found
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sketches.map((sketch) => (
                  <div
                    key={sketch.id}
                    onClick={() => openDetail(sketch.id)}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {sketch.thumbnail ? (
                        <img
                          src={sketch.thumbnail}
                          alt={sketch.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <FileCode2 className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 truncate mb-1" title={sketch.title}>
                        {sketch.title}
                      </h3>
                      {sketch.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {sketch.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <button
                            onClick={(e) => handleLike(sketch.id, e)}
                            className={`flex items-center gap-1 transition-colors ${
                              sketch.likedByMe ? 'text-red-500' : 'hover:text-red-500'
                            } ${!isAuthenticated ? 'cursor-pointer' : ''}`}
                            title={isAuthenticated ? (sketch.likedByMe ? 'Unlike' : 'Like') : 'Log in to like'}
                          >
                            {likingId === sketch.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart
                                className={`w-4 h-4 ${sketch.likedByMe ? 'fill-current' : ''}`}
                              />
                            )}
                            {sketch.likesCount}
                          </button>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {sketch.views}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(sketch.createdAt)}</span>
                      </div>
                      {sketch.author && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                          <AvatarImage
                            src={sketch.author.avatar}
                            alt={sketch.author.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs text-slate-500 truncate">{sketch.author.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 truncate pr-4">
                {detailLoading ? 'Loading...' : detailSketch?.title ?? 'Sketch'}
              </h2>
              <button
                onClick={closeDetail}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
              ) : detailSketch ? (
                <>
                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4">
                    {detailSketch.thumbnail ? (
                      <img
                        src={detailSketch.thumbnail}
                        alt={detailSketch.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileCode2 className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {detailSketch.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-sm px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <button
                      onClick={(e) => handleLike(detailSketch.id, e)}
                      className={`flex items-center gap-1.5 ${
                        detailSketch.likedByMe ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      {likingId === detailSketch.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart
                          className={`w-4 h-4 ${detailSketch.likedByMe ? 'fill-current' : ''}`}
                        />
                      )}
                      {detailSketch.likesCount} likes
                    </button>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {detailSketch.views} views
                    </span>
                    {detailSketch.author && (
                      <div className="flex items-center gap-2">
                        <AvatarImage
                          src={detailSketch.author.avatar}
                          alt={detailSketch.author.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{detailSketch.author.name}</span>
                      </div>
                    )}
                  </div>
                  {isOwnSketch ? (
                    <button
                      onClick={() => {
                        closeDetail();
                        navigate(`/app?sketchId=${detailSketch.id}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open in editor
                    </button>
                  ) : (
                    <button
                      onClick={handleFork}
                      disabled={!isAuthenticated || forkingId === detailSketch.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {forkingId === detailSketch.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          {isAuthenticated ? 'Open & Customize' : 'Log in to customize'}
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-center text-slate-500 py-8">Failed to load sketch</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
