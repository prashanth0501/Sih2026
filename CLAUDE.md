# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ignite — the Smart India Hackathon 2026 internal portal for Nagarjuna College of Engineering & Technology (promotion, registration, two-level screening, results, student-led promotion sharing). React + TypeScript frontend, FastAPI backend, monorepo with no shared build step between them.

Full docs live in `docs/` — read these before making non-trivial changes, they contain reasoning this file doesn't repeat:
- `docs/ARCHITECTURE.md` — system overview, data flow, roles, the one deliberate deviation from the original spec (bcrypt vs passlib)
- `docs/FRONTEND.md` — route table, component structure, **the mock-vs-real data split** (important — see below)
- `docs/BACKEND.md` — FastAPI structure, auth, the screening state machine
- `docs/API.md` — every endpoint, auth level, payload shape
- `docs/DESIGN_SYSTEM.md` — the "Spark Thread" visual identity, palette, type, interaction patterns
- `docs/CONTEXT.md` — why things are the way they are; several features were built one way, then explicitly reversed based on feedback — read this before "fixing" something that looks wrong but was intentional
- `docs/SETUP.md` — accounts, env vars, deploy targets

`ARCHITECTURE.md.pdf` (repo root) is the original pre-build spec; the `docs/` files above describe what was actually built, including where it diverges.

## Commands

**Frontend** (from `frontend/`):
```bash
npm install
npm run dev          # Vite dev server, http://localhost:5173, proxies /api/* to :8000
npm run build        # tsc -b && vite build
npx tsc --noEmit -p tsconfig.app.json   # type-check only — the fastest way to verify a change didn't break anything
npm run lint         # oxlint
```
There is no frontend test suite. Verification during development has been `tsc --noEmit` plus ad hoc Playwright smoke scripts (not checked into the repo).

**Backend** (from `backend/`):
```bash
py -m venv venv
./venv/Scripts/pip install -r requirements.txt
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```
API docs (Swagger UI) at `http://localhost:8000/docs` — the fastest way to exercise an endpoint manually. There is no backend test suite either.

**Both need to be running simultaneously** for anything backend-backed (login, registration, team/screening/promotion flows) to work in the frontend.

## Architecture, in brief

- **RBAC**: `participant < coordinator < spoc` (rank order in `backend/app/models/user.py`; there is no separate `admin` rank in practice — see `docs/ARCHITECTURE.md`). Every protected backend route uses `require_role(minimum)`.
- **Two login surfaces don't overlap on purpose**: `/login` (public) and `/admin` (unlinked, type-the-URL-to-reach-it) call the same `POST /auth/login`, but each frontend page checks the returned role and immediately calls `logout()` + shows a generic error if the role doesn't belong there. Don't "fix" this into a redirect — it's deliberate (see `docs/CONTEXT.md`).
- **The screening state machine** (`backend/app/services/screening.py`) is the only code allowed to move a team between statuses; `ALLOWED_TRANSITIONS` in `backend/app/models/team.py` is the source of truth for legal moves.
- **Database is in-memory** (`backend/app/db/memory.py`) — a plain Python dict store, not MongoDB yet. Every router calls functions on this module rather than touching dicts directly, so it's the only file that needs to change when Atlas gets wired in. Data resets on every backend restart.
- **`frontend/src/lib/data.ts` mixes real static content with one large synthetic dataset**: the 1,247-row `TEAMS` roster (seeded PRNG, stable across reloads) exists purely to prove the admin Registrations table holds up at scale — it is not real data, and `getMyTeam(email)` (used by the dashboard) derives a fake "your team" by hashing the logged-in email rather than looking up what that user actually registered. Check `docs/FRONTEND.md` for exactly what's mock vs. real before changing dashboard/admin pages.
- **`.eyebrow` / `.lede` CSS classes** and the **`.lattice` / `.margin-rail` background treatment** (`frontend/src/index.css`) are used globally (via `PublicLayout`) instead of per-page styling, specifically so a site-wide style change is a one-place edit — keep using them rather than reintroducing one-off page styles.
- **Team members don't get logins.** Only the team leader authenticates; members are embedded data on the team document, added/removed only by the leader (`POST/DELETE /teams/{id}/members/...`), capped at 5 (+ leader = 6 total, the official SIH team-size rule).
- **"Spread the Spark" (`/spread-the-spark`) is intentionally unauthenticated** — a student submits name + USN directly, no login. The backend detects the social platform from the submitted URL's hostname server-side (`detect_platform()` in `backend/app/routers/promotions.py`); never trust a client-supplied platform value.

## Working conventions specific to this repo

- Path alias `@/` → `frontend/src/` (configured in both `vite.config.ts` and `tsconfig.app.json` — keep both in sync if it ever changes).
- Fonts (Fraunces, IBM Plex Sans, IBM Plex Mono) are self-hosted in `frontend/public/fonts/` — don't add a Google Fonts `<link>`.
- Theme images (`frontend/public/themes/*.webp`) are downloaded, real, CC-licensed photos with attribution recorded in `frontend/public/themes/SOURCES.json` — if regenerating any of these, see `docs/CONTEXT.md` for two real gotchas already hit (Wikimedia's upload CDN rate-limits automated fetching; blind top-search-result selection produced some badly mismatched images that needed manual review).
- `ADMIN_CREDENTIALS.md` (repo root) is gitignored and holds the real passwords for the three seeded staff accounts (Partha Shankar, Nirmith M Jain, Bhargav R) — never put those passwords in a tracked file.
