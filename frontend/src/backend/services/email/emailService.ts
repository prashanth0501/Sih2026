import type { EmailPayload, EmailResult, IEmailProvider } from './types';
import { ResendProvider } from './resend';
import { renderVerificationEmail } from './templates/verification';
import { renderPasswordResetEmail } from './templates/passwordReset';
import { renderPasswordChangedEmail } from './templates/passwordChanged';
import { renderAdminResetNoticeEmail } from './templates/adminResetNotice';

export class CentralEmailService {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    this.provider = provider || new ResendProvider();
  }

  static fromEnv(env: { RESEND_API_KEY?: string; FROM_EMAIL?: string }): CentralEmailService {
    const provider = new ResendProvider(
      env.RESEND_API_KEY || '',
      env.FROM_EMAIL || 'Ignite Portal <noreply@sih.ncet.co.in>'
    );
    return new CentralEmailService(provider);
  }

  async sendEmailWithRetry(payload: EmailPayload, maxAttempts = 3): Promise<EmailResult> {
    let attempt = 0;
    let lastError = '';

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await this.provider.sendEmail(payload);
        if (res.success) {
          return res;
        }
        lastError = res.error || 'Unknown provider error';
      } catch (err: any) {
        lastError = err.message || 'Exception during email execution';
      }

      // Retry delay (if not final attempt)
      if (attempt < maxAttempts) {
        const delayMs = Math.pow(3, attempt - 1) * 1000; // 1s, 3s
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.error(`[EMAIL RETRY EXHAUSTED] Failed to send email to ${payload.to} after ${maxAttempts} attempts. Error: ${lastError}`);
    return { success: false, error: lastError };
  }

  async sendVerificationEmail(params: {
    to: string;
    userName: string;
    token: string;
    appUrl: string;
  }): Promise<EmailResult> {
    const verificationUrl = `${params.appUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(params.token)}`;
    const { html, text } = renderVerificationEmail({
      userName: params.userName,
      verificationUrl,
      expiresInHours: 24,
    });

    return this.sendEmailWithRetry({
      to: params.to,
      subject: 'Verify Your Email — Ignite SIH 2026',
      html,
      text,
      tag: 'verification',
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    token: string;
    appUrl: string;
  }): Promise<EmailResult> {
    const resetUrl = `${params.appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(params.token)}`;
    const { html, text } = renderPasswordResetEmail({
      userName: params.userName,
      resetUrl,
      expiresInMinutes: 60,
    });

    return this.sendEmailWithRetry({
      to: params.to,
      subject: 'Reset Your Password — Ignite SIH 2026',
      html,
      text,
      tag: 'password-reset',
    });
  }

  async sendPasswordChangedEmail(params: {
    to: string;
    userName: string;
    userAgent?: string;
  }): Promise<EmailResult> {
    const timestampText = new Date().toUTCString();
    const { html, text } = renderPasswordChangedEmail({
      userName: params.userName,
      timestampText,
      userAgentInfo: params.userAgent || 'Web Browser',
    });

    return this.sendEmailWithRetry({
      to: params.to,
      subject: 'Security Advisory: Password Changed — Ignite SIH 2026',
      html,
      text,
      tag: 'password-changed',
    });
  }

  async sendAdminResetNoticeEmail(params: {
    to: string;
    userName: string;
    token: string;
    appUrl: string;
    adminActorName?: string;
  }): Promise<EmailResult> {
    const resetUrl = `${params.appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(params.token)}`;
    const { html, text } = renderAdminResetNoticeEmail({
      userName: params.userName,
      resetUrl,
      adminActorName: params.adminActorName,
      expiresInMinutes: 60,
    });

    return this.sendEmailWithRetry({
      to: params.to,
      subject: 'Action Required: Reset Password — Ignite SIH 2026 Admin',
      html,
      text,
      tag: 'admin-notice',
    });
  }
}
