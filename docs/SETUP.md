# Setup & Running Locally

## Prerequisites

- Node.js 20+ (frontend)
- Python 3.11+ (backend) — built and tested against 3.14
- No database install needed yet (in-memory store)

## Backend

```bash
cd backend
py -m venv venv
./venv/Scripts/pip install -r requirements.txt      # Windows
# source venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:5173`. The dev server proxies `/api/*` to `http://localhost:8000` (`frontend/vite.config.ts`) — **both processes need to be running** for login/registration/anything backend-backed to work.

## Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Participant (demo) | `participant@nagarjuna.edu` | `participant123` | Seeded, harmless to use for testing |
| Coordinator | `parthashankar21@gmail.com` | see `ADMIN_CREDENTIALS.md` | Real person, real inbox — don't spam test emails to it |
| Coordinator | `nirmithmjain@gmail.com` | see `ADMIN_CREDENTIALS.md` | |
| SPOC | `dr.bhargava@ncetmail.com` | see `ADMIN_CREDENTIALS.md` | |

`ADMIN_CREDENTIALS.md` is gitignored — it exists locally but was never committed. Rotate those three passwords (and update the seed in `backend/app/db/memory.py`) before this goes anywhere near a real production deploy; they were generated for local development only.

Self-service registration (`/register`) only ever creates participants — there's no way to create another coordinator/SPOC account through the UI. Add one by editing the `demo_accounts` list in `backend/app/db/memory.py`.

## Environment variables (backend)

`backend/app/core/config.py` reads these (all have working local defaults, nothing is required to just run it):

| Variable | Default | Needed for |
|---|---|---|
| `JWT_SECRET` | a dev-only placeholder | **must** be overridden before any real deployment |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | add your deployed frontend origin |
| `MONGODB_URI`, `MONGODB_DB_NAME` | unused | reserved for when Atlas gets wired in |
| `CLOUDINARY_*` | unused | reserved for when uploads get wired in |

No `.env` file is required for local dev; create one in `backend/` if you want to override any of the above (`pydantic-settings` reads `backend/.env` automatically — see `env_file=".env"` in `config.py`).

## Verifying things still work after a change

There's no committed test suite yet (see `docs/CONTEXT.md` → Open items). What was actually used during development:

```bash
cd frontend && npx tsc --noEmit -p tsconfig.app.json   # type-check, catches most real breakage
```

For anything touching routing, auth, or a specific page, drive it with Playwright rather than trust a screenshot taken immediately after `page.goto()` — Framer Motion's `whileInView` reveals won't have fired yet on a fast programmatic navigation, which can look like missing content when it's actually just not-yet-animated-in. Scroll gradually (or `waitForTimeout` after a real scroll) before asserting visibility.

## Deploying (not done yet, but the intended targets)

Per the original architecture spec: **Vercel** (frontend), **Render or Railway** (backend), **MongoDB Atlas** (once wired in), **Cloudinary** (once wired in) — all free-tier. None of this is configured in the repo yet; there's no `vercel.json`, no `Procfile`, no Dockerfile. Whoever does this next should start by wiring MongoDB (see `docs/ARCHITECTURE.md` → "one deliberate deviation" for the one gotcha already found in this stack — bcrypt/passlib — so it isn't rediscovered).
