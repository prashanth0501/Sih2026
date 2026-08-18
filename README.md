# Ignite — SIH 2026 Portal
### Nagarjuna College of Engineering & Technology

> The official internal portal for Smart India Hackathon 2026 — team registration, two-level internal screening process, results, and student-led promotion sharing, built around one visual idea: **the Spark Thread**.

---

## 👥 Team & Credits

| Name | Role |
|---|---|
| **Partha Shankar** | Full Stack Developer — architecture, backend (Hono + Cloudflare D1), frontend, deployment |
| **Nirmith M Jain** | Frontend — helped with UI components and design |

---

## 🌐 Live Site

**[sih.ncet.co.in](https://sih.ncet.co.in)**

Deployed on **Cloudflare Pages** with **Cloudflare D1** database and **Cloudflare Workers** (via Hono API framework) — 100% serverless at the edge.

---

## ⚡ Quick Start (Local)

This project is a **single monorepo** — the frontend (Vite + React 19) and backend API (Hono on Cloudflare Workers) both live inside `frontend/`.

```bash
# 1. Enter frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start local dev server
npm run dev
```

App runs locally at: **http://localhost:5173**

---

## 🛠 Stack Overview

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| **Backend API** | [Hono](https://hono.dev/) on Cloudflare Workers / Pages Functions |
| **Database** | Cloudflare D1 (Edge SQLite database) |
| **Auth** | JWT via `hono/jwt` — HS256 + Web Crypto PBKDF2 password hashing |
| **Deployment** | Cloudflare Pages (`sih` project) |

---

## 📁 Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── backend/          # Hono API routers (auth, teams, content, promotions, stats)
│   │   ├── api/              # Axios API client (frontend → /api/v1/*)
│   │   ├── components/       # React UI components (NavBar, AppShell, etc.)
│   │   ├── pages/            # Route pages (public, dashboard, admin)
│   │   └── lib/              # Auth context, utilities, static data
│   ├── functions/
│   │   └── api/[[route]].ts    # Cloudflare Pages Functions entrypoint
│   ├── schema.sql            # D1 database schema DDL & seed data
│   └── wrangler.toml         # Cloudflare environment configuration
└── README.md                 # Root repository README
```

---

## 🔑 Demo Credentials (Local)

| Role | Email | Password |
|---|---|---|
| **Participant** | `participant@nagarjuna.edu` | `participant123` |
| **Coordinator / Admin** | See local `ADMIN_CREDENTIALS.md` | — |

---

## 📄 License

Internal use — Nagarjuna College of Engineering & Technology, SIH 2026.
