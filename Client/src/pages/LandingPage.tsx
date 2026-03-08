import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Palette,
  Code2,
  Wand2,
  MousePointer2,
  Layers,
  Sparkles,
  Github,
  Cpu,
  Users,
  Crown,
  Gauge,
  Workflow,
  Rocket,
  LayoutGrid,
  Timer,
} from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { ParticleBackground } from '../components/ParticleBackground';
import { Logo } from '../components/Logo';
import { LoadingTransition } from '../components/LoadingTransition';

export function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSketching = () => {
    setIsLoading(true);
    // Simulate a brief loading state before navigation
    setTimeout(() => {
      navigate('/app');
    }, 1500);
  };

  // Full-screen loader overlay
  if (isLoading) {
    return <LoadingTransition />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Animated Particle Background */}
      <ParticleBackground />

      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Background effects - subtle for light theme */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/25 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 mt-15">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200/80 rounded-full text-indigo-700 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered UI Generation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                  Sketch to Code
                </span>
                <br />
                <span className="text-slate-600">in Seconds</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                Transform your wireframes and design ideas into production-ready React components
                with the power of AI. Just sketch, click, and watch the magic happen.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetSketching}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg text-white transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Wand2 className="w-5 h-5" />
                  Get Sketching
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <p className="text-3xl font-bold text-slate-900">10x</p>
                  <p className="text-sm text-slate-500">Faster Development</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">AI</p>
                  <p className="text-sm text-slate-500">Powered by GPT-4,Claude 4.5</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">React</p>
                  <p className="text-sm text-slate-500">+ Tailwind CSS</p>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-100/50 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your ideas into real code
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={MousePointer2}
              step="01"
              title="Sketch Your Idea"
              description="Use our intuitive canvas to draw wireframes or paste an existing design image"
              color="from-blue-500 to-cyan-400"
            />
            <FeatureCard
              icon={Zap}
              step="02"
              title="AI Generates Code"
              description="Our AI analyzes your design and creates production-ready React components"
              color="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={Palette}
              step="03"
              title="Refine & Export"
              description="Use the chat to make adjustments, then export your polished code"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* Model Comparison Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-50/30 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200/80 rounded-full text-indigo-700 text-sm mb-6">
              <Cpu className="w-4 h-4" />
              <span>AI engines under the hood</span>
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">
              Choose the right AI for the job
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pick from multiple state-of-the-art models to balance quality, speed, and cost for every task.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ModelCard
              icon={Crown}
              title="GPT‑4o"
              badge="Default"
              description="Highest-quality layouts and copy, best for production-ready UIs where polish matters most."
              bestFor="final designs, complex dashboards, client work"
              color="from-amber-500 to-orange-500"
            />
            <ModelCard
              icon={Zap}
              title="GPT‑4o Mini"
              description="Fast and affordable. Great for quick iterations, wireframes, and experimenting with ideas."
              bestFor="rapid prototyping, smaller components, everyday use"
              color="from-emerald-500 to-teal-500"
            />
            <ModelCard
              icon={Workflow}
              title="Claude Sonnet 4.6"
              description="Strong reasoning and structure. Ideal when you want very clean, coherent component code."
              bestFor="refactoring, design systems, code reviews"
              color="from-indigo-500 to-violet-500"
            />
            <ModelCard
              icon={Rocket}
              title="Claude Opus 4.6"
              description="Premium model for the hardest problems and long multi-step UI flows with lots of context."
              bestFor="complex apps, multi-page flows, large projects"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Copy + illustration */}
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <p className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200/80 rounded-full text-indigo-700 text-sm w-fit mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Built for UI teams and solo makers</span>
                </p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
                  Design faster, together.
                </h2>
                <p className="text-slate-600 mb-8 max-w-md">
                  Teams use sktch.ai to turn rough ideas into polished components in minutes, instead of days of manual work.
                </p>
                <StatsIllustration />
              </div>

              {/* Right: Stats grid */}
              <div className="bg-linear-to-br from-indigo-50/80 via-white to-violet-50/50 p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-slate-200">
                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                  <StatCard
                    icon={LayoutGrid}
                    value="1.2k+"
                    label="UI generations created"
                    color="from-indigo-500 to-violet-500"
                  />
                  <StatCard
                    icon={Users}
                    value="300+"
                    label="Designers & developers"
                    color="from-violet-500 to-purple-500"
                  />
                  <StatCard
                    icon={Timer}
                    value="95%"
                    label="Average time saved per UI"
                    color="from-purple-500 to-pink-500"
                  />
                  <StatCard
                    icon={Gauge}
                    value="10x"
                    label="Faster than hand-coding"
                    color="from-pink-500 to-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-6 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-4 ">
            
            <p className=" text-slate-500">
              © 2024 sktch.ai. Built with ❤️
            </p>
            <a
              href="https://github.com/shubhamAmrawat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">shubhamAmrawat</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Hero Illustration Component
function HeroIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Main container - light theme */}
      <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
        {/* Mock browser header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="flex-1 h-6 bg-slate-100 rounded-lg mx-4" />
        </div>

        {/* Split view mockup */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Sketch */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" />
              Sketch
            </div>
            {/* Wireframe mockup */}
            <div className="space-y-2">
              <div className="h-6 bg-slate-200/80 rounded w-full" />
              <div className="h-20 bg-slate-100 rounded border-2 border-dashed border-slate-300" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-12 bg-slate-100 rounded" />
                <div className="h-12 bg-slate-100 rounded" />
                <div className="h-12 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Preview
            </div>
            {/* UI mockup */}
            <div className="space-y-2">
              <div className="h-6 bg-indigo-200 rounded w-full" />
              <div className="h-20 bg-indigo-100 rounded flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-12 bg-indigo-200 rounded" />
                <div className="h-12 bg-violet-200 rounded" />
                <div className="h-12 bg-purple-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Arrow between sections */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Floating elements - subtle */}
      <div className="absolute -top-4 -right-4 w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200 animate-bounce [animation-duration:3s]">
        <Code2 className="w-7 h-7 text-indigo-600" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center border border-violet-200 animate-bounce [animation-duration:2.5s] [animation-delay:0.5s]">
        <Palette className="w-6 h-6 text-violet-600" />
      </div>
    </div>
  );
}

// Model Card Component
function ModelCard({
  icon: Icon,
  title,
  badge,
  description,
  bestFor,
  color,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
  bestFor: string;
  color: string;
}) {
  return (
    <div className="group relative p-8 bg-white border border-slate-200 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {badge && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-600 text-sm mt-3 leading-relaxed">{description}</p>
      <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
        <span className="font-semibold text-indigo-600">Best for:</span> {bestFor}
      </p>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="group flex flex-col gap-2 p-5 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

// Stats Illustration - decorative UI blocks suggesting generations
function StatsIllustration() {
  return (
    <div className="relative inline-flex items-end gap-2 mt-4">
      <div className="flex gap-1.5 items-end">
        {[
          ['from-indigo-400 to-indigo-600', 'h-7'],
          ['from-violet-400 to-violet-600', 'h-8'],
          ['from-purple-400 to-purple-600', 'h-9'],
          ['from-pink-400 to-pink-600', 'h-10'],
        ].map(([grad, h], i) => (
          <div key={i} className={`w-8 rounded-lg bg-linear-to-b ${grad} shadow-md ${h}`} />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse [animation-delay:0.15s]" />
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:0.3s]" />
      </div>
      <div className="absolute -right-1 -top-1 w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  step,
  title,
  description,
  color
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative p-8 bg-white border border-slate-200 rounded-3xl hover:border-slate-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Step number */}
      <div className="absolute top-6 right-6 text-6xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors">
        {step}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}


