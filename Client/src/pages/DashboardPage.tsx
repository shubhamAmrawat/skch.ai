import { useNavigate, Link } from 'react-router-dom';
import { FolderOpen, Pencil, ArrowRight, Globe, Heart, Eye, Library } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { ParticleBackground } from '../components/ParticleBackground';
import { LoadingTransition } from '../components/LoadingTransition';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { getPublicSketches, type PublicSketch } from '../services/sketchApi';

const REFETCH_AFTER_MS = 30_000; // Don't refetch more than once per 30s when tab becomes visible

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [publicSketches, setPublicSketches] = useState<PublicSketch[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const lastFetchedAt = useRef<number>(0);

  // Single fetch on mount; abort on cleanup so Strict Mode only results in one request
  useEffect(() => {
    const controller = new AbortController();
    setPublicLoading(true);
    getPublicSketches({ limit: 6, sort: 'recent' }, controller.signal)
      .then((res) => {
        setPublicSketches(res.data?.sketches ?? []);
        lastFetchedAt.current = Date.now();
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setPublicSketches([]);
      })
      .finally(() => setPublicLoading(false));
    return () => controller.abort();
  }, []);

  // Refetch only when user returns to the tab (visibility), and throttle to avoid repeated requests
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedAt.current < REFETCH_AFTER_MS) return;
      lastFetchedAt.current = Date.now();
      getPublicSketches({ limit: 6, sort: 'recent' })
        .then((res) => setPublicSketches(res.data?.sketches ?? []))
        .catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const handleStartSketching = () => {
    setIsNavigating(true);
    setTimeout(() => navigate('/app'), 800);
  };

  if (isNavigating) {
    return <LoadingTransition title="Opening Canvas" subtitle="Getting your workspace ready..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <ParticleBackground />
      <LandingHeader />

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-lg text-slate-600">
              Ready to turn your ideas into code? Start a new sketch or pick up where you left off.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-6">
            <button
              onClick={handleStartSketching}
              className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all text-left cursor-cell"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Pencil className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Start Sketching</h2>
                <p className="text-slate-600 text-sm">Create a new wireframe and generate code</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/sketches')}
              className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all text-left cursor-cell"
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <FolderOpen className="w-7 h-7 text-violet-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">My Sketches</h2>
                <p className="text-slate-600 text-sm">View and manage your saved projects</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Public Generations */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                Public Generations
              </h2>
              <Link
                to="/explore"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                View all →
              </Link>
            </div>
            {publicLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : publicSketches.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
                No public generations yet. Be the first to share!
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicSketches.map((sketch) => (
                  <button
                    key={sketch.id}
                    onClick={() => navigate(`/explore?id=${sketch.id}`)}
                    className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-cell"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {sketch.thumbnail ? (
                        <img
                          src={sketch.thumbnail}
                          alt={sketch.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-slate-400 text-4xl font-bold">{sketch.title[0]}</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-slate-900 truncate text-sm">{sketch.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className={`flex items-center gap-1 ${sketch.likedByMe ? 'text-red-500' : ''}`}>
                          <Heart className={`w-3.5 h-3.5 ${sketch.likedByMe ? 'fill-current' : ''}`} />
                          {sketch.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {sketch.views}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* component library coming soon  */}
         <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-indigo-500" />
              Component Library
            </h2>
            <p className="text-slate-600 text-sm">
              Browse and use pre-built components to speed up your development
            </p>
            {/*  coming soon banner */}
            <div className="mt-4 p-4 bg-[#fff] border border-slate-100 rounded-xl text-center">
              <p className="text-sm text-indigo-700">Coming soon</p>
              <p className="text-sm text-indigo-700">We are working on it and it will be available soon</p>
            </div>
          </div>
          {/* Quick Tip */}
          {/* <div className="mt-12 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-indigo-900">Pro tip</p>
                <p className="text-sm text-indigo-700 mt-0.5">
                  Draw on the canvas or paste an image to get started. Our AI will generate React + Tailwind code in seconds.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
