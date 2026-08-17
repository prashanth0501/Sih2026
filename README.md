# Ignite — SIH 2026 Portal
### Nagarjuna College of Engineering & Technology

> The official internal portal for Smart India Hackathon 2026 — team registration, two-level screening, results, and student-led promotion sharing, built around one visual idea: **the Spark Thread**.

---

## 👥 Team

| Name | Role |
|---|---|
| **Partha Shankar** | Full Stack Developer — architecture, backend (Hono + Cloudflare D1), frontend, deployment |
| **Nirmith M Jain** | Frontend — helped with UI components and design |

---

## 🌐 Live Site

**[sih.ncet.co.in](https://sih.ncet.co.in)**

Deployed on **Cloudflare Pages** with **Cloudflare D1** as the database and **Cloudflare Workers** (via Hono) as the backend API — no separate server needed.

---

## ⚡ Quick Start (Local)

This project is a **single monorepo** — the frontend (Vite + React) and backend (Hono on Cloudflare Workers) both live in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

> The backend runs as **Cloudflare Pages Functions** locally via Wrangler — no Python, no separate server.
> API routes are served at `/api/v1/*` automatically by Vite's dev proxy.

For full local setup details (Wrangler D1, env vars, seeding), see [`RUN_LOCALLY.md`](RUN_LOCALLY.md).

---

## 🛠 Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| **Backend API** | [Hono](https://hono.dev/) on Cloudflare Workers (Pages Functions) |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **Auth** | JWT via `hono/jwt` — HS256, sessionStorage for staff, localStorage for participants |
| **Deployment** | Cloudflare Pages (frontend + functions + D1 all in one) |

---

## 🗂 Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── backend/        # Hono routers (auth, teams, content, promotions, stats)
│   │   ├── api/            # Axios API client (frontend → /api/v1/*)
│   │   ├── components/     # React UI components (NavBar, AppShell, etc.)
│   │   ├── pages/          # Route pages (public, dashboard, admin)
│   │   └── lib/            # Auth context, utilities, static data
│   ├── functions/
│   │   └── api/[[route]].ts  # Cloudflare Pages Functions entrypoint
│   ├── schema.sql          # D1 database schema
│   └── wrangler.toml       # Cloudflare config (D1 binding, JWT_SECRET)
├── RUN_LOCALLY.md
├── DEPLOYMENT.md
└── README.md
```

---

## 🔑 Demo Credentials (Local)

| Role | Email | Password |
|---|---|---|
| **Participant** | `participant@nagarjuna.edu` | `participant123` |
| **Coordinator / Admin** | See `ADMIN_CREDENTIALS.md` (gitignored) | — |

New participants can self-register at [/register](http://localhost:5173/register).

---

## 🗄 Database

The database is **Cloudflare D1** (SQLite). Schema is in [`frontend/schema.sql`](frontend/schema.sql).

Key tables: `users`, `teams`, `team_members`, `problem_statements`, `content_blocks`, `system_settings`, `promo_posts`, `announcements`, `promo_shares`.

To apply the schema to a local D1 instance:
```bash
cd frontend
npx wrangler d1 execute ignite-sih --local --file=schema.sql
```

---

## 📋 Roles & Access

| Role | Access |
|---|---|
| `participant` | Student dashboard, team management, submission uploads |
| `coordinator` | Admin console — screening, registrations, promotions, content |
| `spoc` | Full admin + final approval |

---

## 📝 Docs

> **Detailed documentation lives locally in `docs/`** (not pushed to GitHub — gitignored).
> Read the local docs before making non-trivial changes.

| Doc | Covers |
|---|---|
| `docs/ARCHITECTURE.md` | System overview, data flow, roles |
| `docs/FRONTEND.md` | Route table, component structure |
| `docs/BACKEND.md` | Hono routers, auth, screening state machine |
| `docs/API.md` | Every endpoint, auth level, payload shape |
| `docs/DESIGN_SYSTEM.md` | Spark Thread visual identity, palette, typography |
| `docs/CONTEXT.md` | Design decisions and deliberate reversals |
| `docs/SETUP.md` | Local setup, accounts, env vars |
| [`RUN_LOCALLY.md`](RUN_LOCALLY.md) | Step-by-step local run guide |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Cloudflare Pages deployment guide |

---

## 📄 License

Internal use — Nagarjuna College of Engineering & Technology, SIH 2026.
