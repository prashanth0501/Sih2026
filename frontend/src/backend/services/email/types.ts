export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tag?: 'verification' | 'password-reset' | 'password-changed' | 'admin-notice';
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<EmailResult>;
}
