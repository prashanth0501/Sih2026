# Backend

FastAPI (Python), run with `uvicorn`. No ORM — the "database" is an in-memory dict store, so there's nothing to migrate yet.

## Directory structure

```
backend/app/
  main.py              FastAPI() instance, CORS, router registration
  core/
    config.py          Settings (pydantic-settings), reads env vars
    security.py        create_access_token / decode_access_token, hash_password / verify_password
    deps.py             get_current_user, require_role(minimum) dependency factory
  db/
    memory.py           the in-memory store + seed() — see below
  models/               Pydantic schemas (request bodies + response shapes)
    user.py, team.py, content.py, promotion.py
  routers/
    auth.py, teams.py, screening.py, problem_statements.py,
    announcements.py, content.py, results.py, stats.py, promotions.py
  services/
    screening.py         the state machine — the only code allowed to move a team between statuses
```

## Auth

`POST /auth/register` — public, **always creates a `participant`**. There is no self-service way to become a coordinator/SPOC/admin; those three accounts are seeded directly in `db/memory.py`. This is intentional: granting screening/admin power is not something a signup form should be able to do.

`POST /auth/login` — returns `{ access_token, user }`. The JWT payload is `{ sub: user_id, role, exp }`. `GET /auth/me` returns the current user from a valid token.

Password hashing uses `bcrypt` directly (see `docs/ARCHITECTURE.md` for why not `passlib`).

### The 3 admin accounts

Seeded in `db/memory.py`, real names, real emails, passwords in `ADMIN_CREDENTIALS.md` (gitignored — not in this repo history). Partha Shankar and Nirmith M Jain are `coordinator`; Bhargav R is `spoc`. There is no generic `admin@...` account.

## The screening state machine (`services/screening.py`)

```
registered → l1_submitted → l1_under_review → l1_cleared → l2_submitted → l2_under_review → selected
                                            ↘ l1_rejected                              ↘ l2_rejected
```

`ALLOWED_TRANSITIONS` (in `models/team.py`) is the single source of truth for which moves are legal. `transition()` raises `409 Conflict` on an illegal move and appends an entry to `memory.audit_log` on every legal one — so the full review history is reconstructable even though there's no separate audit table.

Two entry points drive it:
- `services.screening.submit_level(team, level, url, actor_id)` — called from `POST /teams/{id}/submissions` (the team leader only).
- `services.screening.record_decision(team, level, score, feedback, passed, actor_id)` — called from `POST /teams/{id}/screening/{level}/review` (coordinator+). This also auto-calls `open_for_review()` first if the team is still in the `*_submitted` state, so one API call does the full submitted → under_review → decided sequence and the audit log still shows both steps.

## Team members

`POST /teams/{id}/members` (leader-only, checked via `team["leader_id"] != user["id"]` → `403`) appends a member. Capped at `MAX_MEMBERS = 5` (plus the leader = 6 total, matching the official SIH team-size rule). `DELETE /teams/{id}/members/{email}` removes one. Members are plain dicts embedded in the team document — **they do not get login accounts**. Only the leader authenticates; that's what actually enforces "members can't add members," not a separate permission check.

## Promotions ("Spread the Spark")

Deliberately **not behind auth** — see `docs/CONTEXT.md` for why this changed mid-build. `POST /promotions/{id}/shares` takes `{ name, usn, post_url, is_public_on_wall }` from the request body directly; there's no `Depends(get_current_user)` on that route. The server detects the platform itself from `post_url`'s hostname (`detect_platform()` in `routers/promotions.py`) — the client's own detection (`lib/utils.ts` → `detectPlatform`) is only used for the live "Detected: Instagram" preview text, and is never trusted for the stored value.

`GET /promotions` returns each post with a computed `share_count`. `GET /promotions/wall` returns only shares where `is_public_on_wall` is true (default `true` — there's no opt-out checkbox in the UI anymore, see CONTEXT.md).

## Seed data (`db/memory.py` → `seed()`)

Runs once at import time (guarded by `if users: return`). Seeds: the 3 admin accounts + 1 demo participant, all 18 problem statement themes, principal/coordinator content blocks, and 2 promo posts (matching what the frontend originally mocked, now the real source of truth).

## Running it

```bash
cd backend
py -m venv venv
./venv/Scripts/pip install -r requirements.txt
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

No `--reload` was used during development in this session (the process was restarted manually after model changes) — either works. `/docs` gets you Swagger UI for free.
