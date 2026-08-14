import { Hono } from 'hono';
import type { AppEnv } from './types';

export const promotionsRouter = new Hono<AppEnv>();

promotionsRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM promo_posts WHERE is_published = 1 ORDER BY created_at DESC').all();
  return c.json(results.map(r => ({
    ...r,
    hashtags: JSON.parse(r.hashtags_json as string),
    share_count: 0 // In a real app, query count from promo_shares
  })));
});

promotionsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const post = await c.env.DB.prepare('SELECT * FROM promo_posts WHERE id = ?').bind(id).first();
  if (!post) return c.json({ detail: 'Not found' }, 404);
  return c.json({
    ...post,
    hashtags: JSON.parse(post.hashtags_json as string),
    share_count: 0
  });
});

promotionsRouter.post('/:id/shares', async (c) => {
  const promoId = c.req.param('id');
  const body = await c.req.json();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(`
      INSERT INTO promo_shares (id, promo_post_id, student_name, name, usn, platform, post_url, is_public_on_wall, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, promoId, body.student_name, body.name, body.usn, 'unknown', body.post_url, body.is_public_on_wall ? 1 : 0, new Date().toISOString()
    ).run();

    return c.json({ id, status: 'success' });
  } catch (e: any) {
    return c.json({ detail: 'Failed' }, 400);
  }
});

promotionsRouter.get('/shares', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM promo_shares ORDER BY submitted_at DESC').all();
  return c.json(results);
});

promotionsRouter.get('/:id/shares', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare('SELECT * FROM promo_shares WHERE promo_post_id = ? ORDER BY submitted_at DESC').bind(id).all();
  return c.json(results);
});

promotionsRouter.get('/wall', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM promo_shares WHERE is_public_on_wall = 1 ORDER BY submitted_at DESC LIMIT 50').all();
  return c.json(results);
});

promotionsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  try {
    await c.env.DB.prepare(`
      INSERT INTO promo_posts (id, title, caption, hashtags_json, media_url, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.title, body.caption, JSON.stringify(body.hashtags || []), body.media_url, 1, new Date().toISOString()
    ).run();
    return c.json({ id, ...body });
  } catch (e) {
    return c.json({ detail: 'Error' }, 400);
  }
});
