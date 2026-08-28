import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware, isSuperAdminUser } from './auth';
import { logAudit } from './audit';

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

  if (team.leader_usn !== dbUser.usn && String(team.leader_usn).trim() !== String(dbUser.usn).trim()) {
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
    'SELECT team_id FROM team_members WHERE usn = ? OR TRIM(usn) = ?'
  )
    .bind(leader_usn, String(leader_usn).trim())
    .first();
  if (existing) return c.json({ detail: 'You are already registered in a team' }, 400);

  const additionalMembers: any[] = Array.isArray(body.members) ? body.members : [];

  // Check for duplicate USNs in the submitted member list
  const allUsns = [leader_usn, ...additionalMembers.map((m: any) => m.usn)].filter(Boolean);
  const uniqueUsns = new Set(allUsns.map(u => String(u).trim().toUpperCase()));
  if (uniqueUsns.size !== allUsns.length) {
    return c.json({ detail: 'Duplicate USNs found in the team member list' }, 400);
  }

  try {
    // 1. Insert team
    await c.env.DB.prepare(
      `INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, problem_statement_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        String(body.name).trim(),
        leader_usn,
        body.leader_github_url || dbUser.github_url || '',
        body.theme || null,
        '[]',
        'registered',
        body.problem_statement_id || null,
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

    await logAudit(c, 'TEAM_CREATED', id, {
      team_id: id,
      team_name: String(body.name).trim(),
      leader_usn,
      member_count: additionalMembers.length + 1,
    });

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
    'SELECT team_id FROM team_members WHERE usn = ? OR TRIM(usn) = TRIM(?)'
  )
    .bind(dbUser.usn, dbUser.usn)
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
    problem_statement_id: team.problem_statement_id || null,
    members: members,
    status: team.status,
    is_locked: Boolean(team.is_locked),
    viewer_is_leader: team.leader_usn === dbUser.usn || String(team.leader_usn).trim() === String(dbUser.usn).trim(),
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

// ─── POST /teams/:id/members — Add a member ───────────────────────────────────

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

    await logAudit(c, 'TEAM_MEMBER_ADDED', teamId, {
      team_id: teamId,
      team_name: team.name,
      added_member_name: body.name,
      added_member_usn: body.usn,
    });

    return c.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return c.json({ detail: 'This USN is already registered in another team' }, 400);
    }
    return c.json({ detail: 'Failed to add member' }, 400);
  }
});

// ─── DELETE /teams/:id/members/:usn — Remove member ───────────────────────────

teamsRouter.delete('/:id/members/:usn', async (c) => {
  const teamId = c.req.param('id');
  const usn = c.req.param('usn');

  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

  const team = ownership.team;
  if (team.is_locked) return c.json({ detail: 'Team is locked — no changes allowed' }, 400);
  if (team.leader_usn === usn || String(team.leader_usn).trim() === String(usn).trim()) {
    return c.json({ detail: 'Cannot remove the team leader' }, 400);
  }

  await c.env.DB.prepare(
    'DELETE FROM team_members WHERE team_id = ? AND (usn = ? OR TRIM(usn) = TRIM(?))'
  )
    .bind(teamId, usn, usn)
    .run();

  await logAudit(c, 'TEAM_MEMBER_REMOVED', teamId, {
    team_id: teamId,
    team_name: team.name,
    removed_member_usn: usn,
  });

  return c.json({ success: true });
});

// ─── PATCH /teams/:id/lock — Lock / unlock team ───────────────────────────────

teamsRouter.patch('/:id/lock', async (c) => {
  const teamId = c.req.param('id');
  const ownership = await verifyTeamOwnership(c, teamId);
  if (!ownership.allowed) return ownership.response;

  const body = await c.req.json();
  const lock = Boolean(body.locked);

  if (lock) {
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
    .bind(lock ? 1 : 0, new Date().toISOString(), teamId)
    .run();

  await logAudit(c, lock ? 'TEAM_LOCKED' : 'TEAM_UNLOCKED', teamId, {
    team_id: teamId,
    team_name: ownership.team.name,
    is_locked: lock,
  });

  return c.json({ success: true });
});

// ─── POST /teams/:id/submissions — Submit PPT/Demo ────────────────────────────

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

  await logAudit(c, 'SUBMISSION_CREATED', teamId, {
    team_id: teamId,
    team_name: ownership.team.name,
    level,
    submission_url: url,
  });

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

  const team = await c.env.DB.prepare('SELECT name FROM teams WHERE id = ?').bind(teamId).first();

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

  await logAudit(c, 'SUBMISSION_REVIEWED', teamId, {
    team_id: teamId,
    team_name: team?.name || 'Unknown Team',
    level,
    pass,
    score,
    feedback,
  });

  return c.json({ success: true });
});

// ─── PATCH /teams/:id — Admin edit team details (Super Admin Only) ──────────────

teamsRouter.patch('/:id', async (c) => {
  const user = c.get('user');
  if (!isSuperAdminUser(user)) {
    return c.json({ detail: 'Forbidden — Super Admin privilege required to edit team attributes' }, 403);
  }

  const teamId = c.req.param('id');
  const body = await c.req.json();

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!team) return c.json({ detail: 'Team not found' }, 404);

  const newName = body.name ?? team.name;
  const newTheme = body.theme ?? team.theme;
  const newPsId = body.problem_statement_id !== undefined ? body.problem_statement_id : (team.problem_statement_id || null);
  const newStatus = body.status ?? team.status;

  await c.env.DB.prepare(
    `UPDATE teams SET name = ?, theme = ?, status = ?, problem_statement_id = ?, updated_at = ? WHERE id = ?`
  ).bind(newName, newTheme, newStatus, newPsId, new Date().toISOString(), teamId).run();

  const updatedTeam = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!updatedTeam) return c.json({ detail: 'Error retrieving updated team' }, 500);

  const { results: members } = await c.env.DB.prepare('SELECT * FROM team_members WHERE team_id = ?').bind(teamId).all();

  await logAudit(c, 'TEAM_EDITED', teamId, {
    team_id: teamId,
    team_name: updatedTeam.name,
    changes: {
      name: body.name !== undefined ? { old: team.name, new: newName } : undefined,
      theme: body.theme !== undefined ? { old: team.theme, new: newTheme } : undefined,
      problem_statement_id: body.problem_statement_id !== undefined ? { old: team.problem_statement_id, new: newPsId } : undefined,
      status: body.status !== undefined ? { old: team.status, new: newStatus } : undefined,
    },
  });

  return c.json({
    id: updatedTeam.id,
    name: updatedTeam.name,
    leader_id: updatedTeam.leader_usn,
    leader_usn: updatedTeam.leader_usn,
    theme: updatedTeam.theme,
    problem_statement_id: updatedTeam.problem_statement_id,
    members: members,
    status: updatedTeam.status,
    is_locked: Boolean(updatedTeam.is_locked),
    viewer_is_leader: false,
    level1: { status: updatedTeam.level1_status, score: updatedTeam.level1_score, feedback: updatedTeam.level1_feedback, submission_url: updatedTeam.level1_submission_url },
    level2: { status: updatedTeam.level2_status, score: updatedTeam.level2_score, feedback: updatedTeam.level2_feedback, submission_url: updatedTeam.level2_submission_url },
  });
});

// ─── DELETE /teams/:id — Admin Soft Delete Team (Super Admin Only) ────────────

teamsRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  if (!isSuperAdminUser(user)) {
    return c.json({ detail: 'Forbidden — Super Admin privilege required to delete teams' }, 403);
  }

  const teamId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const reason = body.reason || 'Admin soft delete';

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(teamId).first();
  if (!team) return c.json({ detail: 'Team not found' }, 404);

  const { results: members } = await c.env.DB.prepare('SELECT * FROM team_members WHERE team_id = ?').bind(teamId).all();

  const originalData = JSON.stringify({ team, members });
  const auditRef = crypto.randomUUID();

  // Save to deleted_teams
  await c.env.DB.prepare(
    `INSERT INTO deleted_teams (id, original_id, name, leader_usn, theme, original_data_json, deleted_by, deleted_at, reason, audit_reference)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    team.id,
    team.name,
    team.leader_usn,
    team.theme,
    originalData,
    user.email,
    new Date().toISOString(),
    reason,
    auditRef
  ).run();

  // Remove from teams & team_members (soft-deleted into deleted_teams)
  await c.env.DB.prepare('DELETE FROM team_members WHERE team_id = ?').bind(teamId).run();
  await c.env.DB.prepare('DELETE FROM teams WHERE id = ?').bind(teamId).run();

  await logAudit(c, 'TEAM_DELETED', teamId, {
    team_id: teamId,
    team_name: team.name,
    deleted_by: user.email,
    reason,
    audit_reference: auditRef,
  });

  return c.json({ success: true, message: 'Team soft-deleted successfully' });
});

// ─── GET /teams/deleted — List Soft-Deleted Teams (Super Admin Only) ──────────

teamsRouter.get('/deleted', async (c) => {
  const user = c.get('user');
  if (!isSuperAdminUser(user)) {
    return c.json({ detail: 'Forbidden — Super Admin privilege required to view deleted teams' }, 403);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM deleted_teams ORDER BY deleted_at DESC`
  ).all();

  return c.json(
    results.map((d: any) => {
      let data: any = {};
      try {
        data = JSON.parse(String(d.original_data_json || '{}'));
      } catch {
        data = {};
      }
      return {
        id: d.id,
        original_id: d.original_id,
        name: d.name,
        leader_usn: d.leader_usn,
        theme: d.theme,
        deleted_by: d.deleted_by,
        deleted_at: d.deleted_at,
        reason: d.reason,
        audit_reference: d.audit_reference,
        members: data.members || [],
      };
    })
  );
});

// ─── POST /teams/:id/restore — Restore Soft-Deleted Team (Super Admin Only) ───

teamsRouter.post('/:id/restore', async (c) => {
  const user = c.get('user');
  if (!isSuperAdminUser(user)) {
    return c.json({ detail: 'Forbidden — Super Admin privilege required to restore teams' }, 403);
  }

  const deletedId = c.req.param('id');
  const deletedRecord = await c.env.DB.prepare('SELECT * FROM deleted_teams WHERE id = ? OR original_id = ?')
    .bind(deletedId, deletedId)
    .first();

  if (!deletedRecord) return c.json({ detail: 'Deleted team record not found' }, 404);

  let data: any = {};
  try {
    data = JSON.parse(String(deletedRecord.original_data_json || '{}'));
  } catch {
    return c.json({ detail: 'Failed to parse original team data' }, 500);
  }

  const t = data.team;
  const members = data.members || [];

  // Re-insert into teams
  await c.env.DB.prepare(
    `INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, is_locked, level1_status, level1_score, level1_feedback, level1_submission_url, level1_reviewer_id, level1_reviewed_at, level2_status, level2_score, level2_feedback, level2_submission_url, level2_reviewer_id, level2_reviewed_at, problem_statement_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    t.id, t.name, t.leader_usn, t.leader_github_url || '', t.theme, t.members_json || '[]',
    t.status, t.is_locked || 0, t.level1_status || 'pending', t.level1_score, t.level1_feedback,
    t.level1_submission_url, t.level1_reviewer_id, t.level1_reviewed_at, t.level2_status || 'pending',
    t.level2_score, t.level2_feedback, t.level2_submission_url, t.level2_reviewer_id,
    t.level2_reviewed_at, t.problem_statement_id || null, t.created_at, new Date().toISOString()
  ).run();

  // Re-insert members
  for (const m of members) {
    await c.env.DB.prepare(
      `INSERT INTO team_members (id, team_id, name, email, usn, gender, department, year, role, github_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(m.id, m.team_id, m.name, m.email, m.usn, m.gender, m.department, m.year, m.role, m.github_url || '', m.created_at).run();
  }

  // Remove from deleted_teams
  await c.env.DB.prepare('DELETE FROM deleted_teams WHERE id = ?').bind(deletedRecord.id).run();

  await logAudit(c, 'TEAM_RESTORED', t.id, {
    team_id: t.id,
    team_name: t.name,
    restored_by: user.email,
  });

  return c.json({ success: true, message: 'Team restored successfully' });
});

// ─── GET /teams — Admin list with Complete Data Integrity Classification ─────

teamsRouter.get('/', async (c) => {
  const user = c.get('user');
  if (!['coordinator', 'spoc', 'admin'].includes(user.role)) {
    return c.json({ detail: 'Forbidden — Coordinator or higher required' }, 403);
  }

  // Fetch all registered users for registered vs pending member calculation
  const { results: allUsers } = await c.env.DB.prepare(
    'SELECT usn, email FROM users'
  ).all();

  const registeredUsns = new Set(allUsers.map((u: any) => u.usn ? String(u.usn).trim().toUpperCase() : '').filter(Boolean));
  const registeredEmails = new Set(allUsers.map((u: any) => u.email ? String(u.email).trim().toLowerCase() : '').filter(Boolean));

  // Fetch all teams (up to 1000 limit)
  const { results: teams } = await c.env.DB.prepare(
    `SELECT teams.*,
      (SELECT json_group_array(json_object('id', id, 'name', name, 'usn', usn, 'gender', gender, 'role', role, 'department', department, 'year', year, 'email', email, 'github_url', github_url))
       FROM team_members WHERE team_id = teams.id) as members_list
     FROM teams ORDER BY created_at DESC LIMIT 1000`
  ).all();

  // Find duplicate leader USNs across teams
  const leaderUsnCounts = new Map<string, number>();
  teams.forEach((t: any) => {
    const norm = String(t.leader_usn || '').trim().toUpperCase();
    if (norm) {
      leaderUsnCounts.set(norm, (leaderUsnCounts.get(norm) || 0) + 1);
    }
  });

  return c.json(
    teams.map((t: any) => {
      let members: any[] = [];
      try {
        const parsed = JSON.parse((t.members_list as string) || '[]');
        members = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        members = [];
      }

      let registeredMembersCount = 0;
      let pendingMembersCount = 0;

      const enrichedMembers = members.map((m: any) => {
        const cleanUsn = String(m.usn || '').trim().toUpperCase();
        const cleanEmail = String(m.email || '').trim().toLowerCase();
        const isRegistered = Boolean(cleanUsn && registeredUsns.has(cleanUsn)) || Boolean(cleanEmail && registeredEmails.has(cleanEmail));
        if (isRegistered) {
          registeredMembersCount++;
        } else {
          pendingMembersCount++;
        }
        return {
          ...m,
          usn: String(m.usn || '').trim(),
          has_whitespace: m.usn !== String(m.usn).trim(),
          is_registered_user: isRegistered,
        };
      });

      // Compute Data Integrity Classification Flags
      const flags: string[] = [];
      const findings: string[] = [];

      const normLeaderUsn = String(t.leader_usn || '').trim().toUpperCase();
      const hasDuplicateLeader = (leaderUsnCounts.get(normLeaderUsn) || 0) > 1;

      if (hasDuplicateLeader) {
        flags.push('DUPLICATE');
        findings.push(`Leader USN '${t.leader_usn}' is shared by multiple teams.`);
      }

      if (normLeaderUsn === '1NFWHDIW' || t.name === 'Warriors') {
        flags.push('TEST RECORD');
        findings.push('Developer test account / dummy registration.');
      }

      const whitespaceUsns = enrichedMembers.filter((m: any) => m.has_whitespace);
      if (t.leader_usn !== String(t.leader_usn).trim() || whitespaceUsns.length > 0) {
        flags.push('SPACED USN');
        findings.push('USN contains trailing/leading whitespace.');
      }

      if (enrichedMembers.length < 2) {
        flags.push('INCOMPLETE');
        findings.push(`Team has only ${enrichedMembers.length} member(s) (minimum 2 required).`);
      }

      const females = enrichedMembers.filter((m: any) => String(m.gender).toLowerCase() === 'female');
      if (females.length === 0) {
        flags.push('NO FEMALE MEMBER');
        findings.push('Zero female members in team roster (SIH requirement).');
      }

      if (flags.length === 0) {
        flags.push('VALID');
      }

      return {
        id: t.id,
        name: t.name,
        leader_usn: String(t.leader_usn || '').trim(),
        theme: t.theme,
        problem_statement_id: t.problem_statement_id || null,
        status: t.status,
        is_locked: Boolean(t.is_locked),
        members: enrichedMembers,
        data_integrity: {
          flags,
          findings,
          is_valid: flags.length === 1 && flags[0] === 'VALID',
          registered_members_count: registeredMembersCount,
          pending_members_count: pendingMembersCount,
          has_duplicate_leader: hasDuplicateLeader,
          is_test_record: flags.includes('TEST RECORD'),
        },
        level1: { status: t.level1_status, score: t.level1_score, feedback: t.level1_feedback, submission_url: t.level1_submission_url },
        level2: { status: t.level2_status, score: t.level2_score, feedback: t.level2_feedback, submission_url: t.level2_submission_url },
        created_at: t.created_at,
        updated_at: t.updated_at,
      };
    })
  );
});
