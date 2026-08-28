import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';
import { logAudit } from './audit';

export const auditCenterRouter = new Hono<AppEnv>();

auditCenterRouter.use('*', authMiddleware);

// Staff Guard (Coordinator, SPOC, Admin)
auditCenterRouter.use('*', async (c, next) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — Coordinator or higher required to access Security Audit Center' }, 403);
  }
  await next();
});

// ─── GET /admin/audit-logs — Paginated & Filtered Audit Feed ─────────────────

auditCenterRouter.get('/', async (c) => {
  const q = c.req.query('q')?.trim().toLowerCase() || '';
  const category = c.req.query('category')?.trim() || '';
  const action = c.req.query('action')?.trim() || '';
  const role = c.req.query('role')?.trim() || '';
  const userId = c.req.query('user_id')?.trim() || '';
  const sessionId = c.req.query('session_id')?.trim() || '';
  const ipAddress = c.req.query('ip_address')?.trim() || '';
  const country = c.req.query('country')?.trim() || '';
  const statusCode = c.req.query('status_code')?.trim() || '';
  const resourceType = c.req.query('resource_type')?.trim() || '';
  const dateFrom = c.req.query('date_from')?.trim() || '';
  const dateTo = c.req.query('date_to')?.trim() || '';
  
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(250, Math.max(10, parseInt(c.req.query('limit') || '25', 10)));
  const offset = (page - 1) * limit;

  let whereClauses: string[] = ['1=1'];
  let params: any[] = [];

  if (q) {
    whereClauses.push('(LOWER(user_name) LIKE ? OR LOWER(user_email) LIKE ? OR LOWER(action) LIKE ? OR LOWER(path) LIKE ? OR LOWER(ip_address) LIKE ? OR LOWER(resource_id) LIKE ?)');
    const term = `%${q}%`;
    params.push(term, term, term, term, term, term);
  }

  if (category) {
    whereClauses.push('action_category = ?');
    params.push(category);
  }

  if (action) {
    whereClauses.push('action = ?');
    params.push(action);
  }

  if (role) {
    whereClauses.push('user_role = ?');
    params.push(role);
  }

  if (userId) {
    whereClauses.push('user_id = ?');
    params.push(userId);
  }

  if (sessionId) {
    whereClauses.push('session_id = ?');
    params.push(sessionId);
  }

  if (ipAddress) {
    whereClauses.push('ip_address = ?');
    params.push(ipAddress);
  }

  if (country) {
    whereClauses.push('country = ?');
    params.push(country);
  }

  if (statusCode) {
    whereClauses.push('status_code = ?');
    params.push(parseInt(statusCode, 10));
  }

  if (resourceType) {
    whereClauses.push('resource_type = ?');
    params.push(resourceType);
  }

  if (dateFrom) {
    whereClauses.push('created_at >= ?');
    params.push(dateFrom);
  }

  if (dateTo) {
    whereClauses.push('created_at <= ?');
    params.push(dateTo);
  }

  const whereSql = whereClauses.join(' AND ');

  // Total count query
  const countStmt = c.env.DB.prepare(`SELECT COUNT(*) as total FROM audit_logs WHERE ${whereSql}`);
  const countResult = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
  const total = Number(countResult?.total || 0);

  // Paginated query
  const dataStmt = c.env.DB.prepare(`
    SELECT id, session_id, user_id, user_name, user_email, user_role, department, year,
           team_id, team_name, action, action_category, resource_type, resource_id,
           http_method, path, status_code, ip_address, country, state, city, isp,
           browser, browser_version, os, os_version, device_type, screen_resolution,
           timezone, language, user_agent, referer, duration_ms, details_json, created_at
    FROM audit_logs
    WHERE ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const queryParams = [...params, limit, offset];
  const { results } = await dataStmt.bind(...queryParams).all();

  const totalPages = Math.ceil(total / limit) || 1;
  const startRow = total === 0 ? 0 : offset + 1;
  const endRow = Math.min(offset + limit, total);

  return c.json({
    events: results.map(r => ({
      ...r,
      details: r.details_json ? JSON.parse(r.details_json as string) : {}
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      startRow,
      endRow
    }
  });
});

// ─── GET /admin/audit-logs/kpis — Dashboard KPI Strip & Analytics ────────────

auditCenterRouter.get('/kpis', async (c) => {
  const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
  const last24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // 1. Total events
  const { total: totalEvents } = (await c.env.DB.prepare('SELECT COUNT(*) as total FROM audit_logs').first()) as any;

  // 2. Active sessions in last 24h
  const { total: activeSessions } = (await c.env.DB.prepare('SELECT COUNT(DISTINCT session_id) as total FROM audit_logs WHERE created_at >= ?').bind(last24h).first()) as any;

  // 3. Failed logins today
  const { total: failedLoginsToday } = (await c.env.DB.prepare("SELECT COUNT(*) as total FROM audit_logs WHERE action = 'LOGIN_FAILED' AND created_at >= ?").bind(todayStart).first()) as any;

  // 4. Admin actions today
  const { total: adminActionsToday } = (await c.env.DB.prepare("SELECT COUNT(*) as total FROM audit_logs WHERE action_category = 'ADMINISTRATIVE' AND created_at >= ?").bind(todayStart).first()) as any;

  // 5. Team actions today
  const { total: teamActionsToday } = (await c.env.DB.prepare("SELECT COUNT(*) as total FROM audit_logs WHERE action_category = 'TEAM_OPERATIONS' AND created_at >= ?").bind(todayStart).first()) as any;

  // 6. Security alerts
  const { total: securityAlerts } = (await c.env.DB.prepare("SELECT COUNT(*) as total FROM audit_logs WHERE (action_category = 'SECURITY_EVENTS' OR action = 'ACCOUNT_LOCKED' OR action = 'SECURITY_ALERT') AND created_at >= ?").bind(todayStart).first()) as any;

  // 7. Top Active Users
  const { results: topUsers } = await c.env.DB.prepare(
    "SELECT user_name, user_email, user_role, COUNT(*) as action_count FROM audit_logs WHERE user_id != 'system' GROUP BY user_id ORDER BY action_count DESC LIMIT 5"
  ).all();

  // 8. Top IPs
  const { results: topIps } = await c.env.DB.prepare(
    "SELECT ip_address, country, COUNT(*) as count FROM audit_logs WHERE ip_address IS NOT NULL GROUP BY ip_address ORDER BY count DESC LIMIT 5"
  ).all();

  // 9. Top Browsers
  const { results: topBrowsers } = await c.env.DB.prepare(
    "SELECT browser, COUNT(*) as count FROM audit_logs WHERE browser IS NOT NULL AND browser != 'Unknown Browser' GROUP BY browser ORDER BY count DESC LIMIT 5"
  ).all();

  return c.json({
    kpis: {
      total_events: Number(totalEvents || 0),
      active_sessions: Number(activeSessions || 0),
      failed_logins_today: Number(failedLoginsToday || 0),
      admin_actions_today: Number(adminActionsToday || 0),
      team_actions_today: Number(teamActionsToday || 0),
      security_alerts: Number(securityAlerts || 0)
    },
    analytics: {
      top_users: topUsers,
      top_ips: topIps,
      top_browsers: topBrowsers
    }
  });
});

// ─── GET /admin/audit-logs/sessions — Aggregated Sessions View ───────────────

auditCenterRouter.get('/sessions', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(250, Math.max(10, parseInt(c.req.query('limit') || '25', 10)));
  const offset = (page - 1) * limit;
  const q = c.req.query('q')?.trim().toLowerCase() || '';

  let whereSql = "session_id IS NOT NULL AND session_id != ''";
  let params: any[] = [];

  if (q) {
    whereSql += " AND (LOWER(user_name) LIKE ? OR LOWER(user_email) LIKE ? OR LOWER(session_id) LIKE ? OR LOWER(ip_address) LIKE ?)";
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }

  // Count total sessions
  const countStmt = c.env.DB.prepare(`SELECT COUNT(DISTINCT session_id) as total FROM audit_logs WHERE ${whereSql}`);
  const countResult = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
  const total = Number(countResult?.total || 0);

  // Group by session_id
  const stmt = c.env.DB.prepare(`
    SELECT session_id,
           user_id,
           user_name,
           user_email,
           user_role,
           browser,
           os,
           device_type,
           ip_address,
           country,
           MIN(created_at) as login_time,
           MAX(created_at) as last_activity,
           COUNT(*) as action_count
    FROM audit_logs
    WHERE ${whereSql}
    GROUP BY session_id
    ORDER BY last_activity DESC
    LIMIT ? OFFSET ?
  `);

  const queryParams = [...params, limit, offset];
  const { results } = await stmt.bind(...queryParams).all();

  const sessions = results.map((s: any) => {
    const startMs = new Date(s.login_time).getTime();
    const lastMs = new Date(s.last_activity).getTime();
    const durationSeconds = Math.max(1, Math.round((lastMs - startMs) / 1000));
    
    let durationText = `${durationSeconds}s`;
    if (durationSeconds >= 3600) {
      durationText = `${(durationSeconds / 3600).toFixed(1)}h`;
    } else if (durationSeconds >= 60) {
      durationText = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;
    }

    const isActive = (Date.now() - lastMs) < 30 * 60 * 1000; // active within 30 mins

    return {
      session_id: s.session_id,
      user_id: s.user_id,
      user_name: s.user_name || 'Anonymous User',
      user_email: s.user_email || 'anonymous',
      user_role: s.user_role || 'guest',
      browser: s.browser || 'Unknown',
      os: s.os || 'Unknown',
      device_type: s.device_type || 'Desktop',
      ip_address: s.ip_address || '127.0.0.1',
      country: s.country || 'IN',
      login_time: s.login_time,
      last_activity: s.last_activity,
      duration_seconds: durationSeconds,
      duration_text: durationText,
      action_count: s.action_count,
      status: isActive ? 'ACTIVE' : 'EXPIRED'
    };
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return c.json({
    sessions,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
});

// ─── GET /admin/audit-logs/session/:sessionId — Session Investigation Timeline 

auditCenterRouter.get('/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  if (!sessionId) return c.json({ detail: 'Session ID is required' }, 400);

  const { results: events } = await c.env.DB.prepare(`
    SELECT * FROM audit_logs
    WHERE session_id = ?
    ORDER BY created_at ASC
  `).bind(sessionId).all();

  if (!events || events.length === 0) {
    return c.json({ detail: 'Session not found or contains no events' }, 404);
  }

  const firstEvent: any = events[0];
  const lastEvent: any = events[events.length - 1];
  const startMs = new Date(firstEvent.created_at).getTime();
  const endMs = new Date(lastEvent.created_at).getTime();
  const durationSec = Math.max(1, Math.round((endMs - startMs) / 1000));

  const sessionMetadata = {
    session_id: sessionId,
    user_id: firstEvent.user_id,
    user_name: firstEvent.user_name,
    user_email: firstEvent.user_email,
    user_role: firstEvent.user_role,
    department: firstEvent.department,
    year: firstEvent.year,
    team_id: firstEvent.team_id,
    team_name: firstEvent.team_name,
    ip_address: firstEvent.ip_address,
    country: firstEvent.country,
    state: firstEvent.state,
    city: firstEvent.city,
    isp: firstEvent.isp,
    browser: firstEvent.browser,
    browser_version: firstEvent.browser_version,
    os: firstEvent.os,
    os_version: firstEvent.os_version,
    device_type: firstEvent.device_type,
    screen_resolution: firstEvent.screen_resolution,
    timezone: firstEvent.timezone,
    language: firstEvent.language,
    user_agent: firstEvent.user_agent,
    login_time: firstEvent.created_at,
    last_activity: lastEvent.created_at,
    duration_seconds: durationSec,
    total_actions: events.length
  };

  const timeline = events.map((e: any) => ({
    id: e.id,
    time: e.created_at,
    action: e.action,
    action_category: e.action_category,
    resource_type: e.resource_type,
    resource_id: e.resource_id,
    http_method: e.http_method,
    path: e.path,
    status_code: e.status_code,
    duration_ms: e.duration_ms,
    details: e.details_json ? JSON.parse(e.details_json) : {}
  }));

  return c.json({
    metadata: sessionMetadata,
    timeline
  });
});

// ─── GET /admin/audit-logs/export — CSV and JSON Audit Log Exporter ─────────

auditCenterRouter.get('/export', async (c) => {
  const format = c.req.query('format')?.toLowerCase() || 'csv';
  const category = c.req.query('category')?.trim() || '';
  const action = c.req.query('action')?.trim() || '';
  const role = c.req.query('role')?.trim() || '';

  let whereClauses: string[] = ['1=1'];
  let params: any[] = [];

  if (category) {
    whereClauses.push('action_category = ?');
    params.push(category);
  }
  if (action) {
    whereClauses.push('action = ?');
    params.push(action);
  }
  if (role) {
    whereClauses.push('user_role = ?');
    params.push(role);
  }

  const whereSql = whereClauses.join(' AND ');
  const stmt = c.env.DB.prepare(`SELECT * FROM audit_logs WHERE ${whereSql} ORDER BY created_at DESC LIMIT 5000`);
  const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  if (format === 'json') {
    return c.json(results);
  }

  // Format as CSV
  const headers = ['id', 'created_at', 'session_id', 'user_name', 'user_email', 'user_role', 'action', 'action_category', 'resource_type', 'resource_id', 'http_method', 'path', 'status_code', 'ip_address', 'country', 'browser', 'os'];
  const csvRows = [headers.join(',')];

  for (const r of results as any[]) {
    const row = [
      r.id,
      r.created_at,
      r.session_id || '',
      `"${(r.user_name || '').replace(/"/g, '""')}"`,
      `"${(r.user_email || '').replace(/"/g, '""')}"`,
      r.user_role || '',
      r.action || '',
      r.action_category || '',
      r.resource_type || '',
      r.resource_id || '',
      r.http_method || '',
      `"${(r.path || '').replace(/"/g, '""')}"`,
      r.status_code || 200,
      r.ip_address || '',
      r.country || '',
      `"${(r.browser || '').replace(/"/g, '""')}"`,
      `"${(r.os || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\n');
  return new Response(csvString, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ignite_audit_logs_${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
});

// ─── POST /admin/audit-logs/track-page — Page Visit Navigation Logging ────────

auditCenterRouter.post('/track-page', async (c) => {
  const body = await c.req.json();
  const path = body.path || '/';
  const referer = body.referer || null;

  await logAudit(
    c,
    'PAGE_VIEW',
    null,
    { path, referer, screen_resolution: body.screen_resolution, timezone: body.timezone, language: body.language },
    { category: 'PAGE_VISITS', path }
  );

  return c.json({ success: true });
});

// ─── GET /admin/audit-logs/:id — Single Event Details ─────────────────────────

auditCenterRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await c.env.DB.prepare('SELECT * FROM audit_logs WHERE id = ?').bind(id).first();
  if (!event) return c.json({ detail: 'Audit log entry not found' }, 404);

  return c.json({
    ...event,
    details: event.details_json ? JSON.parse(event.details_json as string) : {}
  });
});
