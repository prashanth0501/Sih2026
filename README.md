# Ignite — SIH 2026 Portal (Nagarjuna College of Engineering & Technology)

The Smart India Hackathon 2026 internal portal: promotion, awareness, registration, two-level screening, results, and student-led promotion — built around one visual idea, **the Spark Thread**.

Built by **Partha Shankar** (full-stack) and **Nirmith M Jain** (frontend design), students at this college and coordinators for its internal hackathon.

## Documentation

Detailed docs live in [`docs/`](docs/):

| Doc | Covers |
|---|---|
| [`RUN_LOCALLY.md`](RUN_LOCALLY.md) | Step-by-step local setup, backend & frontend start commands, test credentials |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System overview, tech stack, data flow, roles |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | Route table, component structure, mock-vs-real data |
| [`docs/BACKEND.md`](docs/BACKEND.md) | FastAPI structure, auth, the screening state machine |
| [`docs/API.md`](docs/API.md) | Every endpoint, method, auth level, and payload shape |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | The Spark Thread concept, palette, type, interaction patterns |
| [`docs/CONTEXT.md`](docs/CONTEXT.md) | Why things are the way they are — decisions and reversals made along the way |
| [`docs/SETUP.md`](docs/SETUP.md) | Local setup, accounts, env vars, deploy targets |

`ARCHITECTURE.md.pdf` (repo root) is the original pre-build spec; the docs above describe what was actually built, including where it diverges.

## Quick start

**Backend** (from `backend/`):
```bash
py -m venv venv
./venv/Scripts/pip install -r requirements.txt
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (from `frontend/`):
```bash
npm install
npm run dev
```

App at `http://localhost:5173`, API docs at `http://localhost:8000/docs`. Both need to be running — see [`docs/SETUP.md`](docs/SETUP.md) for accounts and env vars.

## Stack

React + TypeScript + Vite + Tailwind v4 (frontend) · FastAPI + JWT + bcrypt (backend) · in-memory store for now, MongoDB Atlas is the swap-in point. Full breakdown in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Status, honestly

Auth, teams, team members, the full screening state machine, and "Spread the Spark" (no-login promo sharing) are real, end-to-end, against the FastAPI backend. The admin registrations table runs on a 1,247-row synthetic roster (to prove the UI holds up at scale without needing 1,247 real signups), and the dashboard's team-status view is derived from your email rather than the team you actually registered. Both are called out explicitly, with the reasoning, in [`docs/CONTEXT.md`](docs/CONTEXT.md) and [`docs/FRONTEND.md`](docs/FRONTEND.md). MongoDB Atlas and Cloudinary aren't wired in yet.
