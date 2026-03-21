import { useNavigate, Link } from 'react-router-dom';
import {
  FolderOpen, Pencil, ArrowRight, Globe, Heart,
  Eye, Library, BarChart2, Layers, TrendingUp, Users, Clock,
} from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { ParticleBackground } from '../components/ParticleBackground';
import { LoadingTransition } from '../components/LoadingTransition';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import {
  getPublicSketches,
  getSketches,
  getSketchStats,
  type PublicSketch,
  type Sketch,
  type SketchStats,
} from '../services/sketchApi';

const REFETCH_AFTER_MS = 30_000;

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [publicSketches, setPublicSketches] = useState<PublicSketch[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [stats, setStats] = useState<SketchStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentSketch, setRecentSketch] = useState<Sketch | null>(null);
  const [recentLoading, setRecentLoading] = useState(true);
  const lastFetchedAt = useRef<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    setPublicLoading(true);
    getPublicSketches({ limit: 4, sort: 'popular' }, controller.signal)
      .then((res) => {
        setPublicSketches(res.data?.sketches ?? []);
        lastFetchedAt.current = Date.now();
      })
      .catch((err) => { if (err?.name !== 'AbortError') setPublicSketches([]); })
      .finally(() => setPublicLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setStatsLoading(true);
    getSketchStats()
      .then((res) => setStats(res.data ?? null))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setRecentLoading(true);
    getSketches({ limit: 1, page: 1 })
      .then((res) => setRecentSketch(res.data?.sketches?.[0] ?? null))
      .catch(() => setRecentSketch(null))
      .finally(() => setRecentLoading(false));
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedAt.current < REFETCH_AFTER_MS) return;
      lastFetchedAt.current = Date.now();
      getPublicSketches({ limit: 4, sort: 'popular' })
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

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <ParticleBackground />
      <LandingHeader />

      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Row 1: Welcome + Quick Actions */}
          {/* Mobile: stacked. Tablet+: side by side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Welcome banner — full width mobile, 2/3 tablet+ */}
            <div
              className="md:col-span-2 border border-indigo-100 rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)', transform: 'translateY(40%)' }} />
              <div className="relative">
                <p className="text-base font-semibold text-indigo-600 mb-0.5">
                  Welcome back{firstName ? `, ${firstName}` : ''} 👋
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Draw a wireframe and watch it turn into production-ready code.
                </p>
              </div>
              {/* Stat pills — wrap on mobile */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  {statsLoading ? '—' : stats?.totalSketches ?? 0} sketches
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <Globe className="w-3 h-3 text-violet-400" />
                  {statsLoading ? '—' : stats?.totalPublic ?? 0} public
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <Heart className="w-3 h-3 text-rose-400" />
                  {statsLoading ? '—' : stats?.totalLikes ?? 0} likes
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <Eye className="w-3 h-3 text-sky-400" />
                  {statsLoading ? '—' : stats?.totalViews ?? 0} views
                </div>
              </div>
            </div>

            {/* Quick actions — full width mobile, 1/3 + row-span-2 on tablet+ */}
            <div className="md:row-span-2 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Quick actions
              </p>

              {/* New sketch tile */}
              <button
                onClick={handleStartSketching}
                className="flex flex-col justify-end p-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-left h-[130px] relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute w-8 h-8 border-2 border-white/20 rounded-lg"
                    style={{ top: '15%', left: '10%', animation: 'float1 4s ease-in-out infinite' }} />
                  <div className="absolute w-12 h-8 border-2 border-white/15 rounded"
                    style={{ top: '20%', left: '35%', animation: 'float2 5s ease-in-out infinite' }} />
                  <div className="absolute w-6 h-6 border-2 border-white/20 rounded-full"
                    style={{ top: '35%', right: '20%', animation: 'float1 3.5s ease-in-out infinite reverse' }} />
                  <div className="absolute w-10 h-6 border border-white/10 rounded"
                    style={{ top: '10%', right: '10%', animation: 'float2 6s ease-in-out infinite' }} />
                  <svg className="absolute bottom-12 left-4 right-4 opacity-20" style={{ width: 'calc(100% - 32px)', height: '30px' }}>
                    <path d="M0 20 Q30 5 60 18 Q90 30 120 10 Q150 0 180 15" fill="none" stroke="white" strokeWidth="2" strokeDasharray="200" strokeDashoffset="200"
                      style={{ animation: 'drawLine 3s ease-in-out infinite' }} />
                  </svg>
                </div>
                <style>{`
                  @keyframes float1 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(5deg); }
                  }
                  @keyframes float2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(-3deg); }
                  }
                  @keyframes drawLine {
                    0% { stroke-dashoffset: 200; opacity: 0.3; }
                    50% { stroke-dashoffset: 0; opacity: 0.6; }
                    100% { stroke-dashoffset: -200; opacity: 0; }
                  }
                `}</style>
                <div className="relative">
                  <Pencil className="w-5 h-5 text-indigo-200 mb-2" />
                  <p className="text-sm font-semibold text-white">New sketch</p>
                  <p className="text-xs text-indigo-300 mt-0.5">Draw → generate code</p>
                </div>
              </button>

              {/* My sketches */}
              <button
                onClick={() => navigate('/sketches')}
                className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
              >
                <FolderOpen className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">My sketches</p>
                  <p className="text-xs text-slate-500">Browse saved projects</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0" />
              </button>

              {/* Explore */}
              <button
                onClick={() => navigate('/explore')}
                className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
              >
                <Globe className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">Explore</p>
                  <p className="text-xs text-slate-500">Browse public generations</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0" />
              </button>

              {/* Component library */}
              <button
                onClick={() => navigate('/library')}
                className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
              >
                <Library className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">Component library</p>
                  <p className="text-xs text-slate-500">Browse ready-made components</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0" />
              </button>
            </div>

            {/* Row 2: Recent sketch + Stats */}
            {/* Mobile: stacked. Tablet+: side by side under welcome */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Recent sketch */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent sketch</p>
                </div>
                {recentLoading ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full aspect-video rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                  </div>
                ) : recentSketch ? (
                  <button
                    onClick={() => navigate(`/app?sketchId=${recentSketch.id}`)}
                    className="flex-1 flex flex-col gap-2 text-left group"
                  >
                    <div className="w-full aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      {recentSketch.thumbnail ? (
                        <img
                          src={recentSketch.thumbnail}
                          alt={recentSketch.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-200">
                          {recentSketch.title[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {recentSketch.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(recentSketch.updatedAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </button>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
                    <p className="text-sm text-slate-400">No sketches yet</p>
                    <button
                      onClick={handleStartSketching}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Create your first →
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your stats</p>
                </div>
                <StatCard
                  icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
                  label="Total sketches"
                  value={statsLoading ? null : (stats?.totalSketches ?? 0)}
                  accent="indigo"
                />
                <StatCard
                  icon={<Globe className="w-3.5 h-3.5 text-violet-400" />}
                  label="Public sketches"
                  value={statsLoading ? null : (stats?.totalPublic ?? 0)}
                  accent="violet"
                />
                <StatCard
                  icon={<Heart className="w-3.5 h-3.5 text-rose-400" />}
                  label="Likes received"
                  value={statsLoading ? null : (stats?.totalLikes ?? 0)}
                  accent="rose"
                />
                <StatCard
                  icon={<Eye className="w-3.5 h-3.5 text-sky-400" />}
                  label="Total views"
                  value={statsLoading ? null : (stats?.totalViews ?? 0)}
                  accent="sky"
                />
              </div>

            </div>
          </div>

          {/* Trending generations — full width, responsive columns */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trending generations
                </h2>
              </div>
              <Link
                to="/explore"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                View all →
              </Link>
            </div>

            {publicLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl bg-slate-100 animate-pulse aspect-video" />
                ))}
              </div>
            ) : publicSketches.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No public generations yet. Be the first to share!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {publicSketches.map((sketch) => (
                  <button
                    key={sketch.id}
                    onClick={() => navigate(`/explore?id=${sketch.id}`)}
                    className="group text-left bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      {sketch.thumbnail ? (
                        <img
                          src={sketch.thumbnail}
                          alt={sketch.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-200">
                          {sketch.title[0]}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-slate-800 truncate">{sketch.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className={`flex items-center gap-1 ${sketch.likedByMe ? 'text-rose-500' : ''}`}>
                          <Heart className={`w-3 h-3 ${sketch.likedByMe ? 'fill-current' : ''}`} />
                          {sketch.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {sketch.views}
                        </span>
                        {sketch.author && (
                          <span className="hidden sm:flex items-center gap-1 ml-auto truncate">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{sketch.author.name.split(' ')[0]}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  accent: 'indigo' | 'violet' | 'rose' | 'sky';
}) {
  const bgMap = {
    indigo: 'bg-indigo-50',
    violet: 'bg-violet-50',
    rose: 'bg-rose-50',
    sky: 'bg-sky-50',
  };

  return (
    <div className={`flex items-center gap-3 p-2.5 ${bgMap[accent]} rounded-xl`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        {value === null ? (
          <div className="h-4 w-8 bg-slate-200 animate-pulse rounded mt-0.5" />
        ) : (
          <p className="text-sm font-bold text-slate-800">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}