import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const teamsRouter = new Hono<AppEnv>();

teamsRouter.use('*', authMiddleware);

// Helper to verify team ownership (Leader or Staff)
async function verifyTeamOwnership(c: any, teamId: string) {
  const user = c.get('user');

  // Staff (coordinator/spoc/admin) always bypasses team leader ownership check
  if (['coordinator', 'spoc', 'admin'].includes(user.role)) {
    const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
    return { allowed: true, team, isStaff: true };
  }

  // Fetch logged-in user's USN
  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?')
    .bind(user.email)
    .first();

  if (!dbUser || !dbUser.usn) {
    return {
      allowed: false,
      response: c.json({ detail: 'Forbidden — USN not found on user account' }, 403),
    };
  }

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!team) {
    return {
      allowed: false,
      response: c.json({ detail: 'Team not found' }, 404),
    };
  }

  if (team.leader_usn !== dbUser.usn) {
    return {
      allowed: false,
      response: c.json({ detail: 'Forbidden — Only the team leader can modify team settings' }, 403),
    };
  }

  return { allowed: true, team, dbUser, isStaff: false };
}

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

    // 3. Insert additional members
    for (const member of additionalMembers) {
      if (!member.usn || !member.name) continue;
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
        // USN already in another team — skip silently
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

// ─── GET /teams/mine — Get current user's team ─────────────────────────────────

teamsRouter.get('/mine', async (c) => {
  const user = c.get('user');

  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?')
    .bind(user.email)
    .first();

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

// ─── POST /teams/:id/members — Add a member (Strict Leader Ownership Check) ───

teamsRouter.post('/:id/members', async (c) => {
  const teamId = c.req.param('id');
  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

  const team = ownership.team;
  if (team.is_locked) return c.json({ detail: 'Team is locked — no changes allowed' }, 400);

  const body = await c.req.json();
  if (!body.usn || !body.name) {
    return c.json({ detail: 'Member name and USN are required' }, 400);
  }

  // Check member count (max 6 total including leader)
  const { results: currentMembers } = await c.env.DB.prepare(
    'SELECT id FROM team_members WHERE team_id = ?'
  )
    .bind(teamId)
    .all();
  if (currentMembers.length >= 6) {
    return c.json({ detail: 'Team already has the maximum of 6 members' }, 400);
  }

  const id = crypto.randomUUID();
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

// ─── DELETE /teams/:id/members/:usn — Remove member (Strict Leader Check) ────

teamsRouter.delete('/:id/members/:usn', async (c) => {
  const teamId = c.req.param('id');
  const usn = c.req.param('usn');

  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

  const team = ownership.team;
  if (team.is_locked) return c.json({ detail: 'Team is locked — no changes allowed' }, 400);
  if (team.leader_usn === usn) return c.json({ detail: 'Cannot remove the team leader' }, 400);

  await c.env.DB.prepare(
    'DELETE FROM team_members WHERE team_id = ? AND usn = ?'
  )
    .bind(teamId, usn)
    .run();
  return c.json({ success: true });
});

// ─── PATCH /teams/:id/lock — Lock / unlock team (Strict Leader Check) ─────────

teamsRouter.patch('/:id/lock', async (c) => {
  const teamId = c.req.param('id');
  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

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

// ─── POST /teams/:id/submissions — Submit PPT/Demo (Strict Leader Check) ──────

teamsRouter.post('/:id/submissions', async (c) => {
  const teamId = c.req.param('id');
  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

  const body = await c.req.json();
  const level = Number(body.level);
  const url = String(body.submission_url || '').trim();

  if (!url || !url.startsWith('http')) {
    return c.json({ detail: 'Valid submission URL (e.g. Google Drive link) is required' }, 400);
  }

  if (level === 1) {
    await c.env.DB.prepare(
      `UPDATE teams SET level1_submission_url = ?, level1_status = 'submitted', status = 'l1_submitted', updated_at = ? WHERE id = ?`
    ).bind(url, new Date().toISOString(), teamId).run();
  } else if (level === 2) {
    await c.env.DB.prepare(
      `UPDATE teams SET level2_submission_url = ?, level2_status = 'submitted', status = 'l2_submitted', updated_at = ? WHERE id = ?`
    ).bind(url, new Date().toISOString(), teamId).run();
  } else {
    return c.json({ detail: 'Invalid submission level' }, 400);
  }

  return c.json({ success: true });
});

// ─── POST /teams/:id/screening/:level/review — Admin review submission ───────

teamsRouter.post('/:id/screening/:level/review', async (c) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — coordinator or higher required' }, 403);
  }

  const teamId = c.req.param('id');
  const level = Number(c.req.param('level'));
  const body = await c.req.json();
  const pass = Boolean(body.pass);
  const score = body.score ?? null;
  const feedback = body.feedback || '';

  if (level === 1) {
    const nextStatus = pass ? 'passed' : 'rejected';
    const overallStatus = pass ? 'l1_cleared' : 'l1_rejected';
    await c.env.DB.prepare(
      `UPDATE teams SET level1_status = ?, level1_score = ?, level1_feedback = ?, status = ?, level1_reviewer_id = ?, level1_reviewed_at = ?, updated_at = ? WHERE id = ?`
    ).bind(nextStatus, score, feedback, overallStatus, user.sub, new Date().toISOString(), new Date().toISOString(), teamId).run();
  } else if (level === 2) {
    const nextStatus = pass ? 'passed' : 'rejected';
    const overallStatus = pass ? 'selected' : 'l2_rejected';
    await c.env.DB.prepare(
      `UPDATE teams SET level2_status = ?, level2_score = ?, level2_feedback = ?, status = ?, level2_reviewer_id = ?, level2_reviewed_at = ?, updated_at = ? WHERE id = ?`
    ).bind(nextStatus, score, feedback, overallStatus, user.sub, new Date().toISOString(), new Date().toISOString(), teamId).run();
  }

  return c.json({ success: true });
});

// ─── PATCH /teams/:id — Admin edit team details ────────────────────────────────

teamsRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — coordinator or higher required' }, 403);
  }

  const teamId = c.req.param('id');
  const body = await c.req.json();

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!team) return c.json({ detail: 'Team not found' }, 404);

  const newName = body.name ?? team.name;
  const newTheme = body.theme ?? team.theme;
  const newPsId = body.problem_statement_id ?? team.problem_statement_id;
  const newStatus = body.status ?? team.status;

  await c.env.DB.prepare(
    `UPDATE teams SET name = ?, theme = ?, status = ?, updated_at = ? WHERE id = ?`
  ).bind(newName, newTheme, newStatus, new Date().toISOString(), teamId).run();

  const updatedTeam = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!updatedTeam) return c.json({ detail: 'Error retrieving updated team' }, 500);

  const { results: members } = await c.env.DB.prepare('SELECT * FROM team_members WHERE team_id = ?').bind(teamId).all();

  return c.json({
    id: updatedTeam.id,
    name: updatedTeam.name,
    leader_id: updatedTeam.leader_usn,
    leader_usn: updatedTeam.leader_usn,
    theme: updatedTeam.theme,
    problem_statement_id: newPsId,
    members: members,
    status: updatedTeam.status,
    is_locked: false,
    viewer_is_leader: false,
    level1: { status: updatedTeam.level1_status, score: updatedTeam.level1_score, feedback: updatedTeam.level1_feedback, submission_url: updatedTeam.level1_submission_url },
    level2: { status: updatedTeam.level2_status, score: updatedTeam.level2_score, feedback: updatedTeam.level2_feedback, submission_url: updatedTeam.level2_submission_url },
  });
});

// ─── GET /teams — Admin only (Strict Coordinator+ Requirement) ────────────────

teamsRouter.get('/', async (c) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — Coordinator or higher required' }, 403);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT teams.*,
      (SELECT json_group_array(json_object('name', name, 'usn', usn, 'gender', gender, 'role', role, 'department', department, 'year', year, 'email', email, 'github_url', github_url))
       FROM team_members WHERE team_id = teams.id) as members_list
     FROM teams ORDER BY created_at DESC LIMIT 200`
  ).all();

  return c.json(
    results.map((t) => {
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
        leader_usn: t.leader_usn,
        theme: t.theme,
        status: t.status,
        is_locked: false,
        members,
        level1: { status: t.level1_status, score: t.level1_score, feedback: t.level1_feedback, submission_url: t.level1_submission_url },
        level2: { status: t.level2_status, score: t.level2_score, feedback: t.level2_feedback, submission_url: t.level2_submission_url },
        created_at: t.created_at,
      };
    })
  );
});
