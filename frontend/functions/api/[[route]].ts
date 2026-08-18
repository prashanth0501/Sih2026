import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

import type { AppEnv } from '../../src/backend/types';
import { authRouter } from '../../src/backend/auth';
import { teamsRouter } from '../../src/backend/teams';
import { contentRouter } from '../../src/backend/content';
import { promotionsRouter } from '../../src/backend/promotions';
import { statsRouter } from '../../src/backend/stats';
import { adminUsersRouter } from '../../src/backend/adminUsers';
import { securityHeadersMiddleware } from '../../src/backend/middleware/securityHeaders';
import { rateLimit } from '../../src/backend/middleware/rateLimit';

const app = new Hono<AppEnv>().basePath('/api/v1');

// Global Security Headers
app.use('*', securityHeadersMiddleware);

// Rate Limiters for Sensitive Endpoints
app.use(
  '/auth/login',
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many login attempts. Please wait 1 minute before trying again.',
  })
);

app.use(
  '/auth/forgot-password',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset requests. Please wait 1 hour before requesting again.',
  })
);

app.use(
  '/auth/resend-verification',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many email verification resend requests. Please check your inbox or wait 1 hour.',
  })
);

// Route Mounting
app.route('/auth', authRouter);
app.route('/teams', teamsRouter);
app.route('/content', contentRouter);
app.route('/promotions', promotionsRouter);
app.route('/stats', statsRouter);
app.route('/admin', adminUsersRouter);

export const onRequest = handle(app);
