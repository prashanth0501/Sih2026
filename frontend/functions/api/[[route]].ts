import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

import type { AppEnv } from '../../src/backend/types';
import { authRouter } from '../../src/backend/auth';
import { teamsRouter } from '../../src/backend/teams';
import { contentRouter } from '../../src/backend/content';
import { promotionsRouter } from '../../src/backend/promotions';
import { statsRouter } from '../../src/backend/stats';

const app = new Hono<AppEnv>().basePath('/api/v1');

app.route('/auth', authRouter);
app.route('/teams', teamsRouter);
app.route('/content', contentRouter);
app.route('/promotions', promotionsRouter);
app.route('/stats', statsRouter);

export const onRequest = handle(app);
