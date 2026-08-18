import type { Context, Next } from 'hono';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

export function rateLimit(options: {
  windowMs: number;
  max: number;
  keyGenerator?: (c: Context) => Promise<string> | string;
  message?: string;
}) {
  const { windowMs, max, message = 'Too many requests. Please try again later.' } = options;

  return async (c: Context, next: Next) => {
    const key = options.keyGenerator
      ? await options.keyGenerator(c)
      : c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';

    const fullKey = `${c.req.path}:${key}`;
    const now = Date.now();

    // Lazy cleanup of expired entries
    if (memoryStore.size > 500) {
      for (const [k, store] of memoryStore.entries()) {
        if (now > store.resetTime) {
          memoryStore.delete(k);
        }
      }
    }

    let record = memoryStore.get(fullKey);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      memoryStore.set(fullKey, record);
    } else {
      record.count++;
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - record.count)));

    if (record.count > max) {
      return c.json({ detail: message }, 429);
    }

    await next();
  };
}
