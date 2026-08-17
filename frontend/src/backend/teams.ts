import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const teamsRouter = new Hono<AppEnv>();

teamsRouter.use('*', authMiddleware);

// ─── POST /teams — Create a new team ──────────────────────────────────────────

teamsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const id = crypto.randomUUID();

  if (!body.name || !String(body.name).trim()) {
    return c.json({ detail: 'Team name is required' }, 400);
  }

  // Fetch leader from DB
  const dbUser = await c.env.DB.prepare(
    'SELECT usn, name, email, department, year, gender, github_url FROM users WHERE email = ?'
  )
    .bind(user.email)
    .first();
  if (!dbUser) return c.json({ detail: 'User not found' }, 404);

  const leader_usn = body.leader_usn || dbUser.usn;
  if (!leader_usn) return c.json({ detail: 'Leader USN is required — make sure your USN was set during registration' }, 400);

  // Ensure leader is not already in another team
  const existing = await c.env.DB.prepare(
    'SELECT team_id FROM team_members WHERE usn = ?'
  )
    .bind(leader_usn)
    .first();
  if (existing) return c.json({ detail: 'You are already registered in a team' }, 400);

  // Validate additional members (BUG 4 fix — they were silently discarded before)
  const additionalMembers: any[] = Array.isArray(body.members) ? body.members : [];

  // Check for duplicate USNs in the submitted member list
  const allUsns = [leader_usn, ...additionalMembers.map((m: any) => m.usn)].filter(Boolean);
  const uniqueUsns = new Set(allUsns);
  if (uniqueUsns.size !== allUsns.length) {
    return c.json({ detail: 'Duplicate USNs found in the team member list' }, 400);
  }

  try {
    // 1. Insert team
    await c.env.DB.prepare(
      `INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        String(body.name).trim(),
        leader_usn,
        body.leader_github_url || dbUser.github_url || '',
        body.theme || null,
        '[]',
        'registered',
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run();

    // 2. Insert leader into team_members
    await c.env.DB.prepare(
      `INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        id,
        dbUser.name,
        dbUser.email,
        leader_usn,
        dbUser.gender || 'Not Specified',
        dbUser.department,
        dbUser.year,
        'leader',
        dbUser.github_url || '',
        new Date().toISOString()
      )
      .run();

    // 3. BUG 4 FIX — Insert additional members that were silently discarded before
    for (const member of additionalMembers) {
      if (!member.usn || !member.name) continue; // skip incomplete entries
      try {
        await c.env.DB.prepare(
          `INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            id,
            member.name,
            member.email || '',
            String(member.usn).toUpperCase(),
            member.gender || 'Not Specified',
            member.department || 'CSE',
            member.year || 1,
            'member',
            member.github_url || '',
            new Date().toISOString()
          )
          .run();
      } catch {
        // USN already in another team — skip silently, team is still created
      }
    }

    return c.json({ id, status: 'registered' });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return c.json({ detail: 'A team with this name already exists' }, 400);
    }
    return c.json({ detail: 'Failed to create team — please try again' }, 400);
  }
});

// ─── GET /teams/mine — Get the current user's team ────────────────────────────

teamsRouter.get('/mine', async (c) => {
  const user = c.get('user');

  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?')
    .bind(user.email)
    .first();

  // BUG 6 FIX — return 404 instead of 200 null so axios throws and frontend can handle gracefully
  if (!dbUser || !dbUser.usn) return c.json({ detail: 'No team found — USN not set on account' }, 404);

  const member = await c.env.DB.prepare(
    'SELECT team_id FROM team_members WHERE usn = ?'
  )
    .bind(dbUser.usn)
    .first();
  if (!member) return c.json({ detail: 'You are not in any team yet' }, 404);

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?')
    .bind(member.team_id)
    .first();
  if (!team) return c.json({ detail: 'Team record not found' }, 404);

  const { results: members } = await c.env.DB.prepare(
    'SELECT * FROM team_members WHERE team_id = ?'
  )
    .bind(team.id)
    .all();

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
    level1: {
      status: team.level1_status,
      score: team.level1_score,
      feedback: team.level1_feedback,
      submission_url: team.level1_submission_url,
    },
    level2: {
      status: team.level2_status,
      score: team.level2_score,
      feedback: team.level2_feedback,
      submission_url: team.level2_submission_url,
    },
  });
});

// ─── POST /teams/:id/members — Add a member to existing team ──────────────────

teamsRouter.post('/:id/members', async (c) => {
  const teamId = c.req.param('id');
  const body = await c.req.json();
  const id = crypto.randomUUID();

  if (!body.usn || !body.name) {
    return c.json({ detail: 'Member name and USN are required' }, 400);
  }

  const team = await c.env.DB.prepare(
    'SELECT is_locked, leader_usn FROM teams WHERE id = ?'
  )
    .bind(teamId)
    .first();
  if (!team) return c.json({ detail: 'Team not found' }, 404);
  if (team.is_locked) return c.json({ detail: 'Team is locked — no changes allowed' }, 400);

  // Check member count (max 6 total including leader)
  const { results: currentMembers } = await c.env.DB.prepare(
    'SELECT id FROM team_members WHERE team_id = ?'
  )
    .bind(teamId)
    .all();
  if (currentMembers.length >= 6) {
    return c.json({ detail: 'Team already has the maximum of 6 members' }, 400);
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        teamId,
        body.name,
        body.email || '',
        String(body.usn).toUpperCase(),
        body.gender || 'Not Specified',
        body.department || 'CSE',
        body.year || 1,
        body.role || 'member',
        body.github_url || '',
        new Date().toISOString()
      )
      .run();

    return c.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return c.json({ detail: 'This USN is already registered in another team' }, 400);
    }
    return c.json({ detail: 'Failed to add member' }, 400);
  }
});

// ─── DELETE /teams/:id/members/:usn — Remove a member ────────────────────────

teamsRouter.delete('/:id/members/:usn', async (c) => {
  const teamId = c.req.param('id');
  const usn = c.req.param('usn');

  const team = await c.env.DB.prepare(
    'SELECT is_locked, leader_usn FROM teams WHERE id = ?'
  )
    .bind(teamId)
    .first();
  if (!team) return c.json({ detail: 'Team not found' }, 404);
  if (team.is_locked) return c.json({ detail: 'Team is locked — no changes allowed' }, 400);
  if (team.leader_usn === usn) return c.json({ detail: 'Cannot remove the team leader' }, 400);

  await c.env.DB.prepare(
    'DELETE FROM team_members WHERE team_id = ? AND usn = ?'
  )
    .bind(teamId, usn)
    .run();
  return c.json({ success: true });
});

// ─── PATCH /teams/:id/lock — Lock / unlock team ───────────────────────────────

teamsRouter.patch('/:id/lock', async (c) => {
  const teamId = c.req.param('id');
  const body = await c.req.json();

  if (body.locked) {
    const { results } = await c.env.DB.prepare(
      'SELECT gender FROM team_members WHERE team_id = ?'
    )
      .bind(teamId)
      .all();

    if (results.length < 2) {
      return c.json({ detail: 'Team must have at least 2 members to lock' }, 400);
    }
    if (results.length > 6) {
      return c.json({ detail: 'Team cannot have more than 6 members' }, 400);
    }
    const females = results.filter((m) => String(m.gender).toLowerCase() === 'female');
    if (females.length === 0) {
      return c.json({ detail: 'Team must have at least 1 female member (SIH rule)' }, 400);
    }
  }

  await c.env.DB.prepare(
    'UPDATE teams SET is_locked = ?, updated_at = ? WHERE id = ?'
  )
    .bind(body.locked ? 1 : 0, new Date().toISOString(), teamId)
    .run();
  return c.json({ success: true });
});

// ─── GET /teams — Admin: list all teams ───────────────────────────────────────

teamsRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT teams.*,
      (SELECT json_group_array(json_object('name', name, 'usn', usn, 'gender', gender, 'role', role))
       FROM team_members WHERE team_id = teams.id) as members_list
     FROM teams ORDER BY created_at DESC LIMIT 200`
  ).all();

  return c.json(
    results.map((t) => {
      // BUG 5 FIX — json_group_array returns '[null]' for empty, filter nulls out
      let members: any[] = [];
      try {
        const parsed = JSON.parse((t.members_list as string) || '[]');
        members = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        members = [];
      }

      return {
        id: t.id,
        name: t.name,
        status: t.status,
        is_locked: Boolean(t.is_locked),
        members,
        level1: { status: t.level1_status, score: t.level1_score },
        level2: { status: t.level2_status, score: t.level2_score },
        created_at: t.created_at,
      };
    })
  );
});
