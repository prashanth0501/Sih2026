/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  user: any;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath('/api/v1');

// === Auth Middleware ===
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ detail: 'Missing token' }, 401);
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'dev-only-secret-change-me', "HS256");
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ detail: 'Invalid token' }, 401);
  }
};

// === Content & Settings Routes ===
app.get('/content/settings', async (c) => {
  const settings = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = ?')
    .bind('global_settings').first();
    
  if (!settings) {
    return c.json({
      registration_open: true,
      level1_open: true,
      level2_open: true,
    });
  }

  return c.json({
    registration_open: Boolean(settings.registration_open),
    level1_open: Boolean(settings.level1_open),
    level2_open: Boolean(settings.level2_open),
  });
});

app.get('/content/:slug', async (c) => {
  const slug = c.req.param('slug');
  const block = await c.env.DB.prepare('SELECT * FROM content_blocks WHERE slug = ?').bind(slug).first();
  if (!block) return c.json({ detail: 'Not found' }, 404);
  return c.json({
    id: block.id,
    slug: block.slug,
    type: block.type,
    payload: JSON.parse(block.payload_json as string)
  });
});

// === Auth Routes ===
app.post('/auth/signup', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  
  // Basic validation
  if (!body.email || !body.password) return c.json({ detail: 'Missing email/password' }, 400);

  // Note: For a real app, hash the password using WebCrypto or a library compatible with Workers.
  // We use a simple hash fallback for demo if bcrypt is missing.
  const password_hash = body.password; // INSECURE: implement hashing

  try {
    await c.env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, year, usn, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, body.email, password_hash, 'participant', 
      body.department || 'CSE', body.year || 1, body.usn || '', new Date().toISOString()
    ).run();

    const token = await sign({ sub: id, email: body.email, role: 'participant' }, c.env.JWT_SECRET || 'dev-only-secret-change-me', "HS256");
    return c.json({ access_token: token, token_type: 'bearer' });
  } catch (err: any) {
    return c.json({ detail: 'Email already registered or DB error' }, 400);
  }
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first();
  
  if (!user || user.password_hash !== body.password) {
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  const token = await sign({ sub: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET || 'dev-only-secret-change-me', "HS256");
  return c.json({ access_token: token, token_type: 'bearer' });
});

app.get('/auth/me', authMiddleware, async (c) => {
  const user: any = c.get('user');
  const dbUser = await c.env.DB.prepare('SELECT id, name, email, role, department, year, usn FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'User not found' }, 404);
  return c.json(dbUser);
});

// === Teams Routes ===
app.post('/teams', authMiddleware, async (c) => {
  const body = await c.req.json();
  const user: any = c.get('user');
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(`
      INSERT INTO teams (id, name, leader_usn, leader_github_url, theme, members_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, body.leader_usn, body.leader_github_url, body.theme,
      JSON.stringify(body.members || []), 'registered', new Date().toISOString(), new Date().toISOString()
    ).run();

    return c.json({ id, status: 'registered' });
  } catch (err: any) {
    return c.json({ detail: 'Failed to create team' }, 400);
  }
});

app.get('/teams/my-team', authMiddleware, async (c) => {
  const user: any = c.get('user');
  
  // Since we don't have MongoDB's array searching easily without JSON_EACH, 
  // we do a simple fallback: find if user is leader by USN
  const dbUser = await c.env.DB.prepare('SELECT usn FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'Not found' }, 404);

  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE leader_usn = ?').bind(dbUser.usn).first();
  if (!team) return c.json(null);

  return c.json({
    id: team.id,
    name: team.name,
    status: team.status,
    members: JSON.parse(team.members_json as string),
    level1: { status: team.level1_status, score: team.level1_score },
    level2: { status: team.level2_status, score: team.level2_score },
  });
});

export const onRequest = handle(app);
