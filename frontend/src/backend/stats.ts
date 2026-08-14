import { Hono } from 'hono';
import type { AppEnv } from './types';
import { authMiddleware } from './auth';

export const statsRouter = new Hono<AppEnv>();

statsRouter.get('/public', async (c) => {
  const teamsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM teams').first();
  const psCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM problem_statements').first();
  
  return c.json({
    teams_registered: (teamsCount?.count as number) || 0,
    ideas_submitted: (teamsCount?.count as number) || 0, // Mock: 1 idea per team roughly
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
  const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role="participant"').first();
  
  const level1Count = await c.env.DB.prepare('SELECT COUNT(*) as count FROM teams WHERE level1_status="passed"').first();
  const level2Count = await c.env.DB.prepare('SELECT COUNT(*) as count FROM teams WHERE level2_status="passed"').first();
  
  return c.json({
    total_teams: (teamsCount?.count as number) || 0,
    total_students: (usersCount?.count as number) || 0,
    by_stage: {
      registered: (teamsCount?.count as number) || 0,
      level1: (level1Count?.count as number) || 0,
      level2: (level2Count?.count as number) || 0,
      selected: 0
    },
    selected: 0
  });
});
