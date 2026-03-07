import { useNavigate } from 'react-router-dom';
import { Sparkles, FolderOpen, Pencil, ArrowRight } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { ParticleBackground } from '../components/ParticleBackground';
import { LoadingTransition } from '../components/LoadingTransition';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

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
              className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all text-left"
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
              className="group flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all text-left"
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

          {/* Quick Tip */}
          <div className="mt-12 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-indigo-900">Pro tip</p>
                <p className="text-sm text-indigo-700 mt-0.5">
                  Draw on the canvas or paste an image to get started. Our AI will generate React + Tailwind code in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
