import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function ForgotPasswordSuccess() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Password reset successful</h1>
      <p className="text-slate-600 mb-8">
        You can now sign in with your new password.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
      >
        Sign In
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
