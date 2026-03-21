import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Component from '../models/Component.js';
dotenv.config();

const components = [
  // ═══════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Minimal Login',
    category: 'auth',
    description: 'Clean email/password login with floating labels and smooth validation states.',
    tags: ['login', 'auth', 'form', 'minimal'],
    order: 1,
    code: `import { useState } from "react";
export default function MinimalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    if (!email.includes("@")) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-white font-semibold tracking-tight">Sktch.ai</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue to your workspace</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all pr-11"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2 relative overflow-hidden group"
          >
            <span className={loading ? "opacity-0" : "opacity-100"}>Sign in</span>
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          No account?{" "}
          <button className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Create one free</button>
        </p>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Social Login',
    category: 'auth',
    description: 'OAuth login with Google and GitHub plus elegant email fallback.',
    tags: ['login', 'oauth', 'social', 'google', 'github'],
    order: 2,
    code: `import { useState } from "react";
export default function SocialLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(null);

  const handleSocial = (provider) => { setLoading(provider); setTimeout(() => setLoading(null), 1500); };
  const handleSubmit = (e) => { e.preventDefault(); setLoading("email"); setTimeout(() => setLoading(null), 1500); };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex w-1/2 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/40 via-transparent to-transparent" />
        <div className="relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Build faster.</h2>
          <p className="text-slate-400 max-w-xs leading-relaxed">Transform wireframes into production-ready React components instantly.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Choose your preferred method to continue</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocial("google")}
              disabled={loading === "google"}
              className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09a7.2 7.2 0 010-4.18V7.07H2.18A11.97 11.97 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading === "google" ? "Connecting..." : "Continue with Google"}
            </button>
            <button
              onClick={() => handleSocial("github")}
              disabled={loading === "github"}
              className="w-full flex items-center justify-center gap-3 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              {loading === "github" ? "Connecting..." : "Continue with GitHub"}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            <button type="submit" disabled={loading === "email"}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 text-sm">
              {loading === "email" ? "Signing in..." : "Sign in with email"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New here? <button className="text-violet-600 font-semibold hover:text-violet-500">Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Sign Up Form',
    category: 'auth',
    description: 'Multi-step registration with password strength indicator and real-time validation.',
    tags: ['signup', 'register', 'form', 'validation', 'password-strength'],
    order: 3,
    code: `import { useState } from "react";

function PasswordStrength({ password }) {
  const pwd = password == null ? "" : String(password);
  const checks = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];
  return pwd ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={\`h-1 flex-1 rounded-full transition-all duration-300 \${i <= strength ? colors[strength] : "bg-slate-200"}\`} />
        ))}
      </div>
      <p className={\`text-xs font-medium \${strength < 2 ? "text-red-400" : strength < 4 ? "text-amber-500" : "text-emerald-600"}\`}>{labels[strength]}</p>
    </div>
  ) : null;
}

export default function SignUpForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    if (!agreed) e.agreed = "You must accept the terms";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1500);
  };

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: "" }));
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're in!</h2>
        <p className="text-slate-500 text-sm mb-6">Check your email to verify your account.</p>
        <button onClick={() => setSuccess(false)} className="text-sm text-violet-600 font-medium">← Back to sign in</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-slate-900">Sktch.ai</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start building for free — no credit card required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Full name", type: "text", placeholder: "Alex Rivera" },
            { key: "email", label: "Work email", type: "email", placeholder: "alex@company.com" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                className={\`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all \${errors[key] ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"}\`} />
              {errors[key] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors[key]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="Create a strong password"
              className={\`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all \${errors.password ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"}\`} />
            <PasswordStrength password={form.password} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
            <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password"
              className={\`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all \${errors.confirm ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"}\`} />
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <div onClick={() => setAgreed(!agreed)} className={\`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all \${agreed ? "bg-violet-600 border-violet-600" : "border-slate-300"}\`}>
              {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm text-slate-600">I agree to the <button type="button" className="text-violet-600 hover:underline">Terms of Service</button> and <button type="button" className="text-violet-600 hover:underline">Privacy Policy</button></span>
          </label>
          {errors.agreed && <p className="text-xs text-red-500">{errors.agreed}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 text-sm mt-2">
            {loading ? "Creating your account..." : "Create account →"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <button className="text-violet-600 font-semibold hover:text-violet-500">Sign in</button>
        </p>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'OTP Verification',
    category: 'auth',
    description: 'Six-digit OTP input with auto-advance, paste support, and countdown resend.',
    tags: ['otp', 'verification', 'two-factor', '2fa'],
    order: 4,
    code: `import { useState, useRef, useEffect } from "react";
export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setError(false);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === "123456") setVerified(true);
      else { setError(true); setOtp(["","","","","",""]); inputs.current[0]?.focus(); }
    }, 1000);
  };

  if (verified) return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Verified!</h3>
        <p className="text-sm text-slate-500">Your identity has been confirmed.</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Check your inbox</h2>
        <p className="text-sm text-slate-500 mb-8">We sent a 6-digit code to <span className="font-medium text-slate-700">you@example.com</span></p>

        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={\`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all \${error ? "border-red-300 bg-red-50 text-red-600" : digit ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-900 focus:border-violet-400"}\`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">Incorrect code. Please try again. <span className="text-slate-400">(Hint: 123456)</span></p>}

        <button
          onClick={handleSubmit}
          disabled={otp.join("").length < 6 || loading}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40 text-sm mb-4"
        >
          {loading ? "Verifying..." : "Verify code"}
        </button>

        <p className="text-sm text-slate-500">
          {countdown > 0
            ? <span>Resend code in <span className="font-medium text-slate-700">{countdown}s</span></span>
            : <button onClick={() => setCountdown(30)} className="text-violet-600 font-medium hover:text-violet-500">Resend code</button>}
        </p>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Glassmorphic Login',
    category: 'auth',
    description: 'High-end authentication card with backdrop blur, glowing inputs on focus, and modern typography.',
    tags: ['auth', 'login', 'glass', 'modern'],
    order: 5,
    code: `import { useState } from "react";

export default function GlassLogin() {
  const [focused, setFocused] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-extrabold text-xl tracking-tighter">SK</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Enter your credentials to access your workspace.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
            <div className={\`relative transition-all duration-300 rounded-xl \${focused === 'email' ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.5)]' : ''}\`}>
              <input
                type="email"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="developer@example.com"
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl px-4 py-3.5 outline-none placeholder:text-zinc-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot?</button>
            </div>
            <div className={\`relative transition-all duration-300 rounded-xl \${focused === 'password' ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.5)]' : ''}\`}>
              <input
                type="password"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl px-4 py-3.5 outline-none placeholder:text-zinc-600 transition-colors"
              />
            </div>
          </div>

          <button className="w-full py-3.5 mt-2 bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]">
            Sign In
          </button>
        </form>

        <div className="mt-8 relative flex items-center justify-center">
          <div className="absolute w-full border-t border-white/10" />
          <span className="bg-zinc-900/50 px-4 text-xs text-zinc-500 relative backdrop-blur-sm">Or continue with</span>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </button>
          <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a7.2 7.2 0 010-4.18V7.07H2.18A11.97 11.97 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // NAVBAR
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Floating Navbar',
    category: 'navbar',
    description: 'Glassmorphism floating navbar with scroll-aware backdrop blur.',
    tags: ['navbar', 'header', 'glass', 'sticky'],
    order: 1,
    code: `import { useState, useEffect } from "react";
export default function FloatingNavbar() {
  const [active, setActive] = useState("Product");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ["Product", "Features", "Pricing", "Docs", "Blog"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="sticky top-0 z-50 flex justify-center px-4 pt-4">
        <nav className={\`w-full max-w-5xl transition-all duration-300 \${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border border-white/60" : "bg-white border border-slate-200"} rounded-2xl\`}>
          <div className="flex items-center justify-between px-5 h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-bold text-slate-900 text-sm">Sktch.ai</span>
            </div>

            <div className="hidden md:flex items-center gap-0.5">
              {links.map((l) => (
                <button key={l} onClick={() => setActive(l)}
                  className={\`px-3.5 py-2 rounded-lg text-sm font-medium transition-all \${active === l ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}\`}>{l}</button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors">Log in</button>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all">Get started</button>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-slate-100">
              <span className={\`w-5 h-0.5 bg-slate-600 rounded-full transition-all \${mobileOpen ? "rotate-45 translate-y-2" : ""}\`} />
              <span className={\`w-5 h-0.5 bg-slate-600 rounded-full transition-all \${mobileOpen ? "opacity-0" : ""}\`} />
              <span className={\`w-5 h-0.5 bg-slate-600 rounded-full transition-all \${mobileOpen ? "-rotate-45 -translate-y-2" : ""}\`} />
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-slate-100 p-3 space-y-1">
              {links.map(l => (
                <button key={l} onClick={() => { setActive(l); setMobileOpen(false); }}
                  className={\`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium \${active === l ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"}\`}>{l}</button>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <button className="w-full py-2.5 text-center text-sm font-medium text-slate-600 border border-slate-200 rounded-xl">Log in</button>
                <button className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-xl">Get started</button>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Scroll to see blur effect ↑</div>
    </div>
  );
}`,
  },
  {
    title: 'Dark Sidebar Nav',
    category: 'navbar',
    description: 'Collapsible dark sidebar with icons, nested items, and badge notifications.',
    tags: ['sidebar', 'nav', 'dark', 'dashboard', 'collapse'],
    order: 2,
    code: `import { useState } from "react";
const nav = [
  { icon: "▣", label: "Overview", badge: null },
  { icon: "📈", label: "Analytics", badge: "New" },
  { icon: "👥", label: "Customers", badge: "12" },
  { icon: "📦", label: "Projects", badge: null },
  { icon: "💬", label: "Messages", badge: "3" },
  { icon: "⚙", label: "Settings", badge: null },
];
export default function DarkSidebarNav() {
  const [active, setActive] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-[480px] overflow-hidden rounded-2xl border border-slate-800">
      <aside className={\`\${collapsed ? "w-16" : "w-56"} bg-slate-950 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0\`}>
        <div className={\`flex items-center h-14 border-b border-slate-800 \${collapsed ? "justify-center px-2" : "px-4 gap-2.5"}\`}>
          {!collapsed && (
            <>
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-bold text-white text-sm truncate">Sktch.ai</span>
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={\`\${collapsed ? "" : "ml-auto"} w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0\`}
          >
            <svg className={\`w-4 h-4 transition-transform \${collapsed ? "rotate-180" : ""}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={\`w-full flex items-center rounded-xl transition-all duration-150 \${collapsed ? "justify-center h-10" : "gap-3 px-3 py-2.5"} \${active === item.label ? "bg-violet-600/20 text-violet-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}\`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded-full \${item.badge === "New" ? "bg-violet-500/20 text-violet-400" : "bg-slate-700 text-slate-300"}\`}>{item.badge}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className={\`border-t border-slate-800 p-3\`}>
          <div className={\`flex items-center rounded-xl \${collapsed ? "justify-center" : "gap-3 px-2 py-2"}\`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JD</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Jane Doe</p>
                <p className="text-[10px] text-slate-500 truncate">jane@acme.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-900 p-6 overflow-y-auto">
        <h1 className="text-lg font-bold text-white mb-1">{active}</h1>
        <p className="text-slate-400 text-sm">Select a navigation item to explore.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl border border-slate-700" />)}
        </div>
      </main>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // HERO
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Spotlight AI Hero',
    category: 'hero',
    description: 'A premium dark-mode hero section with radial gradient spotlights, floating badges, and high-contrast glowing CTAs.',
    tags: ['hero', 'dark', 'glow', 'landing'],
    order: 1,
    code: `export default function SpotlightHero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-zinc-950 overflow-hidden px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Introducing SKTCH.AI v2.0</span>
          <svg className="w-3 h-3 text-zinc-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8">
          Wireframes to Code. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
            In Seconds.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          The ultimate AI-powered design engine. Upload your sketches and watch them transform into production-ready React, Tailwind, and MERN stack components instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95">
            Start Generating Free
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-medium rounded-2xl transition-all hover:bg-zinc-800">
            View Components
          </button>
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Gradient Hero',
    category: 'hero',
    description: 'Full-screen hero with animated gradient mesh, badge, and dual CTAs.',
    tags: ['hero', 'landing', 'gradient', 'animated'],
    order: 2,
    code: `export default function GradientHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-semibold text-violet-400 mb-8">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Now in public beta — Join 10,000+ builders
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
          Sketch to code
          <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            in seconds
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Draw a wireframe, upload a sketch, or describe your idea. Get production-ready React + Tailwind components instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-violet-900/50 text-sm">
            Start building for free →
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/10 text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            Watch demo
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 text-slate-500 text-xs">
          {["No credit card", "Free forever plan", "Deploy in minutes"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Split Hero',
    category: 'hero',
    description: 'Asymmetric split hero with content, social proof, and animated UI preview.',
    tags: ['hero', 'split', 'landing', 'social-proof'],
    order: 3,
    code: `import { useState, useEffect } from "react";
export default function SplitHero() {
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveTab(p => (p + 1) % 3), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {["from-pink-400 to-rose-400","from-violet-400 to-purple-400","from-cyan-400 to-blue-400","from-amber-400 to-orange-400"].map((g, i) => (
                <div key={i} className={\`w-7 h-7 rounded-full bg-gradient-to-br \${g} border-2 border-white\`} />
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">Trusted by <strong>12,400+</strong> developers</span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
            Design once,
            <br />
            <span className="text-violet-600">ship everywhere</span>
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
            Sktch.ai turns rough wireframes into pixel-perfect React components. No more handoff friction — sketch it, generate it, ship it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <button className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 text-sm">
              Start for free
            </button>
            <button className="px-6 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl transition-all text-sm">
              View examples →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100">
            {[["10x", "Faster ship time"], ["99%", "Satisfaction rate"], ["200+", "Components"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-slate-900">{v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="bg-slate-950 rounded-3xl p-1 shadow-2xl shadow-slate-900/30">
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-4 bg-slate-800 rounded-full h-5 flex items-center px-3">
                  <span className="text-[10px] text-slate-500">sktch.ai/app</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  {["Generate", "Preview", "Export"].map((t, i) => (
                    <button key={t} onClick={() => setActiveTab(i)} className={\`px-3 py-1.5 rounded-lg text-xs font-medium transition-all \${activeTab === i ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-300"}\`}>{t}</button>
                  ))}
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className={\`h-3 bg-slate-800 rounded-full transition-all \${i === 0 ? "w-3/4" : i === 1 ? "w-full" : "w-1/2"}\`} />)}
                </div>
                <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-xs text-violet-400 font-medium">Generating component...</span>
                  </div>
                  {[...Array(4)].map((_, i) => <div key={i} className={\`h-2 bg-slate-700 rounded-full mt-2 \${i === 3 ? "w-1/3" : "w-full"}\`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // FEATURES
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Bento Feature Grid',
    category: 'features',
    description: 'Modern asymmetric bento grid layout with glassmorphic cards and subtle hover scaling, perfect for showcasing product capabilities.',
    tags: ['features', 'bento', 'grid', 'modern'],
    order: 1,
    code: `export default function BentoGrid() {
  return (
    <div className="py-24 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Powerful features, <span className="text-zinc-500">beautifully designed.</span></h2>
          <p className="text-zinc-400 text-lg">Everything you need to ship faster without compromising on code quality.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500" />
            <h3 className="text-2xl font-bold text-white mb-2">Neural DOM Recognition</h3>
            <p className="text-zinc-400 max-w-sm relative z-10">Our AI understands structure, spacing, and hierarchy directly from low-fidelity wireframes.</p>
            <div className="absolute bottom-[-20px] right-[-20px] w-[300px] h-[180px] bg-zinc-900 border border-zinc-800 rounded-tl-2xl flex flex-col gap-3 p-4 shadow-2xl transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
              <div className="h-6 w-1/3 bg-zinc-800 rounded-md" />
              <div className="h-24 w-full bg-zinc-800/50 rounded-md border border-zinc-700/50 border-dashed flex items-center justify-center"><span className="text-indigo-400 text-xs font-mono">{'<Component />'}</span></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Clean React Output</h3>
              <p className="text-zinc-400 text-sm">Exports standard JSX and functional components instantly.</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Full MERN Ready</h3>
              <p className="text-zinc-400 text-sm">Integrates smoothly with your existing MongoDB and Node backend setups.</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 group hover:border-zinc-700 transition-colors relative overflow-hidden flex items-center justify-between">
            <div className="max-w-md relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Algorithm & System Design Optimization</h3>
              <p className="text-zinc-400 text-sm">Generates UI code that respects standard Data Structures and modern system design principles, written in C++ or Java-like structural strictness if requested.</p>
            </div>
            <div className="hidden sm:flex space-x-2 absolute right-8">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 animate-pulse delay-75" />
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 animate-pulse delay-150" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Feature Comparison',
    category: 'features',
    description: 'Side-by-side before/after comparison with toggle animation.',
    tags: ['features', 'comparison', 'before-after'],
    order: 2,
    code: `import { useState } from "react";
const features = [
  { label: "Setup time", before: "2+ hours", after: "< 2 minutes", icon: "⏱" },
  { label: "Code quality", before: "Inconsistent", after: "Production-ready", icon: "✨" },
  { label: "Iterations", before: "Slow & painful", after: "Instant", icon: "🔁" },
  { label: "Team handoff", before: "Lots of friction", after: "Zero friction", icon: "🤝" },
  { label: "Customization", before: "Limited", after: "Fully yours", icon: "🎨" },
];
export default function FeatureComparison() {
  const [showAfter, setShowAfter] = useState(false);
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-3">Before vs. After</h2>
        <p className="text-slate-500 mb-6">See how Sktch.ai changes the way you build UIs.</p>
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setShowAfter(false)} className={\`px-5 py-2 rounded-lg text-sm font-semibold transition-all \${!showAfter ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}\`}>Without Sktch.ai</button>
          <button onClick={() => setShowAfter(true)} className={\`px-5 py-2 rounded-lg text-sm font-semibold transition-all \${showAfter ? "bg-violet-600 shadow text-white" : "text-slate-500 hover:text-slate-700"}\`}>With Sktch.ai</button>
        </div>
      </div>
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={f.label} className={\`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 \${showAfter ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-200"}\`}>
            <span className="text-2xl">{f.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 mb-0.5">{f.label}</p>
              <p className={\`text-sm font-bold transition-colors \${showAfter ? "text-violet-700" : "text-slate-700"}\`}>
                {showAfter ? f.after : f.before}
              </p>
            </div>
            {showAfter && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // PRICING
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Pricing Cards',
    category: 'pricing',
    description: 'Modern pricing cards with monthly/annual toggle and feature comparison.',
    tags: ['pricing', 'plans', 'billing', 'saas'],
    order: 1,
    code: `import { useState } from "react";
const plans = [
  {
    name: "Starter", monthly: 0, annual: 0, desc: "Perfect for side projects",
    color: "slate",
    features: ["5 projects", "50 AI generations/mo", "Community support", "Public sharing"],
    missing: ["Team collaboration", "Priority AI queue", "Custom domains", "Analytics"],
    cta: "Get started free", popular: false,
  },
  {
    name: "Pro", monthly: 29, annual: 19, desc: "For serious builders",
    color: "violet",
    features: ["Unlimited projects", "500 AI generations/mo", "Priority AI queue", "Team collaboration", "Custom domains", "Priority support"],
    missing: ["Analytics dashboard", "SSO / SAML"],
    cta: "Start 14-day trial", popular: true,
  },
  {
    name: "Enterprise", monthly: 99, annual: 79, desc: "For teams at scale",
    color: "slate",
    features: ["Everything in Pro", "Unlimited generations", "Analytics dashboard", "SSO / SAML", "Dedicated support", "SLA guarantee", "Audit logs", "Custom integrations"],
    missing: [],
    cta: "Contact sales", popular: false,
  },
];
export default function PricingCards() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-slate-900 mb-3">Simple, honest pricing</h2>
          <p className="text-slate-500 text-lg mb-8">No hidden fees. Cancel anytime. Switch plans freely.</p>
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setAnnual(false)} className={\`px-5 py-2 rounded-lg text-sm font-semibold transition-all \${!annual ? "bg-white shadow text-slate-900" : "text-slate-500"}\`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={\`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 \${annual ? "bg-white shadow text-slate-900" : "text-slate-500"}\`}>
              Annual
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">-34%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.name} className={\`relative flex flex-col rounded-3xl border-2 p-8 transition-all \${p.popular ? "border-violet-500 shadow-2xl shadow-violet-100 scale-[1.02]" : "border-slate-200 hover:border-slate-300"}\`}>
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-full shadow-lg">
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{p.desc}</p>
              </div>
              <div className="mb-7">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900">\${annual ? p.annual : p.monthly}</span>
                  <span className="text-slate-400 text-sm mb-2">/mo</span>
                </div>
                {annual && p.monthly > 0 && <p className="text-xs text-emerald-600 font-medium mt-1">Billed annually · Save \${(p.monthly - p.annual) * 12}/yr</p>}
              </div>
              <button className={\`w-full py-3 rounded-2xl font-bold text-sm transition-all mb-7 \${p.popular ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-200" : "border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900"}\`}>{p.cta}</button>
              <ul className="space-y-2.5 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
                {p.missing.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-10">
          All plans include SSL, 99.9% uptime SLA, and GDPR compliance. Questions? <button className="text-violet-600 font-medium hover:underline">Chat with us</button>
        </p>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Glow Tier Pricing',
    category: 'pricing',
    description: 'Animated pricing cards. The popular tier features a continuous animated gradient border and a glowing backdrop.',
    tags: ['pricing', 'cards', 'glow', 'animated'],
    order: 2,
    code: `import { useState } from "react";

const plans = [
  { name: "Hobby", price: "Free", desc: "Perfect for testing ideas.", features: ["3 AI generations/day", "Basic React Output", "Community Support"] },
  { name: "Pro", price: "$29", desc: "For serious developers.", features: ["Unlimited generations", "Full MERN Stack Export", "Priority Support", "Custom Formatting"], popular: true },
  { name: "Team", price: "$99", desc: "For collaborative teams.", features: ["Everything in Pro", "Shared Workspaces", "SSO Authentication", "API Access"] },
];

export default function GlowPricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="py-24 px-4 bg-zinc-950 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">Simple, scalable pricing</h2>

          <div className="flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 p-1 rounded-full inline-flex">
            <button onClick={() => setAnnual(false)} className={\`px-6 py-2 rounded-full text-sm font-medium transition-all \${!annual ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"}\`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={\`px-6 py-2 rounded-full text-sm font-medium transition-all \${annual ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"}\`}>Annually <span className="ml-1 text-xs text-indigo-500 font-bold">-20%</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {plans.map((p) => (
            <div key={p.name} className={\`relative rounded-3xl p-8 flex flex-col \${p.popular ? "bg-zinc-900 border-none" : "bg-zinc-900/40 border border-zinc-800"}\`}>
              {p.popular && (
                <div className="absolute inset-0 rounded-3xl border border-transparent [background:linear-gradient(45deg,rgba(99,102,241,1),rgba(168,85,247,1))_border-box] [mask-composite:exclude] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]" />
              )}
              {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">Most Popular</div>}

              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-medium text-white mb-2">{p.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 h-10">{p.desc}</p>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">{p.price}</span>
                  {p.price !== "Free" && <span className="text-zinc-500 text-lg">/mo</span>}
                </div>

                <ul className="space-y-4 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button className={\`relative z-10 w-full py-4 rounded-xl text-sm font-bold transition-all \${p.popular ? "bg-white text-zinc-950 hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"}\`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Animated Stats',
    category: 'stats',
    description: 'Dashboard metric cards with animated counters, sparklines, and trend indicators.',
    tags: ['stats', 'metrics', 'dashboard', 'animated', 'charts'],
    order: 1,
    code: `import { useState, useEffect } from "react";
const stats = [
  { label: "Total Revenue", value: 124850, format: "$", suffix: "", trend: 12.5, sparkline: [40,55,45,70,65,80,75,90,85,100] },
  { label: "Active Users", value: 8432, format: "", suffix: "", trend: 8.2, sparkline: [30,45,40,60,55,70,80,75,85,95] },
  { label: "Avg. Session", value: 4.2, format: "", suffix: "m", trend: 5.1, sparkline: [50,60,55,65,70,60,75,80,70,85] },
  { label: "Bounce Rate", value: 24.8, format: "", suffix: "%", trend: -3.4, sparkline: [70,65,60,55,60,50,45,40,45,35] },
];
function useCounter(target, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = 0; const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setV(target); clearInterval(t); }
      else setV(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return v;
}
function Sparkline({ data, positive }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const points = data.map((v, i) => \`\${(i / (data.length - 1)) * 100},\${100 - ((v - min) / (max - min)) * 80 + 10}\`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-10" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={positive ? "#10b981" : "#ef4444"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StatCard({ label, value, format, suffix, trend, sparkline }) {
  const count = useCounter(value);
  const pos = trend > 0;
  const display = value % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toLocaleString();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={\`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 \${pos ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}\`}>
          {pos ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-4">{format}{display}{suffix}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">vs. last month</p>
        <Sparkline data={sparkline} positive={pos} />
      </div>
    </div>
  );
}
export default function AnimatedStats() {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // CARDS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Product Card',
    category: 'cards',
    description: 'Premium e-commerce product card with quick-add, color swatches, and hover reveal.',
    tags: ['card', 'product', 'ecommerce', 'hover'],
    order: 1,
    code: `import { useState } from "react";
const colors = ["#1e1b4b", "#4c1d95", "#be185d", "#064e3b"];
const sizes = ["XS", "S", "M", "L", "XL"];
export default function ProductCard() {
  const [liked, setLiked] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState(2);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handleAdd = () => { setAdded(true); setTimeout(() => setAdded(false), 2000); };
  return (
    <div className="w-72 mx-auto" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/80 border border-slate-100">
        <div className="relative aspect-[4/5] bg-gradient-to-br from-slate-100 to-violet-50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl select-none">👟</span>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110"
          >
            <svg className={\`w-4 h-4 transition-colors \${liked ? "text-red-500 fill-red-500" : "text-slate-400"}\`} fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <span className="absolute top-4 left-4 text-[11px] font-bold px-2.5 py-1 bg-slate-900 text-white rounded-full">New Season</span>

          <div className={\`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 transition-all duration-300 \${hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}\`}>
            <p className="text-xs font-semibold text-slate-500 mb-2">Size</p>
            <div className="flex gap-1.5">
              {sizes.map(s => (
                <button key={s} onClick={() => setActiveSize(sizes.indexOf(s))}
                  className={\`w-8 h-8 rounded-lg text-xs font-bold border transition-all \${activeSize === sizes.indexOf(s) ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-400"}\`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Running Gear</p>
              <h3 className="font-bold text-slate-900">Ultra Boost Pro X</h3>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">$149</p>
              <p className="text-xs text-slate-400 line-through">$199</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {colors.map((c, i) => (
                <button key={i} onClick={() => setActiveColor(i)}
                  style={{ backgroundColor: c }}
                  className={\`w-5 h-5 rounded-full transition-all \${activeColor === i ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : ""}\`}
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5 ml-auto">
              {[...Array(5)].map((_, i) => <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              <span className="text-xs text-slate-400 ml-1">(128)</span>
            </div>
          </div>

          <button onClick={handleAdd}
            className={\`w-full py-3 rounded-2xl font-bold text-sm transition-all \${added ? "bg-emerald-500 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}\`}>
            {added ? "✓ Added to bag" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'Blog Post Card',
    category: 'cards',
    description: 'Rich blog card with category, read time, author, and hover animation.',
    tags: ['card', 'blog', 'article', 'content'],
    order: 2,
    code: `const posts = [
  {
    category: "Engineering", categoryColor: "bg-violet-100 text-violet-700",
    title: "How we built real-time collaboration in Sktch.ai",
    excerpt: "A deep dive into our WebSocket architecture, CRDT implementation, and the tradeoffs we made to support 10,000 concurrent users.",
    author: "Sarah Chen", authorGrad: "from-violet-400 to-fuchsia-400",
    readTime: "8 min read", date: "Mar 12, 2026",
    gradient: "from-violet-50 to-fuchsia-50",
  },
  {
    category: "Product", categoryColor: "bg-emerald-100 text-emerald-700",
    title: "Introducing the new component library with 200+ elements",
    excerpt: "We've spent the last 6 months rebuilding our component library from the ground up. Here's what's new and why we made the decisions we did.",
    author: "Marcus Lee", authorGrad: "from-emerald-400 to-teal-400",
    readTime: "5 min read", date: "Mar 8, 2026",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    category: "Design", categoryColor: "bg-amber-100 text-amber-700",
    title: "Design tokens and why they'll change how you build UIs",
    excerpt: "Design tokens are more than just variables. Learn how to use them to create scalable, maintainable design systems that teams actually love.",
    author: "Emily Park", authorGrad: "from-amber-400 to-orange-400",
    readTime: "6 min read", date: "Mar 4, 2026",
    gradient: "from-amber-50 to-orange-50",
  },
];
export default function BlogPostCards() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-8">From the blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((p) => (
            <article key={p.title} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className={\`h-44 bg-gradient-to-br \${p.gradient} flex items-center justify-center p-6\`}>
                <span className={\`text-xs font-bold px-3 py-1.5 rounded-full \${p.categoryColor}\`}>{p.category}</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-violet-700 transition-colors">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={\`w-7 h-7 rounded-full bg-gradient-to-br \${p.authorGrad} flex items-center justify-center text-white text-xs font-bold\`}>
                      {p.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{p.author}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{p.readTime}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    title: 'User Profile Card',
    category: 'profiles',
    description: 'Social profile card with cover photo, stats, skills, and connect action.',
    tags: ['profile', 'user', 'social', 'card', 'follow'],
    order: 1,
    code: `import { useState } from "react";
const skills = ["React", "TypeScript", "Node.js", "Figma", "TailwindCSS"];
export default function UserProfileCard() {
  const [following, setFollowing] = useState(false);
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 relative">
          <button className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-lg font-black">SC</div>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Available</span>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900">Sarah Chen</h3>
          <p className="text-sm text-slate-500 mb-1">Senior Product Designer at Vercel</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            San Francisco, CA
          </p>

          <div className="flex items-center gap-6 mb-5 py-4 border-y border-slate-100">
            {[["2.4k", "Followers"], ["892", "Following"], ["248", "Posts"]].map(([v, l]) => (
              <div key={l} className="text-center flex-1">
                <p className="text-base font-black text-slate-900">{v}</p>
                <p className="text-xs text-slate-400">{l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {skills.map(s => (
              <span key={s} className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">{s}</span>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFollowing(!following)}
              className={\`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all \${following ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600" : "bg-violet-600 hover:bg-violet-500 text-white"}\`}>
              {following ? "Following ✓" : "Follow"}
            </button>
            <button className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // FORMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Contact Form',
    category: 'forms',
    description: 'Polished contact form with floating labels, validation, and animated success state.',
    tags: ['form', 'contact', 'validation', 'animated'],
    order: 1,
    code: `import { useState } from "react";
const topics = ["General inquiry", "Sales & pricing", "Technical support", "Partnership", "Press & media"];
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: "" })); };
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.topic) e.topic = "Please select a topic";
    if (form.message.length < 10) e.message = "Message too short";
    return e;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1600);
  };
  if (sent) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Message received!</h3>
        <p className="text-slate-500 text-sm max-w-xs">We'll get back to you within 24 hours. Check your inbox for a confirmation.</p>
        <button onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "", message: "" }); }} className="mt-6 text-sm text-violet-600 font-medium hover:text-violet-500">Send another message →</button>
      </div>
    </div>
  );
  const inputClass = (k) => \`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all \${errors[k] ? "border-red-300 bg-red-50/50 focus:ring-red-100" : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"}\`;
  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-1">Get in touch</h2>
        <p className="text-slate-500 text-sm">We typically respond within a few hours.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Alex Rivera" className={inputClass("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="alex@company.com" className={inputClass("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Topic</label>
          <select value={form.topic} onChange={set("topic")} className={inputClass("topic")}>
            <option value="">Select a topic...</option>
            {topics.map(t => <option key={t}>{t}</option>)}
          </select>
          {errors.topic && <p className="text-xs text-red-500 mt-1">{errors.topic}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Message</label>
            <span className={\`text-xs \${form.message.length > 500 ? "text-red-500" : "text-slate-400"}\`}>{form.message.length}/500</span>
          </div>
          <textarea value={form.message} onChange={set("message")} placeholder="Tell us what's on your mind..." rows={5}
            maxLength={500} className={\`\${inputClass("message")} resize-none\`} />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all disabled:opacity-60 text-sm">
          {loading ? "Sending your message..." : "Send message →"}
        </button>
      </form>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // TABLES
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Data Table',
    category: 'tables',
    description: 'Advanced data table with sort, search, pagination, and row actions.',
    tags: ['table', 'data', 'sort', 'search', 'pagination'],
    order: 1,
    code: `import { useState, useMemo } from "react";
const allData = [
  { id: 1, name: "Alice Johnson", email: "alice@acme.com", role: "Admin", status: "Active", joined: "Jan 12, 2024" },
  { id: 2, name: "Bob Smith", email: "bob@acme.com", role: "Developer", status: "Active", joined: "Feb 3, 2024" },
  { id: 3, name: "Carol White", email: "carol@acme.com", role: "Designer", status: "Inactive", joined: "Mar 18, 2024" },
  { id: 4, name: "Dan Brown", email: "dan@acme.com", role: "Developer", status: "Active", joined: "Apr 7, 2024" },
  { id: 5, name: "Eve Davis", email: "eve@acme.com", role: "Admin", status: "Pending", joined: "May 22, 2024" },
  { id: 6, name: "Frank Miller", email: "frank@acme.com", role: "Designer", status: "Active", joined: "Jun 5, 2024" },
  { id: 7, name: "Grace Lee", email: "grace@acme.com", role: "Developer", status: "Active", joined: "Jul 14, 2024" },
  { id: 8, name: "Henry Wilson", email: "henry@acme.com", role: "Admin", status: "Inactive", joined: "Aug 30, 2024" },
];
const statusBadge = { Active: "bg-emerald-50 text-emerald-700 border border-emerald-200", Inactive: "bg-slate-100 text-slate-500 border border-slate-200", Pending: "bg-amber-50 text-amber-700 border border-amber-200" };
const PAGE_SIZE = 5;
export default function DataTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const toggleSort = (k) => { if (sortKey === k) setAsc(!asc); else { setSortKey(k); setAsc(true); } setPage(1); };
  const filtered = useMemo(() => allData.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())), [search]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => { const v = a[sortKey] > b[sortKey] ? 1 : -1; return asc ? v : -v; }), [filtered, sortKey, asc]);
  const total = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const toggleSelect = (id) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = paged.length > 0 && paged.every(r => selected.has(r.id));
  const toggleAll = () => { const n = new Set(selected); if (allSelected) paged.forEach(r => n.delete(r.id)); else paged.forEach(r => n.add(r.id)); setSelected(n); };
  const cols = ["name", "email", "role", "status", "joined"];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Team Members</h3>
          <p className="text-xs text-slate-400 mt-0.5">{allData.length} members total</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <button className="text-xs font-medium text-red-600 hover:text-red-500 px-3 py-2 bg-red-50 rounded-lg">Delete ({selected.size})</button>}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search members..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-52" />
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all">+ Invite</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-300 text-violet-600 focus:ring-violet-400" /></th>
              {cols.map(k => (
                <th key={k} onClick={() => toggleSort(k)} className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap">
                  <span className="capitalize">{k}</span>
                  {sortKey === k && <span className="ml-1 text-violet-500">{asc ? "↑" : "↓"}</span>}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(r => (
              <tr key={r.id} className={\`hover:bg-slate-50 transition-colors \${selected.has(r.id) ? "bg-violet-50/50" : ""}\`}>
                <td className="px-5 py-3.5"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-slate-300 text-violet-600 focus:ring-violet-400" /></td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-semibold text-slate-900">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-500">{r.email}</td>
                <td className="px-4 py-3.5 text-slate-600">{r.role}</td>
                <td className="px-4 py-3.5"><span className={\`text-xs font-semibold px-2.5 py-1 rounded-full \${statusBadge[r.status]}\`}>{r.status}</span></td>
                <td className="px-4 py-3.5 text-slate-400">{r.joined}</td>
                <td className="px-4 py-3.5 text-right">
                  <button className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, sorted.length)} of {sorted.length}</p>
        <div className="flex items-center gap-1">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-all">←</button>
          {[...Array(total)].map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={\`px-3 py-1.5 text-sm rounded-lg transition-all \${page===i+1 ? "bg-violet-600 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-700"}\`}>{i+1}</button>
          ))}
          <button disabled={page===total} onClick={() => setPage(p=>p+1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-all">→</button>
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // MODALS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Confirm Dialog',
    category: 'modals',
    description: 'Accessible confirm modal with destructive action and keyboard dismiss.',
    tags: ['modal', 'dialog', 'confirm', 'delete', 'accessible'],
    order: 1,
    code: `import { useState, useEffect } from "react";
export default function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setOpen(false); setDeleted(true); }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 gap-4">
      {deleted ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Project deleted successfully
          </div>
          <button onClick={() => setDeleted(false)} className="text-sm text-slate-500 hover:text-slate-700">Reset demo</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-200">
          Delete project
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Delete "Acme Dashboard"?</h3>
              <p className="text-sm text-slate-500 mb-7 leading-relaxed">This will permanently delete the project and all its components. This action cannot be undone.</p>
              <div className="w-full space-y-2">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-2xl text-sm font-bold transition-all"
                >
                  {loading ? "Deleting..." : "Yes, delete project"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-sm font-semibold text-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
  },
  {
    title: 'Command Palette',
    category: 'modals',
    description: 'Keyboard-driven command palette with search, categories, and keyboard shortcuts.',
    tags: ['command', 'search', 'modal', 'keyboard', 'palette'],
    order: 2,
    code: `import { useState, useEffect, useRef } from "react";
const commands = [
  { category: "Navigation", items: [
    { icon: "🏠", label: "Go to Dashboard", shortcut: "G D" },
    { icon: "📦", label: "View Projects", shortcut: "G P" },
    { icon: "⚙️", label: "Open Settings", shortcut: "G S" },
  ]},
  { category: "Actions", items: [
    { icon: "✏️", label: "New Project", shortcut: "⌘ N" },
    { icon: "📤", label: "Export Component", shortcut: "⌘ E" },
    { icon: "🔗", label: "Copy Share Link", shortcut: "⌘ ⇧ C" },
  ]},
  { category: "Theme", items: [
    { icon: "🌙", label: "Toggle Dark Mode", shortcut: "⌘ ⇧ D" },
    { icon: "🎨", label: "Change Accent Color", shortcut: null },
  ]},
];
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); setQuery(""); setHighlighted(0); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 10); }, [open]);
  const filtered = commands.map(c => ({ ...c, items: c.items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())) })).filter(c => c.items.length);
  const allItems = filtered.flatMap(c => c.items);
  return (
    <div className="flex items-center justify-center p-8">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all text-sm text-slate-500"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Search commands...
        <span className="ml-auto flex items-center gap-1 text-xs bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-400">⌘K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                ref={inputRef}
                value={query} onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
                placeholder="Search commands..."
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">ESC</span>
            </div>

            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No commands found</p>
              ) : (
                filtered.map((cat, ci) => (
                  <div key={cat.category}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 py-2">{cat.category}</p>
                    {cat.items.map((item, ii) => {
                      const idx = allItems.indexOf(item);
                      return (
                        <button
                          key={item.label}
                          onMouseEnter={() => setHighlighted(idx)}
                          onClick={() => setOpen(false)}
                          className={\`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors \${highlighted === idx ? "bg-violet-50 text-violet-700" : "hover:bg-slate-50 text-slate-700"}\`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {item.shortcut && <kbd className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{item.shortcut}</kbd>}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // TESTIMONIALS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Testimonial Carousel',
    category: 'testimonials',
    description: 'Auto-playing testimonial carousel with avatar, company logo, and rating.',
    tags: ['testimonials', 'carousel', 'social-proof', 'reviews'],
    order: 1,
    code: `import { useState, useEffect } from "react";
const testimonials = [
  { name: "Sarah Chen", role: "CTO at Stripe", initials: "SC", grad: "from-violet-500 to-fuchsia-500", rating: 5,
    text: "We shipped our entire design system in 2 weeks using Sktch.ai. What used to take us months of handoff time now takes days. It's transformed how our design and engineering teams collaborate." },
  { name: "Marcus Johnson", role: "Lead Designer at Figma", initials: "MJ", grad: "from-blue-500 to-cyan-500", rating: 5,
    text: "The component quality is genuinely outstanding. Every generated component follows accessibility best practices and looks like it was written by a senior engineer. I recommend it to everyone on my team." },
  { name: "Emily Park", role: "Founder at Linear", initials: "EP", grad: "from-emerald-500 to-teal-500", rating: 5,
    text: "I've evaluated every AI UI tool on the market. Sktch.ai is the only one we actually stuck with long-term. The iteration speed and code quality are unmatched." },
  { name: "David Kim", role: "VP Engineering at Notion", initials: "DK", grad: "from-amber-500 to-orange-500", rating: 5,
    text: "Our prototyping velocity increased by 10x overnight. What I love most is that the generated code is clean enough to ship directly — no cleanup needed." },
];
export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);
  const t = testimonials[active];
  return (
    <div className="py-20 px-4 bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Loved by teams worldwide</p>
        <div className="flex justify-center gap-0.5 mb-10">
          {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
        </div>
        <blockquote className="text-2xl font-medium text-white leading-relaxed mb-10 transition-all duration-500">
          "{t.text}"
        </blockquote>
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className={\`w-12 h-12 rounded-2xl bg-gradient-to-br \${t.grad} flex items-center justify-center text-white font-bold\`}>{t.initials}</div>
          <div className="text-left">
            <p className="font-bold text-white">{t.name}</p>
            <p className="text-sm text-slate-400">{t.role}</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={\`h-1.5 rounded-full transition-all duration-300 \${i === active ? "bg-violet-500 w-8" : "bg-slate-700 w-4 hover:bg-slate-600"}\`} />
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // FAQ
  // ═══════════════════════════════════════════════════════════
  {
    title: 'FAQ Accordion',
    category: 'faq',
    description: 'Smooth FAQ accordion with numbered indicators and animated chevrons.',
    tags: ['faq', 'accordion', 'questions', 'animated'],
    order: 1,
    code: `import { useState } from "react";
const faqs = [
  { q: "How does the AI generation work?", a: "Sktch.ai uses advanced vision and language models. You upload a sketch or wireframe (or describe your UI in text), and the AI analyzes it to produce semantically correct, accessible React + Tailwind code in seconds." },
  { q: "Is there a free plan?", a: "Yes! Our Starter plan is permanently free and includes 50 AI generations per month, 5 projects, and community support. No credit card required." },
  { q: "What frameworks are supported?", a: "Currently we generate React + Tailwind CSS components. Vue, Svelte, and Angular support is on the roadmap for Q2 2026." },
  { q: "Can I use the generated code in production?", a: "Absolutely. The generated code is production-ready, clean, and follows best practices including accessibility (ARIA labels, keyboard navigation, contrast). You own 100% of it." },
  { q: "Do you offer team plans?", a: "Yes, our Pro plan supports unlimited team members with role-based access, shared project libraries, and real-time collaboration features." },
  { q: "What is your data privacy policy?", a: "Your sketches and prompts are never used to train our models. All data is encrypted at rest and in transit. We are SOC 2 Type II certified and GDPR compliant." },
];
export default function FAQAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="py-16 px-4 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-2 block">FAQ</span>
        <h2 className="text-3xl font-black text-slate-900 mb-3">Frequently asked questions</h2>
        <p className="text-slate-500 text-sm">Everything you need to know. Can't find the answer? <button className="text-violet-600 font-medium hover:underline">Chat with us</button>.</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={\`border rounded-2xl overflow-hidden transition-all duration-200 \${open === i ? "border-violet-200 shadow-sm shadow-violet-50" : "border-slate-200"}\`}
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
            >
              <span className={\`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all \${open === i ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}\`}>
                {i + 1}
              </span>
              <span className={\`flex-1 text-sm font-semibold \${open === i ? "text-violet-700" : "text-slate-900"}\`}>{faq.q}</span>
              <svg
                className={\`w-5 h-5 flex-shrink-0 transition-all duration-300 \${open === i ? "rotate-180 text-violet-500" : "text-slate-400"}\`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-6 pb-5 pl-16">
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // CTA
  // ═══════════════════════════════════════════════════════════
  {
    title: 'CTA Banner',
    category: 'cta',
    description: 'Immersive gradient CTA with social proof numbers and email capture.',
    tags: ['cta', 'newsletter', 'signup', 'banner', 'gradient'],
    order: 1,
    code: `import { useState } from "react";
export default function CTABanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  return (
    <div className="relative overflow-hidden bg-slate-950 rounded-3xl p-10 sm:p-14">
      <div className="absolute top-0 left-0 w-72 h-72 bg-violet-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-fuchsia-700/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative text-center max-w-xl mx-auto">
        <div className="flex justify-center gap-6 mb-8">
          {[["14k+", "Developers"], ["2M+", "Components built"], ["99%", "Satisfaction"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-xl font-black text-white">{v}</p>
              <p className="text-xs text-slate-400">{l}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Build your next UI
          <span className="block text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text">10x faster</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">Join 14,000 developers shipping beautiful UIs in record time. Start free today.</p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            You're on the list! Check your inbox.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="flex-1 px-4 py-3.5 rounded-2xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <button
              onClick={() => email.includes("@") && setSubscribed(true)}
              className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm transition-all whitespace-nowrap shadow-lg shadow-violet-900/50"
            >
              Get early access
            </button>
          </div>
        )}
        <p className="text-xs text-slate-600 mt-3">No spam. No credit card. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Toast System',
    category: 'notifications',
    description: 'Full toast notification system with auto-dismiss, progress bar, and stacking.',
    tags: ['toast', 'notification', 'alert', 'system'],
    order: 1,
    code: `import { useState, useCallback } from "react";
const ICONS = {
  success: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  error: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  warning: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  info: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};
const STYLES = {
  success: { container: "bg-white border-l-4 border-emerald-500 shadow-lg", icon: "text-emerald-500 bg-emerald-50", title: "text-emerald-700", msg: "text-slate-600" },
  error: { container: "bg-white border-l-4 border-red-500 shadow-lg", icon: "text-red-500 bg-red-50", title: "text-red-700", msg: "text-slate-600" },
  warning: { container: "bg-white border-l-4 border-amber-500 shadow-lg", icon: "text-amber-600 bg-amber-50", title: "text-amber-700", msg: "text-slate-600" },
  info: { container: "bg-white border-l-4 border-violet-500 shadow-lg", icon: "text-violet-600 bg-violet-50", title: "text-violet-700", msg: "text-slate-600" },
};
const TRIGGERS = [
  { type: "success", title: "Changes saved", message: "Your project has been saved successfully." },
  { type: "error", title: "Upload failed", message: "Something went wrong. Please try again." },
  { type: "warning", title: "Trial expiring", message: "Your free trial ends in 3 days." },
  { type: "info", title: "Update available", message: "Version 2.4.0 is ready to install." },
];
export default function ToastSystem() {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  const show = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p.slice(-3), { id, type, title, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);
  return (
    <div className="relative min-h-64 flex flex-col items-center justify-center gap-3 p-6">
      <p className="text-sm text-slate-500 mb-2">Click to trigger toast notifications</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {TRIGGERS.map(t => (
          <button key={t.type} onClick={() => show(t.type, t.title, t.message)}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-all capitalize">
            {t.type}
          </button>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => {
          const s = STYLES[t.type];
          return (
            <div key={t.id} className={\`\${s.container} rounded-2xl p-4 flex items-start gap-3 animate-[slideIn_0.3s_ease]\`}>
              <div className={\`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 \${s.icon}\`}>{ICONS[t.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={\`text-sm font-bold \${s.title}\`}>{t.title}</p>
                <p className={\`text-xs mt-0.5 \${s.msg}\`}>{t.message}</p>
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Settings Panel',
    category: 'settings',
    description: 'Tabbed settings panel with profile, notifications, security, and billing sections.',
    tags: ['settings', 'tabs', 'profile', 'preferences', 'form'],
    order: 1,
    code: `import { useState } from "react";
function Toggle({ on, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!on)}
        className={\`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none \${on ? "bg-violet-600" : "bg-slate-200"}\`}
      >
        <div className={\`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 \${on ? "translate-x-6" : "translate-x-1"}\`} />
      </button>
    </div>
  );
}
const tabs = ["Profile", "Notifications", "Security", "Billing"];
export default function SettingsPanel() {
  const [tab, setTab] = useState("Profile");
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@acme.com");
  const [bio, setBio] = useState("Product designer building tools for developers.");
  const [notifs, setNotifs] = useState({ email: true, push: false, product: true, security: true, team: false });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={\`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 \${tab === t ? "border-violet-600 text-violet-700 bg-violet-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}\`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-7">
        {tab === "Profile" && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-black flex-shrink-0">JD</div>
              <div>
                <button className="text-sm font-semibold text-violet-600 hover:text-violet-500">Upload new photo</button>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or GIF · Max 5MB</p>
              </div>
            </div>
            {[["Full name", name, setName, "text"], ["Email address", email, setEmail, "email"]].map(([label, val, setVal, type]) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} value={val} onChange={e => setVal(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none" />
            </div>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="divide-y divide-slate-100">
            {[
              ["Email notifications", "Receive project updates via email", "email"],
              ["Push notifications", "Browser push alerts for activity", "push"],
              ["Product updates", "New features and announcements", "product"],
              ["Security alerts", "Login attempts and security events", "security"],
              ["Team activity", "When teammates comment or share", "team"],
            ].map(([label, desc, key]) => (
              <Toggle key={key} label={label} desc={desc} on={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
            ))}
          </div>
        )}

        {tab === "Security" && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <p className="text-sm font-medium text-emerald-800">Your account is secure. 2FA is enabled.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Current password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">New password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            </div>
          </div>
        )}

        {tab === "Billing" && (
          <div className="space-y-4">
            <div className="p-5 border-2 border-violet-200 bg-violet-50 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900">Pro Plan</h4>
                <span className="text-xs font-bold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full">Active</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">$29/month · Renews March 22, 2027</p>
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-violet-600 hover:text-violet-500">Manage plan</button>
                <span className="text-slate-300">·</span>
                <button className="text-xs font-semibold text-slate-500 hover:text-red-600">Cancel subscription</button>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-7 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-400">Expires 08/27</p>
              </div>
              <button className="text-xs text-slate-500 font-semibold hover:text-slate-700">Update</button>
            </div>
          </div>
        )}

        <div className="mt-7 pt-5 border-t border-slate-100">
          <button onClick={save}
            className={\`px-6 py-2.5 rounded-xl text-sm font-bold transition-all \${saved ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 hover:bg-violet-500 text-white"}\`}>
            {saved ? "✓ Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Multi-Column Footer',
    category: 'footer',
    description: 'Comprehensive dark footer with brand, nav columns, social links, and legal.',
    tags: ['footer', 'navigation', 'dark', 'social'],
    order: 1,
    code: `const columns = {
  Product: ["Features", "Changelog", "Roadmap", "Status", "Pricing"],
  Company: ["About", "Blog", "Careers", "Press kit", "Contact"],
  Resources: ["Documentation", "API Reference", "Component Library", "Community", "Support"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
};
const socials = [
  { name: "Twitter", path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
  { name: "GitHub", path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" },
  { name: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];
export default function MultiColumnFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-bold text-white text-lg">Sktch.ai</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">AI-powered UI builder. Sketch it, generate it, ship it. Turn ideas into production-ready React components.</p>
            <div className="flex items-center gap-3">
              {socials.map(s => (
                <button key={s.name} title={s.name}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-all group">
                  <svg className="w-4 h-4 fill-slate-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </button>
              ))}
            </div>
          </div>

          {Object.entries(columns).map(([col, items]) => (
            <div key={col}>
              <h4 className="text-white font-semibold text-sm mb-4">{col}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}><button className="text-sm hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2026 Sktch.ai Inc. All rights reserved. Built with 💜 in SF.</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Button System',
    category: 'buttons',
    description: 'Complete design-system button library with all variants, sizes, icons, and states.',
    tags: ['buttons', 'design-system', 'ui', 'variants'],
    order: 1,
    code: `import { useState } from "react";
const VARIANTS = {
  primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-200",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900",
  outline: "border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-900",
  ghost: "hover:bg-slate-100 text-slate-700",
  destructive: "bg-red-600 hover:bg-red-500 text-white",
  success: "bg-emerald-600 hover:bg-emerald-500 text-white",
  dark: "bg-slate-900 hover:bg-slate-800 text-white",
  link: "text-violet-600 hover:text-violet-500 underline-offset-4 hover:underline px-0",
};
const SIZES = {
  xs: "h-7 px-3 text-xs rounded-lg gap-1.5",
  sm: "h-8 px-4 text-xs rounded-xl gap-2",
  md: "h-10 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-7 text-base rounded-2xl gap-2.5",
  xl: "h-14 px-9 text-lg rounded-2xl gap-3",
};
function Button({ variant="primary", size="md", icon, iconRight, loading, disabled, pill, children, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={\`inline-flex items-center justify-center font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none \${VARIANTS[variant]} \${SIZES[size]} \${pill ? "!rounded-full" : ""} \${variant !== "link" ? "" : ""}\`}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="text-sm leading-none">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="text-sm leading-none">{iconRight}</span>}
    </button>
  );
}
export default function ButtonSystem() {
  const [loadingKey, setLoadingKey] = useState(null);
  const sim = (k) => { setLoadingKey(k); setTimeout(() => setLoadingKey(null), 2000); };
  return (
    <div className="p-8 space-y-10 max-w-3xl">
      <Section title="Variants">
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(VARIANTS).map(v => <Button key={v} variant={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</Button>)}
        </div>
      </Section>
      <Section title="Sizes">
        <div className="flex flex-wrap items-center gap-2.5">
          {Object.keys(SIZES).map(s => <Button key={s} size={s}>Size {s.toUpperCase()}</Button>)}
        </div>
      </Section>
      <Section title="With Icons">
        <div className="flex flex-wrap gap-2.5">
          <Button icon="⚡">Generate</Button>
          <Button icon="↑" variant="secondary">Upload</Button>
          <Button iconRight="→" variant="outline">View all</Button>
          <Button icon="🔔" variant="ghost">Notifications</Button>
          <Button icon="✕" variant="destructive" size="sm">Remove</Button>
        </div>
      </Section>
      <Section title="Pill Buttons">
        <div className="flex flex-wrap gap-2.5">
          <Button pill>Get started</Button>
          <Button pill variant="outline">Learn more</Button>
          <Button pill variant="secondary" icon="★">Upgrade</Button>
        </div>
      </Section>
      <Section title="States">
        <div className="flex flex-wrap gap-2.5">
          <Button loading={loadingKey==="a"} onClick={()=>sim("a")}>Click to load</Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>Also disabled</Button>
        </div>
      </Section>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Analytics Dashboard',
    category: 'dashboard',
    description: 'Full admin dashboard with sidebar, KPI cards, bar chart, and activity feed.',
    tags: ['dashboard', 'analytics', 'admin', 'chart', 'sidebar'],
    order: 1,
    code: `import { useState } from "react";
const navItems = [
  { icon: "◧", label: "Overview", id: "overview" },
  { icon: "📈", label: "Analytics", id: "analytics" },
  { icon: "🧩", label: "Components", id: "components", badge: "New" },
  { icon: "👥", label: "Team", id: "team" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];
const kpis = [
  { label: "Revenue", value: "$48,295", delta: "+12.5%", up: true },
  { label: "Generations", value: "12,841", delta: "+24.1%", up: true },
  { label: "Active Users", value: "3,247", delta: "+8.3%", up: true },
  { label: "Bounce Rate", value: "24.8%", delta: "-2.1%", up: false },
];
const barData = [35,52,44,68,59,78,71,88,62,95,80,100];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const activity = [
  { user: "SC", name: "Sarah C.", action: "generated a new dashboard component", time: "2m ago", grad: "from-violet-500 to-fuchsia-500" },
  { user: "MJ", name: "Marcus J.", action: "shared 'Hero Section' publicly", time: "18m ago", grad: "from-blue-500 to-cyan-500" },
  { user: "EP", name: "Emily P.", action: "forked 'Pricing Table'", time: "1h ago", grad: "from-emerald-500 to-teal-500" },
  { user: "DK", name: "David K.", action: "upgraded to Pro plan", time: "3h ago", grad: "from-amber-500 to-orange-500" },
];
export default function AnalyticsDashboard() {
  const [active, setActive] = useState("overview");
  return (
    <div className="flex h-[540px] overflow-hidden rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50">
      <aside className="w-52 bg-slate-950 flex flex-col flex-shrink-0">
        <div className="px-5 h-14 flex items-center gap-2 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-bold text-white text-sm">Sktch.ai</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${active === item.id ? "bg-violet-600/20 text-violet-400" : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"}\`}>
              <span className="text-sm leading-none">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">JD</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Jane Doe</p>
              <p className="text-[10px] text-slate-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div>
            <h1 className="text-base font-bold text-slate-900 capitalize">{active}</h1>
            <p className="text-xs text-slate-400">Last 30 days · Updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Export</button>
            <button className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-all">+ New</button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map(k => (
              <div key={k.label} className="bg-white rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1 font-medium">{k.label}</p>
                <p className="text-xl font-black text-slate-900">{k.value}</p>
                <span className={\`text-xs font-semibold \${k.up ? "text-emerald-600" : "text-red-500"}\`}>{k.delta} vs last month</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Revenue overview</h3>
                <span className="text-xs text-slate-400">2026</span>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {barData.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-violet-100 hover:bg-violet-500 rounded-t-lg transition-colors cursor-pointer" style={{ height: \`\${h * 0.9}%\` }} />
                    <span className="text-[9px] text-slate-400">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Recent activity</h3>
              <div className="space-y-3">
                {activity.map(a => (
                  <div key={a.name} className="flex items-start gap-2">
                    <div className={\`w-6 h-6 rounded-full bg-gradient-to-br \${a.grad} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5\`}>{a.user}</div>
                    <div>
                      <p className="text-[11px] text-slate-700 leading-tight"><span className="font-semibold">{a.name}</span> {a.action}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
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
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // ONBOARDING
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Onboarding Wizard',
    category: 'onboarding',
    description: 'Polished multi-step onboarding with animated transitions, progress, and role selection.',
    tags: ['onboarding', 'wizard', 'steps', 'animated', 'welcome'],
    order: 1,
    code: `import { useState } from "react";
const ROLES = [
  { id: "dev", icon: "👨‍💻", label: "Developer", desc: "I write code" },
  { id: "design", icon: "🎨", label: "Designer", desc: "I create visuals" },
  { id: "pm", icon: "📋", label: "Product", desc: "I define direction" },
  { id: "founder", icon: "🚀", label: "Founder", desc: "I wear all hats" },
];
const GOALS = ["Build a SaaS product", "Prototype faster", "Design system", "Freelance projects", "Learn UI development"];
export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goals, setGoals] = useState([]);
  const totalSteps = 4;
  const toggleGoal = (g) => setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className={\`h-1.5 rounded-full transition-all duration-300 \${i <= step ? "bg-violet-600 w-6" : "bg-slate-200 w-3"}\`} />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">{step + 1}/{totalSteps}</span>
          </div>
        </div>

        {step === 0 && (
          <div className="text-center py-4">
            <span className="text-5xl mb-5 block">👋</span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to Sktch.ai</h2>
            <p className="text-slate-500 mb-3">Let's set up your workspace in just a minute.</p>
            <p className="text-sm text-slate-400 mb-10">We'll ask a few quick questions to personalize your experience.</p>
            <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm transition-all">
              Let's go →
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">What should we call you?</h2>
            <p className="text-slate-500 text-sm mb-7">We'll use this across your workspace.</p>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" autoFocus
              className="w-full px-5 py-4 border-2 border-slate-200 focus:border-violet-400 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
              <button onClick={() => setStep(2)} disabled={!name.trim()} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-2xl text-sm font-bold">Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">What best describes you?</h2>
            <p className="text-slate-500 text-sm mb-7">We'll tailor suggestions to your role.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={\`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left \${role === r.id ? "border-violet-500 bg-violet-50 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}\`}>
                  <span className="text-2xl mb-2">{r.icon}</span>
                  <p className={\`text-sm font-bold \${role === r.id ? "text-violet-700" : "text-slate-900"}\`}>{r.label}</p>
                  <p className="text-xs text-slate-400">{r.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50">← Back</button>
              <button onClick={() => setStep(3)} disabled={!role} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-2xl text-sm font-bold">Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">You're all set{name ? \`, \${name}\` : ""}!</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Your workspace is ready. Start by uploading a sketch or describing your first component.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep(0)} className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm transition-all">
                Open my workspace →
              </button>
              <button onClick={() => setStep(0)} className="text-sm text-slate-400 hover:text-slate-600">Restart demo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // TIMELINE
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Activity Timeline',
    category: 'timeline',
    description: 'Vertical timeline with avatar icons, status badges, and expandable detail.',
    tags: ['timeline', 'activity', 'history', 'events'],
    order: 1,
    code: `import { useState } from "react";
const events = [
  { type: "deploy", icon: "🚀", title: "Production deploy v2.4.0", desc: "Deployed to all regions. Latency improved by 23%.", time: "2 hours ago", badge: "success", badgeText: "Live", user: "SC", grad: "from-emerald-500 to-teal-500", detail: "Included: command palette, new auth flow, 12 bug fixes" },
  { type: "member", icon: "👤", title: "Sarah Chen joined the team", desc: "Invited by Marcus Lee as Lead Designer.", time: "5 hours ago", badge: "info", badgeText: "Team", user: "MJ", grad: "from-violet-500 to-fuchsia-500", detail: "Role: Lead Designer · Access: Full" },
  { type: "bug", icon: "🔧", title: "Critical bug resolved #342", desc: "Login timeout issue affecting 12% of users fixed.", time: "Yesterday", badge: "warning", badgeText: "Fixed", user: "DK", grad: "from-amber-500 to-orange-500", detail: "Root cause: JWT refresh race condition on slow connections" },
  { type: "feature", icon: "✨", title: "Component library launched", desc: "200+ production-ready React components now available.", time: "2 days ago", badge: "success", badgeText: "Feature", user: "EP", grad: "from-blue-500 to-cyan-500", detail: "Categories: Auth, Navigation, Dashboard, Forms, and more" },
  { type: "security", icon: "🔒", title: "Security audit completed", desc: "SOC 2 Type II certification renewed for 2026.", time: "1 week ago", badge: "info", badgeText: "Security", user: "SC", grad: "from-slate-500 to-slate-600", detail: "No critical vulnerabilities found. All systems clear." },
];
const badgeColors = { success: "bg-emerald-50 text-emerald-700 border border-emerald-200", info: "bg-violet-50 text-violet-700 border border-violet-200", warning: "bg-amber-50 text-amber-700 border border-amber-200" };
export default function ActivityTimeline() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900">Activity</h3>
        <button className="text-xs font-semibold text-violet-600 hover:text-violet-500">View all →</button>
      </div>
      <div className="space-y-0">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={\`w-10 h-10 rounded-xl bg-gradient-to-br \${e.grad} flex items-center justify-center text-base flex-shrink-0 shadow-sm\`}>{e.icon}</div>
              {i < events.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1 min-h-[20px]" />}
            </div>
            <div className="pb-5 flex-1">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full text-left group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{e.title}</p>
                      <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${badgeColors[e.badge]}\`}>{e.badgeText}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{e.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400">{e.time}</p>
                    <svg className={\`w-3.5 h-3.5 text-slate-400 ml-auto mt-1 transition-transform \${expanded === i ? "rotate-180" : ""}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </button>
              {expanded === i && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  {e.detail}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // ECOMMERCE
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Shopping Cart',
    category: 'ecommerce',
    description: 'Slide-out cart drawer with quantity controls, discount code, and order summary.',
    tags: ['cart', 'ecommerce', 'checkout', 'drawer'],
    order: 1,
    code: `import { useState } from "react";
const initial = [
  { id: 1, name: "Wireless Headphones", variant: "Midnight Black", price: 79, qty: 1, emoji: "🎧" },
  { id: 2, name: "USB-C Hub 7-in-1", variant: "Space Gray", price: 45, qty: 2, emoji: "🔌" },
  { id: 3, name: "LED Desk Lamp", variant: "White", price: 34, qty: 1, emoji: "💡" },
];
export default function ShoppingCart() {
  const [items, setItems] = useState(initial);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [codeApplied, setCodeApplied] = useState(false);
  const update = (id, delta) => setItems(p => p.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (id) => setItems(p => p.filter(i => i.id !== id));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * discount);
  const shipping = subtotal > 100 ? 0 : 9;
  const total = subtotal - discountAmt + shipping;
  const applyCode = () => {
    if (code.toUpperCase() === "SKTCH20") { setDiscount(0.2); setCodeApplied(true); }
    else { setCodeApplied(false); setDiscount(0); }
  };
  return (
    <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">Cart</h3>
        <span className="text-xs font-bold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full">{items.reduce((s, i) => s + i.qty, 0)} items</span>
      </div>

      <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0">{item.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
              <p className="text-xs text-slate-400">{item.variant}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button onClick={() => update(item.id, -1)} className="w-6 h-6 rounded-md text-slate-600 hover:bg-white hover:shadow-sm text-sm font-bold transition-all flex items-center justify-center">−</button>
                  <span className="text-xs font-bold w-5 text-center text-slate-900">{item.qty}</span>
                  <button onClick={() => update(item.id, 1)} className="w-6 h-6 rounded-md text-slate-600 hover:bg-white hover:shadow-sm text-sm font-bold transition-all flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-900">\${item.price * item.qty}</p>
              <button onClick={() => remove(item.id)} className="text-[11px] text-slate-400 hover:text-red-500 mt-0.5 transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex gap-2 mb-4">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Discount code (try SKTCH20)"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-400 transition-all" />
          <button onClick={applyCode} className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">Apply</button>
        </div>
        {codeApplied && <p className="text-xs text-emerald-600 font-medium mb-3 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>SKTCH20 — 20% off applied!</p>}

        <div className="space-y-1.5 text-sm mb-4">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium text-slate-900">\${subtotal}</span></div>
          {discount > 0 && <div className="flex justify-between"><span className="text-emerald-600">Discount (20%)</span><span className="font-medium text-emerald-600">−\${discountAmt}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-medium text-slate-900">{shipping === 0 ? <span className="text-emerald-600">Free</span> : \`\$\${shipping}\`}</span></div>
        </div>
        <div className="flex justify-between text-base font-black text-slate-900 mb-4 pt-3 border-t border-slate-100">
          <span>Total</span><span>\${total}</span>
        </div>
        <button className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm transition-all">
          Checkout →
        </button>
        {shipping > 0 && <p className="text-center text-xs text-slate-400 mt-2">Add \${100 - subtotal} more for free shipping</p>}
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // ERROR PAGES
  // ═══════════════════════════════════════════════════════════
  {
    title: '404 Page',
    category: 'error',
    description: 'Immersive 404 error page with subtle animation and helpful navigation.',
    tags: ['error', '404', 'not-found', 'animated'],
    order: 1,
    code: `export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg">
        <div className="relative mb-6 inline-block">
          <span className="text-[10rem] font-black text-transparent bg-gradient-to-b from-slate-700 to-slate-900 bg-clip-text leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-bounce" style={{ animationDuration: "2s" }}>🔭</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">Lost in space</h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
          This page drifted off into the void. Maybe it was never here, or maybe it moved to a new orbit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm transition-all">
            ← Back to home
          </button>
          <button className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl text-sm border border-white/10 transition-all">
            Report broken link
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
          {["Dashboard", "Components", "Documentation", "Support"].map(l => (
            <button key={l} className="hover:text-slate-300 transition-colors">{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  },
  // ═══════════════════════════════════════════════════════════
  // TEAM
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Team Grid',
    category: 'team',
    description: 'Team member showcase with role badges, hover reveal, and social links.',
    tags: ['team', 'members', 'about', 'people', 'cards'],
    order: 1,
    code: `import { useState } from "react";
const team = [
  { name: "Alex Rivera", role: "CEO & Co-Founder", dept: "Leadership", initials: "AR", grad: "from-violet-500 to-fuchsia-500", bio: "Former PM at Figma. Building tools designers love." },
  { name: "Sarah Chen", role: "CTO & Co-Founder", dept: "Engineering", initials: "SC", grad: "from-blue-500 to-cyan-500", bio: "Ex-Google. Shipped products used by millions." },
  { name: "Marcus Lee", role: "Head of Design", dept: "Design", initials: "ML", grad: "from-amber-500 to-orange-500", bio: "Led design at Linear. Obsessed with micro-details." },
  { name: "Emily Park", role: "Head of Product", dept: "Product", initials: "EP", grad: "from-emerald-500 to-teal-500", bio: "Scaled 3 products from 0 to 1M users." },
  { name: "David Kim", role: "Lead Engineer", dept: "Engineering", initials: "DK", grad: "from-rose-500 to-pink-500", bio: "Full-stack wizard. Makes the impossible routine." },
  { name: "Priya Nair", role: "AI Research Lead", dept: "AI", initials: "PN", grad: "from-indigo-500 to-violet-500", bio: "PhD from MIT. Making AI useful for everyone." },
  { name: "Jordan Walsh", role: "Growth", dept: "Marketing", initials: "JW", grad: "from-slate-600 to-slate-800", bio: "Grew Notion's user base by 500% in one year." },
  { name: "Mia Torres", role: "Customer Success", dept: "Support", initials: "MT", grad: "from-cyan-500 to-blue-500", bio: "Ensures every customer becomes a power user." },
];
const depts = ["All", ...new Set(team.map(m => m.dept))];
export default function TeamGrid() {
  const [filter, setFilter] = useState("All");
  const [hover, setHover] = useState(null);
  const filtered = filter === "All" ? team : team.filter(m => m.dept === filter);
  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Meet our team</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">World-class builders on a mission to make UI development 10x faster.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {depts.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                className={\`px-4 py-2 rounded-xl text-xs font-semibold transition-all \${filter === d ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}\`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div
              key={m.name}
              onMouseEnter={() => setHover(m.name)}
              onMouseLeave={() => setHover(null)}
              className="group relative bg-white rounded-2xl border border-slate-200 p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className={\`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br \${m.grad} flex items-center justify-center text-white text-lg font-black mb-3 group-hover:scale-110 transition-transform duration-300\`}>{m.initials}</div>
              <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{m.role}</p>
              <span className={\`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500\`}>{m.dept}</span>

              <div className={\`absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 \${hover === m.name ? "opacity-100" : "opacity-0 pointer-events-none"}\`}>
                <p className="text-xs text-slate-600 leading-relaxed text-center mb-3">{m.bio}</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-violet-100 flex items-center justify-center text-sm transition-colors">𝕏</button>
                  <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-violet-100 flex items-center justify-center text-sm transition-colors">in</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-slate-500 text-sm mb-4">Want to join us? We're hiring.</p>
          <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all">View open roles →</button>
        </div>
      </div>
    </div>
  );
}`,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');
    await Component.deleteMany({});
    console.log('Cleared existing components');
    const inserted = await Component.insertMany(components);
    console.log(`Seeded ${inserted.length} components`);
    const counts = {};
    inserted.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    console.log('By category:', counts);
    await mongoose.disconnect();
    console.log('Done ✓');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}
seed();