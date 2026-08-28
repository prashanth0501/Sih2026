import type { Context } from 'hono';
import type { AppEnv } from './types';

export type AuditActionCategory =
  | 'AUTHENTICATION'
  | 'ADMINISTRATIVE'
  | 'TEAM_OPERATIONS'
  | 'SYSTEM_CHANGES'
  | 'SECURITY_EVENTS'
  | 'PAGE_VISITS'
  | 'API_CALLS'
  | 'GENERAL';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT_SUCCESS'
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
  | 'TEAM_CREATED'
  | 'TEAM_EDITED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'TEAM_LOCKED'
  | 'TEAM_UNLOCKED'
  | 'TEAM_DELETED'
  | 'TEAM_RESTORED'
  | 'SUBMISSION_CREATED'
  | 'SUBMISSION_REVIEWED'
  | 'SETTINGS_CHANGED'
  | 'PROMOTION_CREATED'
  | 'PROMOTION_DELETED'
  | 'ANNOUNCEMENT_CREATED'
  | 'PDF_EXPORT_GENERATED'
  | 'PAGE_VIEW'
  | 'API_REQUEST'
  | 'SECURITY_ALERT';

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'anonymous';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function parseUserAgent(uaString: string) {
  let browser = 'Unknown Browser';
  let browserVersion = '';
  let os = 'Unknown OS';
  let osVersion = '';
  let deviceType = 'Desktop';

  if (!uaString) return { browser, browserVersion, os, osVersion, deviceType };

  const ua = uaString;

  // Device type
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    deviceType = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  // OS detection
  if (/windows/i.test(ua)) {
    os = 'Windows';
    const match = ua.match(/windows NT ([\d.]+)/i);
    if (match) osVersion = match[1] === '10.0' ? '10/11' : match[1];
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    const match = ua.match(/mac os x ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
    const match = ua.match(/os ([\d_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/android ([\d.]+)/i);
    if (match) osVersion = match[1];
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser detection
  if (/edg\/([\d.]+)/i.test(ua)) {
    browser = 'Edge';
    browserVersion = ua.match(/edg\/([\d.]+)/i)?.[1] || '';
  } else if (/chrome\/([\d.]+)/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Chrome';
    browserVersion = ua.match(/chrome\/([\d.]+)/i)?.[1] || '';
  } else if (/firefox\/([\d.]+)/i.test(ua)) {
    browser = 'Firefox';
    browserVersion = ua.match(/firefox\/([\d.]+)/i)?.[1] || '';
  } else if (/safari\/([\d.]+)/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
    browserVersion = ua.match(/version\/([\d.]+)/i)?.[1] || '';
  }

  return { browser, browserVersion, os, osVersion, deviceType };
}

export function determineCategory(action: string): AuditActionCategory {
  if (['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT_SUCCESS', 'ACCOUNT_LOCKED', 'REGISTER_SUCCESS', 'VERIFICATION_SENT', 'EMAIL_VERIFIED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED'].includes(action)) {
    return 'AUTHENTICATION';
  }
  if (['ROLE_CHANGED', 'ACCOUNT_DISABLED', 'ACCOUNT_ENABLED', 'ADMIN_PASSWORD_RESET_INITIATED'].includes(action)) {
    return 'ADMINISTRATIVE';
  }
  if (['TEAM_CREATED', 'TEAM_EDITED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'TEAM_LOCKED', 'TEAM_UNLOCKED', 'TEAM_DELETED', 'TEAM_RESTORED', 'SUBMISSION_CREATED', 'SUBMISSION_REVIEWED', 'PDF_EXPORT_GENERATED'].includes(action)) {
    return 'TEAM_OPERATIONS';
  }
  if (['SETTINGS_CHANGED', 'PROMOTION_CREATED', 'PROMOTION_DELETED', 'ANNOUNCEMENT_CREATED'].includes(action)) {
    return 'SYSTEM_CHANGES';
  }
  if (['SECURITY_ALERT', 'ACCOUNT_LOCKED'].includes(action)) {
    return 'SECURITY_EVENTS';
  }
  if (action === 'PAGE_VIEW') {
    return 'PAGE_VISITS';
  }
  if (action === 'API_REQUEST') {
    return 'API_CALLS';
  }
  return 'GENERAL';
}

export async function logAudit(
  c: Context<AppEnv>,
  action: AuditAction | string,
  targetId?: string | null,
  details?: Record<string, any>,
  extraMeta?: {
    category?: AuditActionCategory;
    resourceType?: string;
    resourceId?: string;
    httpMethod?: string;
    path?: string;
    statusCode?: number;
    durationMs?: number;
    sessionId?: string;
  }
): Promise<void> {
  try {
    const user = c.get('user') || {};
    const actorId = user?.sub || user?.id || details?.user_id || 'system';
    const rawEmail = user?.email || details?.email || '';
    const actorEmail = rawEmail ? maskEmail(rawEmail) : 'anonymous';
    const userName = user?.name || details?.user_name || details?.name || 'Anonymous User';
    const userRole = user?.role || details?.role || 'guest';
    const department = user?.department || details?.department || null;
    const year = user?.year != null ? String(user.year) : (details?.year != null ? String(details.year) : null);
    const teamId = details?.team_id || details?.teamId || null;
    const teamName = details?.team_name || details?.teamName || null;

    const sessionId = extraMeta?.sessionId || user?.sid || c.req.header('x-session-id') || details?.session_id || 'sess_' + actorId.slice(0, 8);
    const category = extraMeta?.category || determineCategory(action);
    const resourceType = extraMeta?.resourceType || details?.resource_type || (targetId ? 'RECORD' : null);
    const resourceId = extraMeta?.resourceId || targetId || details?.resource_id || null;
    const httpMethod = extraMeta?.httpMethod || c.req.method;
    const path = extraMeta?.path || c.req.path;
    const statusCode = extraMeta?.statusCode || 200;
    const durationMs = extraMeta?.durationMs || details?.duration_ms || null;

    // Network headers
    const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const country = c.req.header('cf-ipcountry') || 'IN';
    const state = c.req.header('cf-region') || c.req.header('x-region') || null;
    const city = c.req.header('cf-ipcity') || c.req.header('x-city') || null;
    const isp = c.req.header('cf-asorganization') || null;

    // Device parsing
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const referer = c.req.header('referer') || c.req.header('referrer') || null;
    const { browser, browserVersion, os, osVersion, deviceType } = parseUserAgent(userAgent);

    // Client context headers
    const screenRes = c.req.header('x-screen-res') || details?.screen_resolution || null;
    const timezone = c.req.header('x-timezone') || details?.timezone || 'Asia/Kolkata';
    const language = c.req.header('accept-language')?.split(',')[0] || details?.language || 'en-US';

    // Strict Redaction of Secrets, Passwords, Tokens, Hashes
    const sanitizedDetails: Record<string, any> = {};
    if (details) {
      for (const [key, val] of Object.entries(details)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('jwt') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('hash') ||
          lowerKey.includes('credential')
        ) {
          continue; // Redact completely
        }
        sanitizedDetails[key] = val;
      }
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (
        id, session_id, user_id, user_name, user_email, user_role, department, year,
        team_id, team_name, action, action_category, resource_type, resource_id,
        http_method, path, status_code, ip_address, country, state, city, isp,
        browser, browser_version, os, os_version, device_type, screen_resolution,
        timezone, language, user_agent, referer, duration_ms, details_json, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )`
    )
      .bind(
        id, sessionId, actorId, userName, actorEmail, userRole, department, year,
        teamId, teamName, action, category, resourceType, resourceId,
        httpMethod, path, statusCode, ipAddress, country, state, city, isp,
        browser, browserVersion, os, osVersion, deviceType, screenRes,
        timezone, language, userAgent, referer, durationMs, JSON.stringify(sanitizedDetails), createdAt
      )
      .run();
  } catch (err: any) {
    // Non-blocking audit log execution
    console.error(`[AUDIT LOG FAILURE] Action: ${action} Error:`, err?.message);
  }
}
