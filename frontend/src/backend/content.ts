import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const contentRouter = new Hono<AppEnv>();

contentRouter.get('/settings', async (c) => {
  const settings = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = ?').bind('global_settings').first();
  if (!settings) {
    return c.json({ registration_open: true, level1_open: true, level2_open: true });
  }
  return c.json({
    registration_open: Boolean(settings.registration_open),
    level1_open: Boolean(settings.level1_open),
    level2_open: Boolean(settings.level2_open),
  });
});

contentRouter.patch('/settings', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'spoc') return c.json({ detail: 'Forbidden' }, 403);
  
  const body = await c.req.json();
  const settings = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = ?').bind('global_settings').first();
  
  if (!settings) {
    await c.env.DB.prepare(`
      INSERT INTO system_settings (id, registration_open, level1_open, level2_open, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      'global_settings', 
      body.registration_open ?? 1, 
      body.level1_open ?? 1, 
      body.level2_open ?? 1, 
      new Date().toISOString()
    ).run();
  } else {
    await c.env.DB.prepare(`
      UPDATE system_settings 
      SET registration_open = ?, level1_open = ?, level2_open = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      body.registration_open ?? settings.registration_open,
      body.level1_open ?? settings.level1_open,
      body.level2_open ?? settings.level2_open,
      new Date().toISOString(),
      'global_settings'
    ).run();
  }

  return c.json({ success: true });
});
