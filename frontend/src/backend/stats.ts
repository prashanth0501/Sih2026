import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const statsRouter = new Hono<AppEnv>();

statsRouter.get('/public', async (c) => {
  const teamsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM teams').first();
  const psCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM problem_statements').first();
  
  return c.json({
    teams_registered: (teamsCount?.count as number) || 0,
    ideas_submitted: (teamsCount?.count as number) || 0,
    problem_statements: (psCount?.count as number) || 0,
    days_to_deadline: 15
  });
});

statsRouter.get('/admin', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'spoc' && user.role !== 'coordinator') {
    return c.json({ detail: 'Forbidden' }, 403);
  }

  const teamsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM teams').first();
  const studentsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM team_members').first();
  
  const level1Count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM teams WHERE status IN ('l1_submitted', 'l1_cleared', 'l1_rejected', 'l2_submitted', 'selected', 'l2_rejected')"
  ).first();

  const level2Count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM teams WHERE status IN ('l2_submitted', 'selected', 'l2_rejected')"
  ).first();

  const selectedCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM teams WHERE status = 'selected'"
  ).first();

  const totalTeams = (teamsCount?.count as number) || 0;
  const totalStudents = (studentsCount?.count as number) || 0;

  return c.json({
    total_teams: totalTeams,
    total_students: totalStudents,
    by_stage: {
      registered: totalTeams,
      level1: (level1Count?.count as number) || 0,
      level2: (level2Count?.count as number) || 0,
      selected: (selectedCount?.count as number) || 0
    },
    selected: (selectedCount?.count as number) || 0
  });
});
