import { Key, Mail, Shield, Lock, ShieldCheck } from 'lucide-react';

export function ForgotPasswordIllustration() {
  return (
    <div className="relative w-full max-w-lg px-8">
      {/* Animated Illustration - Password Reset Flow */}
      <div className="relative">
        {/* Main card - Email/Key flow */}
        <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 animate-float">
          {/* Envelope mockup */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-14 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center relative">
              <Mail className="w-8 h-8 text-slate-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-100 rounded-lg border border-indigo-200 flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Code/OTP mockup */}
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-500">OTP:</span>
              <span className="text-2xl font-bold tracking-[0.4em] text-indigo-600">9****5</span>
            </div>
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto" />
          </div>

          {/* Shield decoration */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-center shadow-lg animate-pulse-glow">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-8 -left-8 w-14 h-14 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center animate-float-delayed shadow-md">
          <Lock className="w-7 h-7 text-slate-500" />
        </div>

        <div className="absolute -bottom-6 -left-12 w-12 h-12 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center animate-float-slow shadow-md">
          <Mail className="w-6 h-6 text-slate-500" />
        </div>

        <div className="absolute top-1/2 -right-10 w-10 h-10 bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center animate-bounce-slow shadow-md">
          <Key className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="absolute -bottom-8 right-8 w-16 h-16 bg-indigo-100 rounded-2xl border border-indigo-200 flex items-center justify-center animate-float shadow-md">
          <Shield className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      {/* Text below illustration */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Secure Password Recovery
        </h2>
        <p className="text-slate-600">
          We'll send you a one-time code to reset your password safely
        </p>
      </div>
    </div>
  );
}
