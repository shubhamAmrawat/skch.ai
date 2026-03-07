/**
 * In-memory OTP store for forgot password flow.
 * For production at scale, consider Redis or a database.
 * Structure: Map<email, { otp, expiresAt }>
 */
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a 6-digit OTP
 */
export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Store OTP for email
 */
export function setOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

/**
 * Verify OTP for email without consuming. Returns true if valid, false otherwise.
 */
export function verifyOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }
  return entry.otp === String(otp).trim();
}

/**
 * Consume (delete) OTP for email. Call after successful password reset.
 */
export function consumeOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();
  otpStore.delete(normalizedEmail);
}

/**
 * Verify OTP for email. Returns true if valid, false otherwise.
 * Consumes the OTP on success (one-time use).
 */
export function verifyAndConsumeOtp(email, otp) {
  if (!verifyOtp(email, otp)) return false;
  consumeOtp(email);
  return true;
}
