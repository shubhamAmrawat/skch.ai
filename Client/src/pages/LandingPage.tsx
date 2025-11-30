import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Palette, Code2, Wand2, MousePointer2, Layers, Sparkles } from 'lucide-react';
import { LandingHeader } from '../components/LandingHeader';
import { ParticleBackground } from '../components/ParticleBackground';
import { Logo, LogoIcon } from '../components/Logo';

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
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Animated Particle Background */}
      <ParticleBackground />

      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 mt-15">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered UI Generation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-linear-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  Sketch to Code
                </span>
                <br />
                <span className="text-slate-400">in Seconds</span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                Transform your wireframes and design ideas into production-ready React components
                with the power of AI. Just sketch, click, and watch the magic happen.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetSketching}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl font-semibold text-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Wand2 className="w-5 h-5" />
                  Get Sketching
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* <button className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all">
                  <Code2 className="w-5 h-5" />
                  View Demo
                </button> */}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <p className="text-3xl font-bold text-white">10x</p>
                  <p className="text-sm text-slate-500">Faster Development</p>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div>
                  <p className="text-3xl font-bold text-white">AI</p>
                  <p className="text-sm text-slate-500">Powered by GPT-4</p>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div>
                  <p className="text-3xl font-bold text-white">React</p>
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
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-900/50 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
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

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">
            © 2024 sktch.ai. Built with ❤️ and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Hero Illustration Component
function HeroIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Glow effects */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />

      {/* Main container */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
        {/* Mock browser header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="flex-1 h-6 bg-slate-800 rounded-lg mx-4" />
        </div>

        {/* Split view mockup */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Sketch */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" />
              Sketch
            </div>
            {/* Wireframe mockup */}
            <div className="space-y-2">
              <div className="h-6 bg-slate-700/50 rounded w-full" />
              <div className="h-20 bg-slate-700/30 rounded border-2 border-dashed border-slate-600" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-12 bg-slate-700/30 rounded" />
                <div className="h-12 bg-slate-700/30 rounded" />
                <div className="h-12 bg-slate-700/30 rounded" />
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-white/5 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Preview
            </div>
            {/* UI mockup */}
            <div className="space-y-2">
              <div className="h-6 bg-linear-to-r from-indigo-500/50 to-purple-500/50 rounded w-full" />
              <div className="h-20 bg-linear-to-br from-cyan-400/20 to-blue-500/20 rounded flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400/60" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-12 bg-indigo-500/30 rounded" />
                <div className="h-12 bg-purple-500/30 rounded" />
                <div className="h-12 bg-pink-500/30 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Arrow between sections */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-linear-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-bounce [animation-duration:3s]">
        <Code2 className="w-8 h-8 text-white" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-linear-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 animate-bounce [animation-duration:2.5s] [animation-delay:0.5s]">
        <Palette className="w-7 h-7 text-white" />
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
    <div className="group relative p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1">
      {/* Step number */}
      <div className="absolute top-6 right-6 text-6xl font-bold text-slate-800/50 group-hover:text-slate-800 transition-colors">
        {step}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

// Loading Transition Component
function LoadingTransition() {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative">
          {/* Outer rings */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 w-28 h-28 rounded-full border-4 border-purple-500/30 animate-spin [animation-duration:3s]" />
          <div className="absolute inset-4 w-24 h-24 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />

          {/* Center logo */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <LogoIcon size={64} />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Preparing Your Canvas
          </h2>
          <p className="text-slate-400">
            Setting up the perfect sketching environment...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

