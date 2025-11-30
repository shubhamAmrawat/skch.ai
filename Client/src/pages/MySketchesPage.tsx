import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Rocket, Bell } from 'lucide-react';
import { Logo } from '../components/Logo';

export function MySketchesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="group">
              <Logo size="md" />
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-slate-800 p-12">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 mb-8 shadow-2xl shadow-indigo-500/30">
                <Rocket className="w-10 h-10 text-white" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                My Sketches
              </h1>

              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
                Save, organize, and revisit your design projects. This feature is currently under development
                and will be available soon.
              </p>

              {/* Features preview */}
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                {[
                  { title: 'Save Projects', desc: 'Keep all your sketches organized' },
                  { title: 'Version History', desc: 'Track changes over time' },
                  { title: 'Share & Export', desc: 'Collaborate with your team' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <p className="font-medium text-white mb-1">{feature.title}</p>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Notify me button */}
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                <Bell className="w-5 h-5" />
                Notify Me When Ready
              </button>

              {/* Illustration */}
              <div className="mt-12 flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-32 h-40 bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 transform ${i === 2 ? 'scale-110 z-10' : 'opacity-50'
                      }`}
                    style={{ transform: `rotate(${(i - 2) * 5}deg)` }}
                  >
                    <div className="h-4 bg-slate-700/50 rounded mb-2" />
                    <div className="h-16 bg-slate-700/30 rounded border border-dashed border-slate-600/50" />
                    <div className="mt-2 space-y-1">
                      <div className="h-2 bg-slate-700/50 rounded w-3/4" />
                      <div className="h-2 bg-slate-700/50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
