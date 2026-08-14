import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { AppEnv } from './types';

export const authRouter = new Hono<AppEnv>();

// === Auth Middleware ===
export const authMiddleware = async (c: any, next: any) => {
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

authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  
  if (!body.email || !body.password) return c.json({ detail: 'Missing email/password' }, 400);

  const password_hash = body.password; // INSECURE: Simple fallback for now

  try {
    await c.env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, year, usn, github_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.name, body.email, password_hash, 'participant', 
      body.department || 'CSE', body.year || 1, body.usn || null, body.github_url || null, new Date().toISOString()
    ).run();

    const token = await sign({ sub: id, email: body.email, role: 'participant' }, c.env.JWT_SECRET || 'dev-only-secret-change-me', "HS256");
    
    // Fetch the inserted user to return
    const user = await c.env.DB.prepare('SELECT id, name, email, role, department, year, usn, github_url FROM users WHERE id = ?').bind(id).first();
    
    return c.json({ access_token: token, token_type: 'bearer', user });
  } catch (err: any) {
    return c.json({ detail: 'Email already registered or DB error' }, 400);
  }
});

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first();
  
  if (!user || user.password_hash !== body.password) {
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  const token = await sign({ sub: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET || 'dev-only-secret-change-me', "HS256");
  
  const returnUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    year: user.year,
    usn: user.usn,
    github_url: user.github_url
  };
  
  return c.json({ access_token: token, token_type: 'bearer', user: returnUser });
});

authRouter.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const dbUser = await c.env.DB.prepare('SELECT id, name, email, role, department, year, usn, github_url FROM users WHERE email = ?').bind(user.email).first();
  if (!dbUser) return c.json({ detail: 'User not found' }, 404);
  return c.json(dbUser);
});
