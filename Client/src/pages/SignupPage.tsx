import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, Rocket, Layers, MousePointer2, PenTool, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AuthBackground } from '../components/AuthBackground';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle } = useAuth();

  const getRedirectPath = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    return from || '/home';
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await register({
        name: formData.name,
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
          setError(response.message || response.error || 'Registration failed');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login/signup
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
          setError(response.message || response.error || 'Google signup failed');
        }
      } catch (err) {
        console.error('[Google Signup] Error:', err);
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

  const passwordStrength = getPasswordStrength(formData.password);

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-600 mb-8">
              Start your journey to faster UI development
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
                  Signing up with Google...
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
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${fieldErrors.name ? 'border-red-500' : 'border-slate-200'
                      }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1.5 text-sm text-red-400">{fieldErrors.name}</p>
                )}
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
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

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-1.5 rounded-full transition-colors ${level <= passwordStrength.level
                            ? passwordStrength.color
                            : 'bg-slate-700'
                            }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {/* Password requirements hint */}
                <p className="mt-2 text-xs text-slate-500">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-500">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-slate-600 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Decorative Section with Animated Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="relative w-full max-w-lg px-8">
          {/* Animated Illustration - Sketch to UI Flow */}
          <div className="relative">
            {/* Sketch Card (Left) */}
            <div className="absolute -left-4 top-8 w-48 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200/50 animate-float-delayed">
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <PenTool className="w-3 h-3" /> Sketch
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300" />
                <div className="flex gap-2">
                  <div className="h-12 flex-1 bg-slate-50 rounded border-2 border-dashed border-slate-300" />
                  <div className="h-12 flex-1 bg-slate-50 rounded border-2 border-dashed border-slate-300" />
                </div>
                <div className="h-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300" />
              </div>
            </div>

            {/* Arrow/Flow indicator */}
            <div className="absolute left-40 top-24 z-20">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-16 h-0.5 bg-slate-200" />
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shadow-md animate-pulse-glow">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="w-16 h-0.5 bg-slate-200" />
              </div>
            </div>

            {/* Generated UI Card (Right) */}
            <div className="absolute right-0 top-0 w-56 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200/50 animate-float">
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Generated UI
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-slate-100 rounded-lg flex items-center px-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <div className="ml-2 h-2 w-16 bg-slate-300 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-14 flex-1 bg-indigo-50 rounded-lg p-2">
                    <div className="w-full h-2 bg-indigo-200 rounded mb-1" />
                    <div className="w-3/4 h-2 bg-indigo-100 rounded" />
                  </div>
                  <div className="h-14 flex-1 bg-violet-50 rounded-lg p-2">
                    <div className="w-full h-2 bg-violet-200 rounded mb-1" />
                    <div className="w-3/4 h-2 bg-violet-100 rounded" />
                  </div>
                </div>
                <div className="h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">Get Started</span>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-12 right-20 w-12 h-12 bg-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-center animate-bounce-slow shadow-md">
              <Rocket className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="absolute bottom-0 left-20 w-10 h-10 bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center animate-float-slow shadow-md">
              <MousePointer2 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          {/* Features list below illustration */}
          <div className="mt-32 space-y-4">
            {[
              'Unlimited sketches and exports',
              'AI-powered code generation',
              'Real-time preview',
              'Chat-based refinements',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: '', color: '', textColor: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { level: 1, label: 'Weak password', color: 'bg-red-500', textColor: 'text-red-400' },
    { level: 2, label: 'Fair password', color: 'bg-orange-500', textColor: 'text-orange-400' },
    { level: 3, label: 'Good password', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { level: 4, label: 'Strong password', color: 'bg-green-500', textColor: 'text-green-400' },
  ];

  return levels[Math.max(0, score - 1)] || levels[0];
}
