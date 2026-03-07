import nodemailer from 'nodemailer';
import { passwordResetEmail } from '../emailTemplates/emailTemplates.js';

let transporter = null;

/**
 * Get or create SMTP transporter.
 * Requires SMTP_HOST, SMTP_USER, SMTP_PASS in .env (dev and production).
 *
 * For Google SMTP (Gmail):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-16-char-app-password
 *   SMTP_FROM=noreply@yourdomain.com (optional)
 *
 * Create App Password: Google Account → Security → 2-Step Verification → App passwords
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env. ' +
      'For Gmail: use smtp.gmail.com with an App Password (not your regular password).'
    );
  }

  const transportOptions = {
    host,
    port,
    secure,
    auth: { user, pass },
  };
  // Gmail & Brevo: ensure TLS for port 587 (STARTTLS)
  if (port === 587 && (host === 'smtp.gmail.com' || host?.includes('brevo') || host?.includes('sendinblue'))) {
    transportOptions.requireTLS = true;
  }

  transporter = nodemailer.createTransport(transportOptions);
  console.log('[Email] SMTP transporter created', { host, port, secure, user: user ? `${user.slice(0, 3)}***` : 'missing' });

  return transporter;
}

/**
 * Send OTP email for password reset
 */
export async function sendOtpEmail(to, otp, appName = 'sktch.ai') {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${appName.replace('.', '')}.com`;
  const subject = `Your ${appName} password reset code`;

  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    'https://res.cloudinary.com/dvzm9b086/image/upload/v1772907058/logo1_pc7noa.png';

  const { html, text } = passwordResetEmail({ otp, appName, logoUrl });

  console.log('[Email] sendOtpEmail: Preparing to send', { to, from, subject, otpLength: otp?.length });

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log('[Email] sendOtpEmail: Sent successfully', { messageId: info?.messageId, to });
  } catch (err) {
    console.error('[Email] sendOtpEmail: Send failed', {
      to,
      error: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
    });
    throw err;
  }
}
