import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Wand2, Code2, Palette, Zap, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { AuthBackground } from '../components/AuthBackground';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  const getRedirectPath = () => {
    const fromState = (location.state as { from?: { pathname: string; search?: string } })?.from;
    if (fromState) return fromState.pathname + (fromState.search || '');
    const redirect = searchParams.get('redirect');
    if (redirect?.startsWith('/')) return redirect;
    return '/home';
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        navigate(getRedirectPath(), { replace: true });
      } else {
        // Handle errors
        if (response.details) {
          const errors: Record<string, string> = {};
          response.details.forEach((d) => {
            errors[d.field] = d.message;
          });
          setFieldErrors(errors);
        } else {
          setError(response.message || response.error || 'Login failed');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login - using implicit flow to get ID token
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        // useGoogleLogin returns an access_token
        // The backend will verify it by fetching user info from Google
        const response = await loginWithGoogle(tokenResponse.access_token);

        if (response.success) {
          navigate(getRedirectPath(), { replace: true });
        } else {
          setError(response.message || response.error || 'Google login failed');
        }
      } catch (err) {
        console.error('[Google Login] Error:', err);
        setError('Failed to authenticate with Google. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google authentication was cancelled or failed.');
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    triggerGoogleLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
      {/* Animated Background */}
      <AuthBackground />

      {/* Left: Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <Logo size="md" />
          </Link>

          {/* Form Container with Glass Effect */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
            {/* Header */}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-600 mb-8">
              Sign in to continue creating amazing UIs
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Social Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all mb-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-sm text-slate-500">or continue with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'
                      }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-sm text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${fieldErrors.password ? 'border-red-500' : 'border-slate-200'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-sm text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-slate-600 mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Decorative Section with Animated Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="relative w-full max-w-lg px-8">
          {/* Animated Illustration Container */}
          <div className="relative">
            {/* Main floating card */}
            <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 animate-float">
              {/* Browser mockup header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 ml-4 h-6 bg-slate-100 rounded-lg" />
              </div>

              {/* Code preview mockup */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">const</span>
                  <span className="text-blue-600">UI</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-emerald-600">sketch</span>
                  <span className="text-amber-600">()</span>
                  <span className="text-slate-500">;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">return</span>
                  <span className="text-slate-500">&lt;</span>
                  <span className="text-blue-600">Component</span>
                  <span className="text-slate-500">/&gt;</span>
                </div>
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>

              {/* Sparkle decoration */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-100 rounded-2xl border border-indigo-200 flex items-center justify-center shadow-lg animate-pulse-glow">
                <Wand2 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>

            {/* Floating elements around the card */}
            <div className="absolute -top-8 -left-8 w-14 h-14 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center animate-float-delayed shadow-md">
              <Code2 className="w-7 h-7 text-slate-500" />
            </div>

            <div className="absolute -bottom-6 -left-12 w-12 h-12 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center animate-float-slow shadow-md">
              <Palette className="w-6 h-6 text-slate-500" />
            </div>

            <div className="absolute top-1/2 -right-10 w-10 h-10 bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center animate-bounce-slow shadow-md">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="absolute -bottom-8 right-8 w-16 h-16 bg-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-center animate-float shadow-md">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          {/* Text below illustration */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Transform Ideas into Code
            </h2>
            <p className="text-slate-600">
              Join thousands of developers speeding up their UI workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
