/// <reference types="@cloudflare/workers-types" />

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export type Variables = {
  user: {
    sub: string;
    email: string;
    role: string;
  };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
