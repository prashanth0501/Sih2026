import type { Context } from 'hono';
import type { AppEnv } from './types';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'REGISTER_SUCCESS'
  | 'VERIFICATION_SENT'
  | 'EMAIL_VERIFIED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'ADMIN_PASSWORD_RESET_INITIATED'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_ENABLED'
  | 'ROLE_CHANGED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'SUBMISSION_CREATED';

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'anonymous';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export async function logAudit(
  c: Context<AppEnv>,
  action: AuditAction,
  targetId?: string | null,
  details?: Record<string, any>
): Promise<void> {
  try {
    const user = c.get('user');
    const actorId = user?.sub || user?.id || 'system';
    const actorEmail = user?.email ? maskEmail(user.email) : 'anonymous';

    // Sanitize details to guarantee NO secrets, tokens, passwords, or JWTs are logged
    const sanitizedDetails: Record<string, any> = {};
    if (details) {
      for (const [key, val] of Object.entries(details)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('jwt') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('hash')
        ) {
          continue; // Redact completely
        }
        sanitizedDetails[key] = val;
      }
    }

    const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const id = crypto.randomUUID();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor_id, actor_email, action, target_id, details_json, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        actorId,
        actorEmail,
        action,
        targetId || null,
        JSON.stringify(sanitizedDetails),
        ipAddress,
        userAgent,
        new Date().toISOString()
      )
      .run();
  } catch (err: any) {
    // Non-blocking audit failure
    console.error(`[AUDIT LOG FAILURE] Action: ${action} Error:`, err?.message);
  }
}
