import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ForgotPasswordEmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

export function ForgotPasswordEmailStep({
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  error,
  fieldErrors,
}: ForgotPasswordEmailStepProps) {
  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset your password</h1>
      <p className="text-slate-600 mb-8">
        Enter your email and we'll send you a 6-digit code to reset your password.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                fieldErrors.email ? 'border-red-500' : 'border-slate-200'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-sm text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              Send code
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </>
  );
}
