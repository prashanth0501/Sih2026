import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';
import { logAudit } from './audit';
import { CentralEmailService } from './services/email/emailService';

export const adminUsersRouter = new Hono<AppEnv>();

adminUsersRouter.use('*', authMiddleware);

// Middleware to enforce coordinator or higher
adminUsersRouter.use('*', async (c, next) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — Coordinator or higher required' }, 403);
  }
  await next();
});

// ─── GET /admin/users — Search & filter users ──────────────────────────────────

adminUsersRouter.get('/users', async (c) => {
  const search = c.req.query('q')?.trim() || '';
  const roleFilter = c.req.query('role')?.trim() || '';
  const deptFilter = c.req.query('dept')?.trim() || '';

  let query = 'SELECT id, name, email, role, department, year, usn, gender, email_verified, is_disabled, created_at FROM users WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(usn) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (roleFilter) {
    query += ' AND role = ?';
    params.push(roleFilter);
  }

  if (deptFilter) {
    query += ' AND department = ?';
    params.push(deptFilter);
  }

  query += ' ORDER BY created_at DESC LIMIT 200';

  const stmt = c.env.DB.prepare(query);
  const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
  const { results } = await boundStmt.all();

  return c.json(
    results.map((u) => ({
      ...u,
      email_verified: Boolean(u.email_verified),
      is_disabled: Boolean(u.is_disabled),
    }))
  );
});

// ─── PATCH /admin/users/:id/status — Enable / Disable user account ────────────

adminUsersRouter.patch('/users/:id/status', async (c) => {
  const userId = c.req.param('id');
  const body = await c.req.json();
  const disable = Boolean(body.disabled);

  const user = await c.env.DB.prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) return c.json({ detail: 'User not found' }, 404);

  // Prevent disabling fellow admins
  if (user.role === 'admin') {
    return c.json({ detail: 'Cannot disable administrator accounts' }, 400);
  }

  await c.env.DB.prepare('UPDATE users SET is_disabled = ? WHERE id = ?')
    .bind(disable ? 1 : 0, userId)
    .run();

  const action = disable ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED';
  await logAudit(c, action, userId, { target_email: user.email });

  return c.json({ success: true, is_disabled: disable });
});

// ─── POST /admin/users/:id/reset-password — Trigger Admin Password Reset ──────

adminUsersRouter.post('/users/:id/reset-password', async (c) => {
  const userId = c.req.param('id');
  const adminActor = c.get('user');

  const user = await c.env.DB.prepare('SELECT id, name, email FROM users WHERE id = ?')
    .bind(userId)
    .first();

  if (!user) return c.json({ detail: 'User not found' }, 404);

  // Generate Reset Token & 1h expiration
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    'UPDATE users SET password_reset_token = ?, password_reset_expires_at = ? WHERE id = ?'
  )
    .bind(token, expiresAt, userId)
    .run();

  const emailService = CentralEmailService.fromEnv(c.env);
  const appUrl = c.env.APP_URL || 'http://localhost:5173';

  await emailService.sendAdminResetNoticeEmail({
    to: user.email as string,
    userName: (user.name as string) || 'User',
    token,
    appUrl,
    adminActorName: adminActor.email,
  });

  await logAudit(c, 'ADMIN_PASSWORD_RESET_INITIATED', userId, { target_email: user.email });

  return c.json({ success: true, message: 'Password reset link has been dispatched to the user via email.' });
});

// ─── GET /admin/audit-logs — Query audit logs ──────────────────────────────────

adminUsersRouter.get('/audit-logs', async (c) => {
  const limit = Math.min(Number(c.req.query('limit') || 100), 200);
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?'
  )
    .bind(limit)
    .all();

  return c.json(
    results.map((log) => ({
      ...log,
      details: log.details_json ? JSON.parse(log.details_json as string) : {},
    }))
  );
});
