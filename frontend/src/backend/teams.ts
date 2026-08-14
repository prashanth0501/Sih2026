import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const teamsRouter = new Hono<AppEnv>();

teamsRouter.use('*', authMiddleware);

teamsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const id = crypto.randomUUID();

  // Validate user
  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'User not found' }, 404);

  const leader_usn = body.leader_usn || dbUser.usn;

  try {
    await c.env.DB.prepare(`
      INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, leader_usn, body.leader_github_url || '', body.theme || null,
      JSON.stringify(body.members || []), 'registered', new Date().toISOString(), new Date().toISOString()
    ).run();

    return c.json({ id, status: 'registered' });
  } catch (err: any) {
    return c.json({ detail: 'Failed to create team' }, 400);
  }
});

teamsRouter.get('/mine', async (c) => {
  const user = c.get('user');
  
  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'Not found' }, 404);

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE leader_usn = ?').bind(dbUser.usn).first();
  if (!team) return c.json(null);

  const members = JSON.parse(team.members_json as string);

  return c.json({
    id: team.id,
    name: team.name,
    leader_id: team.leader_usn,
    leader_usn: team.leader_usn,
    theme: team.theme,
    members: members,
    status: team.status,
    is_locked: Boolean(team.is_locked),
    viewer_is_leader: true,
    level1: { status: team.level1_status, score: team.level1_score, feedback: team.level1_feedback, submission_url: team.level1_submission_url },
    level2: { status: team.level2_status, score: team.level2_score, feedback: team.level2_feedback, submission_url: team.level2_submission_url },
  });
});

teamsRouter.get('/', async (c) => {
  // Support basic pagination/search later
  const { results } = await c.env.DB.prepare('SELECT * FROM teams ORDER BY created_at DESC LIMIT 100').all();
  return c.json(results.map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    members: JSON.parse(t.members_json as string),
    level1: { status: t.level1_status },
    level2: { status: t.level2_status }
  })));
});
