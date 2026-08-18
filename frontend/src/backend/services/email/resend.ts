import type { EmailPayload, EmailResult, IEmailProvider } from './types';

export class ResendProvider implements IEmailProvider {
  name = 'Resend';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string = '', fromEmail: string = 'Ignite Portal <noreply@sih.ncet.co.in>') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    if (!this.apiKey) {
      console.log(`[DEV EMAIL LOG] Provider: Resend (Mock Mode)`);
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Tag: ${payload.tag || 'general'}`);
      console.log(`--- Content Sample ---\n${payload.text || payload.html.replace(/<[^>]+>/g, '').slice(0, 300)}...\n-----------------------`);
      return { success: true, messageId: `mock-dev-${Date.now()}` };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          tags: payload.tag ? [{ name: 'category', value: payload.tag }] : undefined,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        console.error(`[Resend Error] Status ${res.status}:`, data);
        return {
          success: false,
          error: data?.message || data?.error || `Resend API returned status ${res.status}`,
        };
      }

      console.log(`[Resend Success] Email sent to ${payload.to}, Message ID: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error(`[Resend Exception]:`, err);
      return { success: false, error: err.message || 'Network error executing Resend HTTP fetch' };
    }
  }
}
