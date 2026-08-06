# Backend Architecture & Implementation

FastAPI (Python 3.11), powered by Motor async MongoDB driver connecting to MongoDB Atlas (`ignite_sih` database).

## Directory Structure

```
backend/app/
  main.py              FastAPI app instance, lifespan startup, CORS, security middleware
  core/
    config.py          Settings (pydantic-settings), env vars (.env & Render dashboard)
    security.py        JWT tokens (create/decode), password hashing (bcrypt)
    deps.py            get_current_user, require_role(minimum) async dependencies
    rate_limit.py      Sliding window rate limiter for auth & public endpoints
    middleware.py      Production security headers (nosniff, HSTS, DENY, XSS)
  db/
    mongo.py           Motor MongoDB client, indexes, seed data & system settings
  models/              Pydantic schemas (request bodies + response shapes)
    user.py, team.py, content.py, promotion.py
  routers/
    auth.py, teams.py, screening.py, problem_statements.py,
    announcements.py, content.py, results.py, stats.py, promotions.py
  services/
    screening.py       Screening state machine & atomic audit logging
```

---

## MongoDB Atlas Integration (`db/mongo.py`)

- **Database**: MongoDB Atlas (`ignite_sih`).
- **Primary Keys**: Custom string IDs (`user_...`, `team_...`, `share_...`, `audit_...`). Both `_id` and `"id": uid` are duplicated on all inserted documents for 100% compatibility with Pydantic and TypeScript interfaces.
- **Indexes**: Indexed on `users.email` (unique), `teams.leader_id`, `teams.status`, `promo_shares.promo_post_id`, `audit_log.team_id`.
- **System Settings**: Collection `system_settings` manages global admin portal toggles (`registration_open`, `level1_open`, `level2_open`).

---

## Auth & Account Roles

- `POST /auth/register` — public, creates `participant` account.
- `POST /auth/login` — returns `{ access_token, user }`. Email lookups use `re.escape(email.strip())` with `$options: "i"` for case-insensitive login.
- **Admin & Staff Accounts**:
  - `parthashankar21@gmail.com` (`coordinator`)
  - `nirmithmjain@gmail.com` (`coordinator`)
  - `dr.bhargava@ncetmail.com` (`spoc`)

---

## The Screening State Machine (`services/screening.py`)

```
registered → l1_submitted → l1_under_review → l1_cleared → l2_submitted → l2_under_review → selected
                                             ↘ l1_rejected                              ↘ l2_rejected
```

`ALLOWED_TRANSITIONS` (in `models/team.py`) strictly governs legal status moves. Every transition appends an immutable entry to `audit_log` in MongoDB Atlas.

- **Level 1 Submission**: Requires Google Drive PPT URL (`submission_url`). Enforces `level1_open` system toggle.
- **Strict Level 2 Gating**: Teams can submit Level 2 work **only after Level 1 is marked cleared/selected** (`l1_cleared`). Enforces `level2_open` system toggle.
- **Review Decision**: `POST /teams/{id}/screening/{level}/review` accepts `{score, feedback, pass}`. Setting `pass: true` for Level 1 moves status to `l1_cleared` and unlocks Level 2 for the team.

---

## Team Members & Compulsory GitHub Profile URLs

- `POST /teams` and `POST /teams/{id}/members` require a mandatory GitHub profile URL (`github_url`) for every member.
- Capped at max 5 members + 1 leader (6 total). `ensure_member_login()` automatically creates participant credentials for added team members.

---

## Security Hardening & Rate Limiting

- **Rate Limiting** (`core/rate_limit.py`): Proxy-aware sliding window rate limiter (`10 req/min` for `/auth/login` and `/auth/register`, `30 req/min` for `/promotions/{id}/shares`).
- **Input Sanitization**: User search inputs sanitized via `re.escape()` to prevent ReDoS/regex injection attacks.
- **CORS Configuration**: Configured with `allow_origin_regex=r"https://.*\.pages\.dev"` to allow Cloudflare Pages preflight checks cleanly.

---

## Running Locally

```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```
