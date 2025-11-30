import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Wand2, Code2, Palette, Zap, Sparkles } from 'lucide-react';
import { AuthBackground } from '../components/AuthBackground';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Animated Background */}
      <AuthBackground />

      {/* Left: Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <Logo size="md" />
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-8">
            Sign in to continue creating amazing UIs
          </p>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium hover:bg-slate-800 hover:border-slate-600 transition-all mb-6 backdrop-blur-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-sm text-slate-500">or continue with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Decorative Section with Animated Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="relative w-full max-w-lg px-8">
          {/* Animated Illustration Container */}
          <div className="relative">
            {/* Main floating card */}
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl animate-float">
              {/* Browser mockup header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 ml-4 h-6 bg-slate-700/50 rounded-lg" />
              </div>

              {/* Code preview mockup */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">const</span>
                  <span className="text-blue-400">UI</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-green-400">sketch</span>
                  <span className="text-yellow-400">()</span>
                  <span className="text-slate-400">;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">return</span>
                  <span className="text-slate-400">&lt;</span>
                  <span className="text-blue-400">Component</span>
                  <span className="text-slate-400">/&gt;</span>
                </div>
                <div className="h-4 bg-slate-700/30 rounded w-3/4" />
                <div className="h-4 bg-slate-700/30 rounded w-1/2" />
              </div>

              {/* Sparkle decoration */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Floating elements around the card */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-indigo-500/20 backdrop-blur-lg rounded-2xl border border-indigo-500/30 flex items-center justify-center animate-float-delayed shadow-lg">
              <Code2 className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="absolute -bottom-6 -left-12 w-14 h-14 bg-purple-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 flex items-center justify-center animate-float-slow shadow-lg">
              <Palette className="w-7 h-7 text-purple-400" />
            </div>

            <div className="absolute top-1/2 -right-10 w-12 h-12 bg-pink-500/20 backdrop-blur-lg rounded-xl border border-pink-500/30 flex items-center justify-center animate-bounce-slow shadow-lg">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>

            <div className="absolute -bottom-8 right-8 w-20 h-20 bg-emerald-500/20 backdrop-blur-lg rounded-2xl border border-emerald-500/30 flex items-center justify-center animate-float shadow-lg">
              <Sparkles className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Text below illustration */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              Transform Ideas into Code
            </h2>
            <p className="text-slate-400">
              Join thousands of developers speeding up their UI workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
