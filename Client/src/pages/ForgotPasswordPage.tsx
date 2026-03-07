import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBackground } from '../components/AuthBackground';
import { Logo } from '../components/Logo';
import {
  ForgotPasswordIllustration,
  ForgotPasswordEmailStep,
  ForgotPasswordOtpStep,
  ForgotPasswordSuccess,
} from '../components/forgot-password';
import { forgotPassword, resetPassword } from '../services/auth';

type Step = 'email' | 'otp' | 'success';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setStep('otp');
      } else {
        if (result.details) {
          const errors: Record<string, string> = {};
          result.details.forEach((d) => {
            errors[d.field] = d.message;
          });
          setFieldErrors(errors);
        } else {
          setError(result.message || result.error || 'Failed to send code');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccessMessage('A new code has been sent to your email.');
        setResendCooldown(60);
      } else {
        setError(result.message || result.error || 'Failed to resend code');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Client-side validation - never call API if form is invalid
    const errors: Record<string, string> = {};

    if (otp.length !== 6) {
      errors.otp = 'Please enter the 6-digit verification code';
    }

    const passwordValid =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword);
    if (!passwordValid) {
      errors.newPassword = 'Must be 8+ characters with uppercase, lowercase, and number';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await resetPassword(email, otp, newPassword);

      if (result.success) {
        setStep('success');
      } else {
        if (result.details) {
          const errors: Record<string, string> = {};
          result.details.forEach((d) => {
            errors[d.field] = d.message;
          });
          setFieldErrors(errors);
          setError(result.message || result.error || 'Failed to reset password');
        } else {
          setError(result.message || result.error || 'Failed to reset password');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time validation: merge server errors with live field validation
  const displayFieldErrors = useMemo(() => {
    const errors = { ...fieldErrors };

    // OTP: show error when user has typed but not 6 digits
    if (otp.length > 0 && otp.length !== 6) {
      errors.otp = 'Please enter the 6-digit verification code';
    } else if (otp.length === 6) {
      delete errors.otp;
    }

    // Confirm password: show mismatch as soon as user types in confirm field
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    } else if (confirmPassword.length > 0) {
      delete errors.confirmPassword; // They match now, clear
    }

    // New password: show format requirements when invalid; preserve server errors (e.g. "same as current") when format is valid
    if (newPassword.length > 0) {
      const valid =
        newPassword.length >= 8 &&
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword);
      if (!valid) {
        errors.newPassword = 'Must be 8+ characters with uppercase, lowercase, and number';
      }
      // When valid: keep errors.newPassword from fieldErrors (server errors like "same as current") - don't delete
    }

    return errors;
  }, [fieldErrors, otp, newPassword, confirmPassword]);

  // Form is valid only when all fields pass - used to disable submit and prevent API abuse
  const isOtpStepValid = useMemo(() => {
    const otpValid = otp.length === 6;
    const passwordValid =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword;
    return otpValid && passwordValid && passwordsMatch;
  }, [otp, newPassword, confirmPassword]);

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setError(null);
      setSuccessMessage(null);
      setFieldErrors({});
    } else {
      navigate('/login');
    }
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
            {step === 'success' ? (
              <ForgotPasswordSuccess />
            ) : step === 'email' ? (
              <ForgotPasswordEmailStep
                email={email}
                onEmailChange={setEmail}
                onSubmit={handleRequestOtp}
                isLoading={isLoading}
                error={error}
                fieldErrors={displayFieldErrors}
              />
            ) : (
              <ForgotPasswordOtpStep
                email={email}
                otp={otp}
                onOtpChange={setOtp}
                newPassword={newPassword}
                onNewPasswordChange={setNewPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
                showNewPassword={showNewPassword}
                onToggleNewPassword={() => setShowNewPassword((v) => !v)}
                showConfirmPassword={showConfirmPassword}
                onToggleConfirmPassword={() => setShowConfirmPassword((v) => !v)}
                onSubmit={handleResetPassword}
                onResendOtp={handleResendOtp}
                isLoading={isLoading}
                isResending={isResending}
                resendCooldown={resendCooldown}
                error={error}
                successMessage={successMessage}
                fieldErrors={displayFieldErrors}
                isFormValid={isOtpStepValid}
              />
            )}

            {/* Footer links - only show when not success */}
            {step !== 'success' && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  ← Back to {step === 'otp' ? 'email' : 'login'}
                </button>
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Decorative Section with Animated Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <ForgotPasswordIllustration />
      </div>
    </div>
  );
}
