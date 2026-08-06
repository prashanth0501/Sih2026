# Architecture

## What this is

Ignite is the Smart India Hackathon 2026 internal portal for Nagarjuna College of Engineering & Technology: promotion, awareness, team registration, a two-level internal screening process, and results — all built around one visual idea, **the Spark Thread** (see `docs/DESIGN_SYSTEM.md`).

The original system design lives in `ARCHITECTURE.md.pdf` at the project root (the pre-build spec). This file documents what was actually built, which extends that spec in a few places (see "Where this diverges from the original spec" below).

## Monorepo layout

```
sih/
  frontend/            React + TypeScript + Vite
  backend/              FastAPI (Python)
  docs/                 this folder
  ARCHITECTURE.md.pdf  original pre-build system design
  README.md             quick-start
  ADMIN_CREDENTIALS.md  gitignored — real passwords for the 3 admin accounts
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React 19 + TypeScript, Vite | fast dev loop, no SSR needed for an internal tool |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) | design tokens live in `frontend/src/index.css`, no separate config file |
| Routing | React Router v7 | nested layouts (`PublicLayout`, `AppShell`, `AdminGate`) |
| Server state | TanStack Query | caching/refetching for API-backed pages |
| Motion | Framer Motion (`whileInView`) + hand-rolled scroll math for the Spark Thread SVG | avoids a 3D/particle library — see `docs/DESIGN_SYSTEM.md` for why |
| Backend framework | FastAPI | async, typed, auto-generates `/docs` |
| Auth | JWT (`python-jose`) + `bcrypt` directly (not `passlib` — see below) | |
| Database | **In-memory dict store** (`backend/app/db/memory.py`) for now | swap-in point for MongoDB Atlas via Motor later |
| File storage | Not yet wired | Cloudinary is the intended provider per the original spec |

### One deliberate deviation: `bcrypt`, not `passlib`

`passlib`'s bcrypt backend is unmaintained and breaks on `bcrypt>=4.1` (it calls
`bcrypt.__about__.__version__`, which no longer exists). Rather than pin an old
`bcrypt`, `backend/app/core/security.py` calls the `bcrypt` package directly.

## Data flow, end to end

1. A student registers on the public `/register` page → `POST /auth/register` creates a **participant** account and returns a JWT → `POST /teams` creates their team (they become `leader_id`).
2. The team leader can add up to 5 more members (`POST /teams/{id}/members`) — members are embedded data on the team document, not separate logins. Only the leader has an account for that team.
3. The leader submits Level 1 / Level 2 work (`POST /teams/{id}/submissions`) — this is the only mutation path into the screening state machine (`backend/app/services/screening.py`).
4. A coordinator or SPOC reviews via the admin screening console → `POST /teams/{id}/screening/{level}/review` → the state machine either advances or rejects the team.
5. Results, once published, are readable at `GET /results` (public).

## Roles (RBAC)

`participant < coordinator < spoc < admin` (rank order in `backend/app/models/user.py`). Every protected route uses `require_role(minimum)`, which checks `ROLE_RANK[user.role] >= ROLE_RANK[minimum]` — a higher role can always do what a lower role can.

**In practice, only 3 non-participant accounts exist**, seeded in `backend/app/db/memory.py`: two coordinators (Partha Shankar, Nirmith M Jain) and one SPOC (Bhargav R). There is no separate `admin` person — the "admin panel" is reachable by coordinator rank and above.

## The two login surfaces don't overlap

`/login` (public, participant-facing) and `/admin` (unlinked from any public nav — you have to type the URL) both call the same `POST /auth/login`, but each frontend page then checks the returned role and immediately discards the session (calls `logout()`) if the role doesn't belong on that surface — showing the same generic "incorrect email or password" either way. See `docs/BACKEND.md` → "Auth" and `docs/FRONTEND.md` → "Two login surfaces" for the exact mechanism.

## Where this diverges from the original spec (`ARCHITECTURE.md.pdf`)

- **"Spread the Spark"** (student-led promotion sharing) isn't in the original spec — added mid-build. Public, no login required: a student pastes their name, USN, and a link to their own social post; the backend detects the platform from the URL and counts it. See `docs/API.md` → Promotions.
- **"Updates"** page: a lightweight public feed with two post kinds (`post` = shareable, `update` = informational-only), not in the original spec.
- Team member management (add/remove, capped at 6 total including the leader) was added as an explicit feature after the fact.
