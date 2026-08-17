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
  const dbUser = await c.env.DB.prepare('SELECT usn, name, email, department, year, gender, github_url FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'User not found' }, 404);

  const leader_usn = body.leader_usn || dbUser.usn;
  if (!leader_usn) return c.json({ detail: 'Leader USN required' }, 400);

  // Check if leader is already in a team
  const existing = await c.env.DB.prepare('SELECT team_id FROM team_members WHERE usn = ?').bind(leader_usn).first();
  if (existing) return c.json({ detail: 'You are already in a team' }, 400);

  try {
    // Insert team
    await c.env.DB.prepare(`
      INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, leader_usn, body.leader_github_url || dbUser.github_url || '', body.theme || null,
      '[]', 'registered', new Date().toISOString(), new Date().toISOString()
    ).run();

    // Insert leader into team_members
    await c.env.DB.prepare(`
      INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), id, dbUser.name, dbUser.email, leader_usn, dbUser.gender || 'Male', dbUser.department, dbUser.year, 'leader', dbUser.github_url || '', new Date().toISOString()
    ).run();

    return c.json({ id, status: 'registered' });
  } catch (err: any) {
    return c.json({ detail: 'Failed to create team or duplicate name' }, 400);
  }
});

teamsRouter.get('/mine', async (c) => {
  const user = c.get('user');
  
  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser || !dbUser.usn) return c.json(null);

  const member = await c.env.DB.prepare('SELECT team_id FROM team_members WHERE usn = ?').bind(dbUser.usn).first();
  if (!member) return c.json(null);

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(member.team_id).first();
  if (!team) return c.json(null);

  const { results: members } = await c.env.DB.prepare('SELECT * FROM team_members WHERE team_id = ?').bind(team.id).all();

  return c.json({
    id: team.id,
    name: team.name,
    leader_id: team.leader_usn,
    leader_usn: team.leader_usn,
    theme: team.theme,
    members: members,
    status: team.status,
    is_locked: Boolean(team.is_locked),
    viewer_is_leader: team.leader_usn === dbUser.usn,
    level1: { status: team.level1_status, score: team.level1_score, feedback: team.level1_feedback, submission_url: team.level1_submission_url },
    level2: { status: team.level2_status, score: team.level2_score, feedback: team.level2_feedback, submission_url: team.level2_submission_url },
  });
});

teamsRouter.post('/:id/members', async (c) => {
  const teamId = c.req.param('id');
  const body = await c.req.json();
  const id = crypto.randomUUID();

  // Validate team lock
  const team = await c.env.DB.prepare('SELECT is_locked FROM teams WHERE id = ?').bind(teamId).first();
  if (!team || team.is_locked) return c.json({ detail: 'Team is locked or not found' }, 400);

  try {
    await c.env.DB.prepare(`
      INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, teamId, body.name, body.email || '', body.usn, body.gender || 'Not Specified', body.department || 'CSE', body.year || 1, body.role || 'member', body.github_url || '', new Date().toISOString()
    ).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ detail: 'USN already in another team' }, 400);
  }
});

teamsRouter.delete('/:id/members/:usn', async (c) => {
  const teamId = c.req.param('id');
  const usn = c.req.param('usn');

  const team = await c.env.DB.prepare('SELECT is_locked, leader_usn FROM teams WHERE id = ?').bind(teamId).first();
  if (!team || team.is_locked) return c.json({ detail: 'Team is locked' }, 400);
  if (team.leader_usn === usn) return c.json({ detail: 'Cannot remove leader' }, 400);

  await c.env.DB.prepare('DELETE FROM team_members WHERE team_id = ? AND usn = ?').bind(teamId, usn).run();
  return c.json({ success: true });
});

teamsRouter.patch('/:id/lock', async (c) => {
  const teamId = c.req.param('id');
  const body = await c.req.json();

  if (body.locked) {
    // Validate rules
    const { results } = await c.env.DB.prepare('SELECT gender FROM team_members WHERE team_id = ?').bind(teamId).all();
    if (results.length !== 6) {
      return c.json({ detail: 'Team must have exactly 6 members' }, 400);
    }
    const females = results.filter(m => String(m.gender).toLowerCase() === 'female');
    if (females.length === 0) {
      return c.json({ detail: 'Team must have at least 1 female member' }, 400);
    }
  }

  await c.env.DB.prepare('UPDATE teams SET is_locked = ?, updated_at = ? WHERE id = ?').bind(body.locked ? 1 : 0, new Date().toISOString(), teamId).run();
  return c.json({ success: true });
});

teamsRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT teams.*, 
    (SELECT json_group_array(json_object('name', name, 'usn', usn, 'gender', gender)) FROM team_members WHERE team_id = teams.id) as members_list
    FROM teams ORDER BY created_at DESC LIMIT 100
  `).all();
  
  return c.json(results.map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    members: JSON.parse(t.members_list as string),
    level1: { status: t.level1_status },
    level2: { status: t.level2_status }
  })));
});
