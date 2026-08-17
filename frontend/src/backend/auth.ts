import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { AppEnv } from './types';

export const authRouter = new Hono<AppEnv>();

// ─── Password helpers (Web Crypto PBKDF2 — available in all CF Workers) ───────

async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(plain),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const toHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return `${toHex(salt.buffer)}:${toHex(bits)}`;
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(plain),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const newHash = Array.from(new Uint8Array(bits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return newHash === hashHex;
  } catch {
    return false;
  }
}

// ─── Auth Middleware ───────────────────────────────────────────────────────────

export const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ detail: 'Missing token' }, 401);
  try {
    const payload = await verify(
      token,
      c.env.JWT_SECRET || 'dev-only-secret-change-me',
      'HS256'
    );
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ detail: 'Invalid or expired token' }, 401);
  }
};

// ─── POST /auth/register ───────────────────────────────────────────────────────

authRouter.post('/register', async (c) => {
  const body = await c.req.json();

  if (!body.email || !body.password) {
    return c.json({ detail: 'Email and password are required' }, 400);
  }
  if (typeof body.password !== 'string' || body.password.length < 8) {
    return c.json({ detail: 'Password must be at least 8 characters' }, 400);
  }

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(body.password);

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, department, year, usn, gender, github_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.name || '',
        body.email.toLowerCase().trim(),
        password_hash,
        'participant',
        body.department || 'CSE',
        body.year || 1,
        body.usn ? String(body.usn).toUpperCase() : null,
        body.gender || 'Not Specified',
        body.github_url || null,
        new Date().toISOString()
      )
      .run();

    const secret = c.env.JWT_SECRET || 'dev-only-secret-change-me';
    const token = await sign({ sub: id, email: body.email, role: 'participant' }, secret, 'HS256');

    const user = await c.env.DB.prepare(
      'SELECT id, name, email, role, department, year, usn, gender, github_url FROM users WHERE id = ?'
    )
      .bind(id)
      .first();

    return c.json({ access_token: token, token_type: 'bearer', user });
  } catch (err: any) {
    // SQLite UNIQUE constraint on email
    if (err?.message?.includes('UNIQUE') || err?.message?.includes('unique')) {
      return c.json({ detail: 'This email is already registered. Please log in instead.' }, 400);
    }
    return c.json({ detail: 'Registration failed — please try again.' }, 400);
  }
});

// ─── POST /auth/login ──────────────────────────────────────────────────────────

authRouter.post('/login', async (c) => {
  const body = await c.req.json();

  if (!body.email || !body.password) {
    return c.json({ detail: 'Email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(body.email.toLowerCase().trim())
    .first();

  if (!user) {
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  const passwordOk = await verifyPassword(body.password, user.password_hash as string);
  if (!passwordOk) {
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  const secret = c.env.JWT_SECRET || 'dev-only-secret-change-me';
  const token = await sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    'HS256'
  );

  const returnUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    year: user.year,
    usn: user.usn,
    gender: user.gender,
    github_url: user.github_url,
  };

  return c.json({ access_token: token, token_type: 'bearer', user: returnUser });
});

// ─── GET /auth/me ──────────────────────────────────────────────────────────────

authRouter.get('/me', authMiddleware, async (c) => {
  const jwtUser = c.get('user');
  const dbUser = await c.env.DB.prepare(
    'SELECT id, name, email, role, department, year, usn, gender, github_url FROM users WHERE email = ?'
  )
    .bind(jwtUser.email)
    .first();

  if (!dbUser) return c.json({ detail: 'User not found' }, 404);
  return c.json(dbUser);
});
