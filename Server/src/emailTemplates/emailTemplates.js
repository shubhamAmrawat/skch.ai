/**
 * Email templates for transactional emails.
 * Add new templates here as needed (welcome, verification, etc.)
 */

/**
 * Password reset OTP email template
 * @param {Object} params
 * @param {string} params.otp - 6-digit OTP code
 * @param {string} params.appName - App name (e.g. 'sktch.ai')
 * @param {string} params.logoUrl - Full URL to logo/icon image
 */
export function passwordResetEmail({ otp, appName = 'sktch.ai', logoUrl }) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; min-height: 100vh;">
    <tr>
      <td style="padding: 40px 20px;" align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; background: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Header - sktch.ai logo -->
          <tr>
            <td style="padding: 32px 40px 28px; background: #ffffff; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <img src="${logoUrl}" alt="${appName}" width="140" height="48" style="display: inline-block; border: 0;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">Hi there,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">You requested a password reset. Use this one-time code to set a new password:</p>
              <!-- OTP Box - indigo accent matching UI -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 40px;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: 'SF Mono', Monaco, Consolas, monospace;">${otp}</span>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.5; color: #64748b;">This code expires in <strong style="color: #475569;">10 minutes</strong>.</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">— <span style="color: #4f46e5; font-weight: 600;">${appName}</span> · Transform sketches into code</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Your ${appName} password reset code is: ${otp}. It expires in 10 minutes.`;

  return { html, text };
}
