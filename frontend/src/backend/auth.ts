import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { AppEnv } from './types';
import { logAudit } from './audit';
import { CentralEmailService } from './services/email/emailService';

export const authRouter = new Hono<AppEnv>();

// Valid departments — must match frontend list
const VALID_DEPARTMENTS = [
  'CSE', 'ISE', 'AI & ML', 'ECE', 'EEE',
  'Mechanical', 'Civil', 'Biotech',
  'BCA', 'MCA', 'MBA', 'Data Science',
];

// ─── Password Strength Policy (Enforced strictly for NEW signups & resets) ──────

export function validatePasswordPolicy(password: string): { valid: boolean; message?: string } {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number' };
  }
  return { valid: true };
}

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
    // Plaintext fallback for legacy / pre-seeded accounts
    if (stored === plain) return true;

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

    // Constant-time hash comparison to prevent side-channel timing attacks
    if (newHash.length !== hashHex.length) return false;
    let diff = 0;
    for (let i = 0; i < newHash.length; i++) {
      diff |= newHash.charCodeAt(i) ^ hashHex.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

function generateSecureToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Dual-Format Auth Middleware (Supports both Legacy & Hardened Tokens) ─────

export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return c.json({ detail: 'Missing authentication token' }, 401);

  try {
    const payload = await verify(
      token,
      c.env.JWT_SECRET || 'dev-only-secret-change-me',
      'HS256'
    );

    // 1. Validate expiration if present (hardened tokens)
    if (payload.exp && typeof payload.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (nowSeconds > payload.exp) {
        return c.json({ detail: 'Session expired. Please log in again.' }, 401);
      }
    }

    // 2. Lookup user in DB to verify account status (active vs disabled)
    const user = await c.env.DB.prepare(
      'SELECT id, email, role, is_disabled FROM users WHERE email = ?'
    )
      .bind(payload.email)
      .first();

    if (!user) return c.json({ detail: 'User account not found' }, 401);
    if (user.is_disabled) {
      return c.json({ detail: 'Your account has been disabled. Please contact administrator support.' }, 401);
    }

    c.set('user', {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...payload,
    });
    await next();
  } catch {
    return c.json({ detail: 'Invalid or expired authentication token' }, 401);
  }
};

// ─── POST /auth/register ───────────────────────────────────────────────────────

authRouter.post('/register', async (c) => {
  const body = await c.req.json();

  if (!body.email || !body.password) {
    return c.json({ detail: 'Email and password are required' }, 400);
  }

  // Password Policy Check
  const passCheck = validatePasswordPolicy(body.password);
  if (!passCheck.valid) {
    return c.json({ detail: passCheck.message }, 400);
  }

  if (body.department && !VALID_DEPARTMENTS.includes(body.department)) {
    return c.json({ detail: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}` }, 400);
  }

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(body.password);
  const emailClean = String(body.email).toLowerCase().trim();

  // Generate Email Verification Token
  const verification_token = generateSecureToken();
  const verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, department, year, usn, gender, github_url, email_verified, email_verified_at, verification_token, verification_expires_at, is_disabled, failed_login_attempts, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.name || '',
        emailClean,
        password_hash,
        'participant',
        body.department || 'CSE',
        body.year || 1,
        body.usn ? String(body.usn).toUpperCase() : null,
        body.gender || 'Not Specified',
        body.github_url || null,
        0, // email_verified
        null,
        verification_token,
        verification_expires_at,
        0,
        0,
        new Date().toISOString()
      )
      .run();

    // Dispatch Email Verification via Central Email Service
    const emailService = CentralEmailService.fromEnv(c.env);
    const appUrl = c.env.APP_URL || 'http://localhost:5173';
    await emailService.sendVerificationEmail({
      to: emailClean,
      userName: body.name || 'Participant',
      token: verification_token,
      appUrl,
    });

    // Issue Hardened JWT with 24h Expiry
    const nowSeconds = Math.floor(Date.now() / 1000);
    const secret = c.env.JWT_SECRET || 'dev-only-secret-change-me';
    const token = await sign(
      {
        sub: id,
        email: emailClean,
        role: 'participant',
        iss: 'ignite-sih',
        aud: 'ignite-portal',
        iat: nowSeconds,
        exp: nowSeconds + 24 * 3600,
      },
      secret,
      'HS256'
    );

    const user = await c.env.DB.prepare(
      'SELECT id, name, email, role, department, year, usn, gender, github_url, email_verified FROM users WHERE id = ?'
    )
      .bind(id)
      .first();

    await logAudit(c, 'REGISTER_SUCCESS', id, { email: emailClean });
    await logAudit(c, 'VERIFICATION_SENT', id, { email: emailClean });

    return c.json({ access_token: token, token_type: 'bearer', user, email_verification_required: true });
  } catch (err: any) {
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

  const emailClean = String(body.email).toLowerCase().trim();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    .bind(emailClean)
    .first();

  if (!user) {
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  // Check Account Disabled State
  if (user.is_disabled) {
    return c.json({ detail: 'Your account has been disabled. Please contact administrator support.' }, 401);
  }

  // Check Account Lockout State (10 failed attempts -> 15 min lock)
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until as string).getTime();
    if (Date.now() < lockTime) {
      const remainingMinutes = Math.ceil((lockTime - Date.now()) / (60 * 1000));
      return c.json(
        { detail: `Account is temporarily locked due to repeated failed login attempts. Try again in ${remainingMinutes} minute(s) or reset your password.` },
        401
      );
    }
  }

  const passwordOk = await verifyPassword(body.password, user.password_hash as string);
  if (!passwordOk) {
    const attempts = ((user.failed_login_attempts as number) || 0) + 1;
    let locked_until: string | null = null;

    if (attempts >= 10) {
      locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins lock
      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?'
      )
        .bind(attempts, locked_until, user.id)
        .run();

      await logAudit(c, 'ACCOUNT_LOCKED', user.id as string, { email: emailClean, attempts });

      return c.json(
        { detail: 'Account locked due to 10 consecutive failed login attempts. Please wait 15 minutes or reset your password.' },
        401
      );
    } else {
      await c.env.DB.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?')
        .bind(attempts, user.id)
        .run();
    }

    await logAudit(c, 'LOGIN_FAILED', user.id as string, { email: emailClean });
    return c.json({ detail: 'Incorrect email or password' }, 401);
  }

  // Reset Failed Attempts Counter on Successful Password Verification
  await c.env.DB.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?')
    .bind(user.id)
    .run();

  // Issue Hardened JWT with 24h Expiry
  const nowSeconds = Math.floor(Date.now() / 1000);
  const secret = c.env.JWT_SECRET || 'dev-only-secret-change-me';
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iss: 'ignite-sih',
      aud: 'ignite-portal',
      iat: nowSeconds,
      exp: nowSeconds + 24 * 3600,
    },
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
    email_verified: Boolean(user.email_verified),
  };

  await logAudit(c, 'LOGIN_SUCCESS', user.id as string, { email: emailClean });

  return c.json({ access_token: token, token_type: 'bearer', user: returnUser });
});

// ─── GET /auth/me ──────────────────────────────────────────────────────────────

authRouter.get('/me', authMiddleware, async (c) => {
  const jwtUser = c.get('user');
  const dbUser = await c.env.DB.prepare(
    'SELECT id, name, email, role, department, year, usn, gender, github_url, email_verified FROM users WHERE email = ?'
  )
    .bind(jwtUser.email)
    .first();

  if (!dbUser) return c.json({ detail: 'User not found' }, 404);
  return c.json(dbUser);
});

// ─── POST /auth/resend-verification ────────────────────────────────────────────

authRouter.post('/resend-verification', authMiddleware, async (c) => {
  const jwtUser = c.get('user');
  const user = await c.env.DB.prepare('SELECT id, name, email, email_verified FROM users WHERE email = ?')
    .bind(jwtUser.email)
    .first();

  if (!user) return c.json({ detail: 'User not found' }, 404);
  if (user.email_verified) {
    return c.json({ detail: 'Your email address is already verified' }, 400);
  }

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    'UPDATE users SET verification_token = ?, verification_expires_at = ? WHERE id = ?'
  )
    .bind(token, expiresAt, user.id)
    .run();

  const emailService = CentralEmailService.fromEnv(c.env);
  const appUrl = c.env.APP_URL || 'http://localhost:5173';
  await emailService.sendVerificationEmail({
    to: user.email as string,
    userName: (user.name as string) || 'Participant',
    token,
    appUrl,
  });

  await logAudit(c, 'VERIFICATION_SENT', user.id as string, { email: user.email });

  return c.json({ success: true, message: 'Verification link sent to your email address' });
});

// ─── GET /auth/verify-email ────────────────────────────────────────────────────

authRouter.get('/verify-email', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ detail: 'Verification token is required' }, 400);

  const user = await c.env.DB.prepare('SELECT id, email, verification_expires_at FROM users WHERE verification_token = ?')
    .bind(token)
    .first();

  if (!user) {
    return c.json({ detail: 'Invalid or expired verification link' }, 400);
  }

  if (user.verification_expires_at) {
    const expiresTime = new Date(user.verification_expires_at as string).getTime();
    if (Date.now() > expiresTime) {
      return c.json({ detail: 'Verification link has expired. Please request a new link.' }, 400);
    }
  }

  await c.env.DB.prepare(
    'UPDATE users SET email_verified = 1, email_verified_at = ?, verification_token = NULL, verification_expires_at = NULL WHERE id = ?'
  )
    .bind(new Date().toISOString(), user.id)
    .run();

  await logAudit(c, 'EMAIL_VERIFIED', user.id as string, { email: user.email });

  return c.json({ success: true, message: 'Email verified successfully! You can now access all portal features.' });
});

// ─── POST /auth/forgot-password ────────────────────────────────────────────────

authRouter.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  if (!body.email) {
    return c.json({ detail: 'Email address is required' }, 400);
  }

  const emailClean = String(body.email).toLowerCase().trim();
  const genericResponse = { detail: 'If an account with that email exists, a password reset link has been sent.' };

  const user = await c.env.DB.prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)')
    .bind(emailClean)
    .first();

  if (!user) {
    // Return generic message to prevent email enumeration attacks
    return c.json(genericResponse);
  }

  const resetToken = generateSecureToken();
  const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await c.env.DB.prepare(
    'UPDATE users SET password_reset_token = ?, password_reset_expires_at = ? WHERE id = ?'
  )
    .bind(resetToken, resetExpiresAt, user.id)
    .run();

  const emailService = CentralEmailService.fromEnv(c.env);
  const appUrl = c.env.APP_URL || 'http://localhost:5173';
  await emailService.sendPasswordResetEmail({
    to: user.email as string,
    userName: (user.name as string) || 'User',
    token: resetToken,
    appUrl,
  });

  await logAudit(c, 'PASSWORD_RESET_REQUESTED', user.id as string, { email: emailClean });

  return c.json(genericResponse);
});

// ─── GET /auth/verify-reset-token ──────────────────────────────────────────────

authRouter.get('/verify-reset-token', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ detail: 'Reset token is required' }, 400);

  const user = await c.env.DB.prepare('SELECT id, password_reset_expires_at FROM users WHERE password_reset_token = ?')
    .bind(token)
    .first();

  if (!user) {
    return c.json({ detail: 'Invalid or expired password reset token' }, 400);
  }

  if (user.password_reset_expires_at) {
    const expiresTime = new Date(user.password_reset_expires_at as string).getTime();
    if (Date.now() > expiresTime) {
      return c.json({ detail: 'Password reset link has expired. Please request a new one.' }, 400);
    }
  }

  return c.json({ valid: true });
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────

authRouter.post('/reset-password', async (c) => {
  const body = await c.req.json();
  if (!body.token || !body.new_password) {
    return c.json({ detail: 'Reset token and new password are required' }, 400);
  }

  // Password Policy Check
  const passCheck = validatePasswordPolicy(body.new_password);
  if (!passCheck.valid) {
    return c.json({ detail: passCheck.message }, 400);
  }

  const user = await c.env.DB.prepare('SELECT id, name, email, password_reset_expires_at FROM users WHERE password_reset_token = ?')
    .bind(body.token)
    .first();

  if (!user) {
    return c.json({ detail: 'Invalid or expired password reset token' }, 400);
  }

  if (user.password_reset_expires_at) {
    const expiresTime = new Date(user.password_reset_expires_at as string).getTime();
    if (Date.now() > expiresTime) {
      return c.json({ detail: 'Password reset link has expired. Please request a new one.' }, 400);
    }
  }

  const newHash = await hashPassword(body.new_password);

  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL, failed_login_attempts = 0, locked_until = NULL WHERE id = ?'
  )
    .bind(newHash, user.id)
    .run();

  const userAgent = c.req.header('user-agent') || 'Web Browser';
  const emailService = CentralEmailService.fromEnv(c.env);
  await emailService.sendPasswordChangedEmail({
    to: user.email as string,
    userName: (user.name as string) || 'User',
    userAgent,
  });

  await logAudit(c, 'PASSWORD_RESET_COMPLETED', user.id as string, { email: user.email });

  return c.json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
});
