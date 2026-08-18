/// <reference types="@cloudflare/workers-types" />

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  APP_URL?: string;
  FROM_EMAIL?: string;
};

export type Variables = {
  user: {
    sub?: string;
    id?: string;
    email: string;
    role: string;
  };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
