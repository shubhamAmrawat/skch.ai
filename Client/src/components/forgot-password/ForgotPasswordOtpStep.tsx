import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface ForgotPasswordOtpStepProps {
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  showNewPassword: boolean;
  onToggleNewPassword: () => void;
  showConfirmPassword: boolean;
  onToggleConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  isLoading: boolean;
  isResending: boolean;
  resendCooldown: number;
  error: string | null;
  successMessage: string | null;
  fieldErrors: Record<string, string>;
  isFormValid: boolean;
}

export function ForgotPasswordOtpStep({
  email,
  otp,
  onOtpChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showNewPassword,
  onToggleNewPassword,
  showConfirmPassword,
  onToggleConfirmPassword,
  onSubmit,
  onResendOtp,
  isLoading,
  isResending,
  resendCooldown,
  error,
  successMessage,
  fieldErrors,
  isFormValid,
}: ForgotPasswordOtpStepProps) {
  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Enter verification code</h1>
      <p className="text-slate-600 mb-8">
        We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>. Enter it below along with your new password.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-emerald-700 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
            Verification code
          </label>
          <input
            type="text"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            disabled={isLoading}
            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center text-2xl tracking-[0.5em] font-mono ${
              fieldErrors.otp ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {fieldErrors.otp && (
            <p className="mt-1.5 text-sm text-red-400">{fieldErrors.otp}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">Didn't receive the code?</span>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={resendCooldown > 0 || isResending || isLoading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend code
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                fieldErrors.newPassword ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={onToggleNewPassword}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="mt-1.5 text-sm text-red-400">{fieldErrors.newPassword}</p>
          )}

          {/* Password strength indicator - real-time feedback */}
          {newPassword && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      level <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.label && (
                <p className={`text-xs ${passwordStrength.textColor}`}>{passwordStrength.label}</p>
              )}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Must be 8+ characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              Reset password
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </>
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
