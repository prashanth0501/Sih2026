# MongoDB Migration Guide

> ✅ **STATUS: MIGRATION COMPLETED TO PRODUCTION MONGO ATLAS**
> 
> The MongoDB Atlas migration has been fully executed. `backend/app/db/memory.py` has been deleted and replaced with `backend/app/db/mongo.py` using Motor async driver connected to live Atlas database (`ignite_sih`). All routers (`auth`, `teams`, `screening`, `problem_statements`, `announcements`, `content`, `promotions`, `results`, `stats`), dependencies (`deps.py`), and state machine services (`screening.py`) have been converted to `async def` Motor calls.

This is the A-to-Z plan for replacing `backend/app/db/memory.py` with real MongoDB
(Atlas) storage via Motor. It exists because `docs/ARCHITECTURE.md` promises "swap
this module for a real `db/mongo.py` … when you're ready" — this doc is that moment,
written out in enough detail that you don't have to re-derive it from scratch.

Read this end to end before touching code. The honest version of the plan is longer
than "swap one file" — that line in `CLAUDE.md`/`ARCHITECTURE.md` is optimistic about
scope, not wrong about the destination. Section 2 explains why.

## 1. What exists today

The current "database" is `backend/app/db/memory.py`: eight module-level Python
dicts/lists (`users`, `teams`, `problem_statements`, `announcements`, `content`,
`audit_log`, `promo_posts`, `promo_shares`), a couple of ID/timestamp helpers
(`new_id()`, `now_iso()`), two small query helpers (`find_user_by_email()`,
`ensure_member_login()`), and a `seed()` function that runs once at import time.

Two things are already in place for the migration, done ahead of time by whoever
scaffolded this repo:

- `motor==3.7.1` and `pymongo==4.17.0` are **already in `backend/requirements.txt`**
  — nothing new to install.
- `backend/app/core/config.py` **already has** `mongodb_uri: str = ""` and
  `mongodb_db_name: str = "ignite_sih"` on the `Settings` class, reading from
  environment variables. You just need to set `MONGODB_URI` in `.env`.

Everything else — the actual client, the collection wrappers, the async rewiring —
still needs to be built.

## 2. The honest scope: why this touches more than one file

`ARCHITECTURE.md` says routers "only call functions on this module rather than
touching dicts directly" for `memory.py` as a whole module boundary. That's true in
the sense that no router ever reaches into a raw dict that isn't behind
`app/db/memory`. But it does **not** mean routers go through a clean function API —
most of them call `.get()`, `.values()`, `list(...)`, and `dict[key] = ...` directly
on the module-level dicts:

```python
team = memory.teams.get(team_id)                      # backend/app/routers/teams.py:14
existing = next((t for t in memory.teams.values() ...  # backend/app/routers/teams.py:27
memory.teams[tid] = team                                # backend/app/routers/teams.py:46
```

That works today because `memory.teams` is a plain synchronous Python dict. Motor's
API is entirely `async` — `await collection.find_one(...)`, `await
collection.insert_one(...)` — there is no synchronous dict-like view you can drop in
as a transparent replacement. So the migration is really two migrations happening at
once:

1. **Storage**: in-memory dicts → MongoDB collections.
2. **Concurrency model**: synchronous function calls → `async def` + `await`
   everywhere those calls happen.

The second one is what makes this an "every router" change, not a "one file" change.
The good news: this codebase is small (9 router files, ~700 lines total across them),
FastAPI route handlers can be `async def` with zero other changes to how they're
wired up (`app.include_router(...)` doesn't care), and Motor's query API is close
enough to PyMongo's that the line-level diffs are mostly mechanical
(`.get(id)` → `await collection.find_one({"_id": id})`).

## 3. Migration strategy: what to do, and what not to do

**Recommended:** rewrite `app/db/memory.py` into `app/db/mongo.py` exposing an async
Motor client + collection accessors, then convert each router function to `async
def` and replace direct dict access with the equivalent Motor call, one router file
at a time. Keep `memory.py` in the repo, untouched, until the whole backend is
verified against Mongo — it's your rollback path (see Section 11).

**Do not** try to build a synchronous dict-like wrapper around Motor to avoid
touching the routers. It's tempting — write a class with `__getitem__`/`.get()`/
`.values()` that internally does `asyncio.run(...)` — but this either blocks the
event loop (defeating the point of using Motor at all) or deadlocks when called from
inside a route handler that's already running in that event loop. It looks like less
work and is actually more work, plus you'd ship something fragile. Do the async
rewrite properly; it's mechanical, not hard.

**Do not** switch to PyMongo (sync) instead of Motor "to keep routes sync." It runs,
but every DB call then blocks FastAPI's event loop thread, which throttles the whole
server to one request at a time during any DB call. Motor is already installed for a
reason — use it.

## 4. ID strategy: keep string IDs, don't switch to ObjectId

Every record today gets an ID like `team_14_a91f3c` from `memory.new_id(prefix)`
(`itertools.count` + a short `uuid4` suffix). Keep this scheme and store it as
Mongo's `_id` field (Mongo accepts any hashable, unique value as `_id`, not just
`ObjectId`). Reasons:

- Every Pydantic model (`TeamPublic.id`, `UserPublic.id`, etc.) is typed `str`. If you
  switch to `ObjectId`, every response needs an explicit
  `str(doc["_id"])` conversion, and every incoming path param (`team_id: str` in
  route signatures) needs `ObjectId(team_id)` parsing with try/except for invalid
  format — pure churn, no benefit at this scale.
- The frontend already treats every ID as an opaque string (`ApiTeam.id: string`,
  used only for equality checks and URL params). Nothing there needs to change if the
  string format doesn't change.
- Audit log entries, JWT `sub` claims, and the promo `platform`/`share_count`
  aggregations are all built around plain string IDs already.

Practically: `new_id()` moves from `app/db/memory.py` into `app/db/mongo.py`
unchanged, and every `insert_one({...})` call sets `"_id": new_id("team")` explicitly
in the document you build, exactly like today's code sets `"id": tid`. Keep **both**
an `_id` field (Mongo's primary key) and expose it as `"id"` in every dict you return
from a query so the existing Pydantic response models (`id: str`) don't need to
change at all — see the projection pattern in Section 6.

## 5. Set up the Atlas cluster

1. Create a free-tier (M0) cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) if one doesn't exist yet.
2. **Database Access** → add a database user with a strong password (not your Atlas
   login password). Note the username/password — you'll need them in the connection
   string.
3. **Network Access** → add an IP allowlist entry. For local development from a
   single machine, add your current IP. If the backend will also run from a
   deploy target with a dynamic IP (Render, Railway, etc.), add `0.0.0.0/0` there —
   Atlas still requires the database-user password, so this isn't equivalent to
   leaving the database open.
4. **Database** → create a database named `ignite_sih` (matches
   `mongodb_db_name` default in `config.py`) — Atlas will actually create it lazily
   on first write, so this step is optional but makes the cluster UI less confusing
   while you're working.
5. Copy the connection string from **Connect → Drivers → Python**. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add to `backend/.env` (create this file if it doesn't exist — it's gitignored):
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=ignite_sih
   ```
   Double-check `<password>` is URL-encoded if it contains `@`, `:`, `/`, or `%` —
   Atlas's own connection-string generator does this for you if you paste the raw
   password into its UI.

## 6. Write `app/db/mongo.py`

This is the direct replacement for `app/db/memory.py`. Structure:

```python
"""
MongoDB-backed data store, via Motor. Replaces app/db/memory.py — every router
now calls `await` on the functions/collections here instead of touching a dict
directly. See docs/MONGODB_MIGRATION.md for the full migration plan.
"""

import itertools
import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

_id_counter = itertools.count(1)


def new_id(prefix: str) -> str:
    return f"{prefix}_{next(_id_counter)}_{uuid.uuid4().hex[:6]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


DEFAULT_MEMBER_PASSWORD = "tm@123"

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db_name]

users = db["users"]
teams = db["teams"]
problem_statements = db["problem_statements"]
announcements = db["announcements"]
content = db["content"]
audit_log = db["audit_log"]
promo_posts = db["promo_posts"]
promo_shares = db["promo_shares"]


async def find_user_by_email(email: str) -> dict | None:
    return await users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})


async def ensure_member_login(name: str, email: str, department: str, year: int) -> dict:
    existing = await find_user_by_email(email)
    if existing:
        return existing
    from app.core.security import hash_password  # local import avoids a cycle

    uid = new_id("user")
    user = {
        "_id": uid,
        "id": uid,
        "name": name,
        "email": email,
        "password_hash": hash_password(DEFAULT_MEMBER_PASSWORD),
        "role": "participant",
        "department": department,
        "year": year,
        "photo_url": None,
        "created_at": now_iso(),
    }
    await users.insert_one(user)
    return user


async def ensure_indexes() -> None:
    await users.create_index("email", unique=True)
    await teams.create_index("leader_id")
    await teams.create_index("members.email")
    await teams.create_index("status")
    await promo_shares.create_index("promo_post_id")
    await promo_posts.create_index("is_published")
```

Notes on the pattern above:

- **Every inserted document sets both `_id` and `id` to the same string.** This is
  the trick that keeps every existing Pydantic response model (`id: str`) working
  with zero changes — `find_one()` returns a dict that already has an `"id"` key,
  same as `memory.teams[tid]` did before. Don't rely on stringifying `_id` at read
  time; set `id` explicitly at write time so every insert path does it consistently.
- `find_user_by_email` used to do a case-insensitive Python-side scan
  (`u["email"].lower() == needle`). The Mongo equivalent is a `$regex` with
  `$options: "i"` shown above, **or**, better once you're doing this for real:
  normalize `email` to lowercase at write time (register/add-member) and query
  with a plain equality match — avoids an unindexed regex scan. If you do that,
  also add the `unique=True` index on the lowercased field, and update `auth.py`'s
  register/login to lowercase the incoming email before comparing.
- `ensure_indexes()` is new — nothing in `memory.py` had indexes because a Python
  dict's key lookup is already O(1). Call it once at startup (Section 10).

## 7. Seed data

`memory.seed()` currently runs at import time and is idempotent by checking
`if users: return`. Keep the idempotency check, but move it to an explicit call at
FastAPI startup (see Section 10) — importing `mongo.py` must not trigger a database
write as a side effect of Python's import machinery, especially against a real
remote cluster.

```python
async def seed() -> None:
    if await users.count_documents({}) > 0:
        return  # already seeded

    # ... same demo_accounts / themes / content / promo_posts literals as
    # memory.py's seed(), but every users[uid] = {...} becomes
    # await users.insert_one({...}), etc.
```

**Do not commit real passwords for the three staff accounts into `mongo.py`.** The
current `memory.py` hardcodes them inline with a comment pointing at
`ADMIN_CREDENTIALS.md` (gitignored) for the record of what was issued — that file is
the source of truth, not the code. Keep that same shape: the seed function can keep
the same three email addresses, but read the passwords from environment variables
(`STAFF_PARTHA_PASSWORD`, etc.) with the current hardcoded strings only as a
**local-dev fallback default**, same spirit as `jwt_secret: str = "dev-only-secret-
change-me"` in `config.py`. If you don't want to do env-var plumbing tonight, at
minimum don't paste real passwords into a file that gets committed — this migration
is a good excuse to tidy that up, not a reason to make it worse.

Run the seed once, manually, against the real cluster before pointing the frontend
at it — either via the FastAPI startup hook (Section 10) on first boot, or a
one-off script:

```bash
cd backend
./venv/Scripts/python -c "import asyncio; from app.db import mongo; asyncio.run(mongo.seed())"
```

## 8. Convert `app/core/deps.py` (do this first — everything depends on it)

```python
async def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict:
    ...
    payload = decode_access_token(token)
    if not payload:
        raise credentials_error
    user = await mongo.users.find_one({"_id": payload.get("sub", "")})
    if not user:
        raise credentials_error
    return user
```

`require_role()`'s inner `dependency()` function also needs `async def` — it depends
on `get_current_user`, and FastAPI's `Depends()` resolves async dependencies
transparently, but a sync function can't `await` inside it. This is the first domino:
once `get_current_user` is async, **every route that depends on it (directly or
transitively) must become `async def` too**, all the way up. That's most of the app.

## 9. File-by-file conversion checklist

Go in this order — each one only depends on files above it in the list, so you can
run the server and manually re-test after each file instead of converting
everything blind and debugging one giant diff.

| # | File | What changes |
|---|---|---|
| 1 | `app/db/mongo.py` | New file — see Section 6. |
| 2 | `app/core/deps.py` | `get_current_user` + `require_role`'s inner function → `async def`; `memory.users.get(...)` → `await mongo.users.find_one({"_id": ...})`. |
| 3 | `app/routers/auth.py` | `register`/`login`/`me` → `async def`. `any(u["email"] == body.email for u in memory.users.values())` → `await mongo.users.find_one({"email": body.email})` (check `is None`). `memory.users[uid] = user` → `await mongo.users.insert_one(user)`. Login's `next((u for u in memory.users.values() if ...))` → `find_one`. |
| 4 | `app/routers/teams.py` | Every handler → `async def`. `_get_owned_or_404` → `async def`, becomes `await mongo.teams.find_one({"_id": team_id})`. `create_team`'s duplicate-leader check → `find_one({"leader_id": user["id"]})`. `my_team`'s two lookups → `find_one({"leader_id": ...})` then `find_one({"members.email": email})` (this is exactly why the `members.email` index in Section 6 exists — this query would otherwise scan every team). `list_teams` → `.find(query).skip(start).limit(page_size)`, and move the `status`/name-substring filtering into the Mongo query (`{"status": status_filter}`, `{"name": {"$regex": q, "$options": "i"}}`) instead of Python-side filtering of a fully-materialized list. Every in-place mutation (`team["is_locked"] = ...`, `team["members"].append(...)`) must be followed by `await mongo.teams.update_one({"_id": team_id}, {"$set": {...}})` or `{"$push": {"members": ...}}` — see Section 10 for why "mutate then forget" silently breaks. |
| 5 | `app/services/screening.py` | `transition`, `submit_level`, `open_for_review`, `record_decision` → all `async def`, all callers (`teams.py`, `screening.py` router) must `await` them. `memory.audit_log.append({...})` → `await mongo.audit_log.insert_one({...})`. The in-place `team["status"] = to_status` needs a matching `update_one` — see Section 10, this is the highest-risk file for the mutate-then-forget bug because it's called from two different routers. |
| 6 | `app/routers/screening.py` | `review()` → `async def`, `memory.teams.get(team_id)` → `find_one`, both `screening.open_for_review(...)` and `screening.record_decision(...)` calls need `await`. |
| 7 | `app/routers/problem_statements.py` | `list_problem_statements`/`update_problem_statement` → `async def`; `list(memory.problem_statements.values())` → `.find({}).to_list(length=None)`; existence check + `memory.problem_statements[ps_id] = ...` → `find_one` + `update_one(..., upsert=False)`. |
| 8 | `app/routers/announcements.py` | `async def`; `.values()` sorted by `published_at` → `.find({}).sort("published_at", -1).to_list(length=None)`; insert → `insert_one`. |
| 9 | `app/routers/content.py` | `async def`; `memory.content.get(slug)` → `find_one({"_id": slug})` (content already uses `slug` as its natural key — keep using it as `_id`, don't introduce a separate generated ID for this one). |
| 10 | `app/routers/promotions.py` | Every handler → `async def`. `_share_count()` → `async def`, `await mongo.promo_shares.count_documents({"promo_post_id": promo_id})` (this replaces a Python `sum(1 for ...)` scan with a real count query — do this one even if you're rushing, it's a one-line change and avoids pulling every share row into memory just to count them). All the list endpoints (`list_promo_posts`, `list_shares`, `list_all_shares`, `public_wall`) need their per-row `_share_count()` calls turned into either a loop of awaits or a single `$lookup`/aggregation — a loop of awaits is fine at this scale, don't over-engineer an aggregation pipeline for a few hundred rows. |
| 11 | `app/routers/results.py` | `async def`; `[t for t in memory.teams.values() if t["status"] == "selected"]` → `.find({"status": "selected"}).to_list(length=None)`. |
| 12 | `app/routers/stats.py` | `async def`; both handlers currently do `list(memory.teams.values())` then Python-side aggregation (counting by status, summing member counts). At this data volume, pulling the collection with `.find({}).to_list(length=None)` and keeping the exact same Python aggregation logic is fine and is the lowest-risk change — resist the urge to rewrite this as a Mongo `$facet`/aggregation pipeline in the same pass as the rest of the migration. Do that later, separately, once the basic migration is verified working. |
| 13 | `app/main.py` | Add the startup hook — see Section 10. |

## 10. Startup/shutdown wiring in `app/main.py`

Two things need to happen once, at process startup, that don't exist today: opening
the Motor connection (already implicit — `AsyncIOMotorClient` is created at import
time in `mongo.py`, which is fine, Motor connects lazily) and running
`ensure_indexes()` + `seed()` exactly once. Use FastAPI's lifespan:

```python
from contextlib import asynccontextmanager

from app.db import mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo.ensure_indexes()
    await mongo.seed()
    yield
    mongo.client.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
```

## 11. The "mutate then forget" trap — read this before converting `teams.py`

This is the single most important behavioral difference between the dict store and
Mongo, and it's easy to miss because the code *looks* almost identical after a naive
find-and-replace.

Today, `screening.transition()` does this:

```python
team["status"] = to_status
team["updated_at"] = memory.now_iso()
```

This works because `team` **is** the exact dict object living inside
`memory.teams[team_id]` — there's only one copy in the whole process, so mutating
the local variable mutates the "database" by definition. There is no save step
because there was never a copy.

Once `team` is `await mongo.teams.find_one({"_id": team_id})`, you get a **new
Python dict, decoded from BSON, with no live connection back to the database.**
Mutating it (`team["status"] = to_status`) changes nothing on the server — the
change silently vanishes the moment the function returns, and the next request will
`find_one` the old, unchanged document. This will not raise an error. It will just
look like screening decisions aren't saving, and it's the kind of bug that's obvious
in testing (nothing persists) but easy to half-fix by adding a save call in the
wrong place and still losing writes under concurrent requests.

Two ways to fix it, in order of preference:

**Preferred — atomic update, no mutate step at all.** Replace the Python mutation
with a Mongo update operator and use `find_one_and_update` so the read and the write
are one atomic operation:

```python
updated = await mongo.teams.find_one_and_update(
    {"_id": team["id"], "status": from_status},  # guard: only if status hasn't changed since we read it
    {"$set": {"status": to_status, "updated_at": mongo.now_iso()}},
    return_document=ReturnDocument.AFTER,
)
if updated is None:
    raise HTTPException(status.HTTP_409_CONFLICT, f"Team status changed before this update could apply")
return updated
```

The `"status": from_status` guard in the filter is what makes this safe against two
coordinators reviewing the same team's Level 1 submission at the same instant — only
one `find_one_and_update` wins; the other gets `None` back and a 409, instead of both
silently overwriting each other's audit trail. This is worth doing for
`screening.py` specifically, since it's the one file explicitly documented as "the
only code allowed to move a team between statuses" — an atomicity bug here quietly
breaks that guarantee.

**Acceptable for lower-stakes paths (e.g. `set_lock`, `add_member`)** — mutate the
dict for convenience (so the rest of the function's return-value shape stays
unchanged) **and then explicitly persist it**:

```python
team["is_locked"] = body.locked
team["updated_at"] = mongo.now_iso()
await mongo.teams.update_one({"_id": team_id}, {"$set": {"is_locked": team["is_locked"], "updated_at": team["updated_at"]}})
return team
```

For `add_member`/`remove_member` specifically, use `$push`/`$pull` on the `members`
array instead of `$set`-ing the whole array — it's the same idea (don't fetch-mutate-
save an array when Mongo has an atomic operator for exactly this):

```python
await mongo.teams.update_one({"_id": team_id}, {"$push": {"members": body.model_dump()}})
```

Audit yourself: **every line in `teams.py` and `screening.py` that currently does
`team["something"] = ...` needs a corresponding Mongo write**, or it's a silent no-op
in production. This is the #1 thing to check for in testing (Section 13) — not "does
it error," but "if I refetch the same team, did my change actually stick."

## 12. Password hashes and other data-shape gotchas

- `hash_password()` returns a `str` (`backend/app/core/security.py:10`) —
  stores/reads from Mongo with no conversion needed. Nothing to do here, just
  confirmed while reviewing this so it isn't a surprise mid-migration: if this were
  `bytes`, Mongo would round-trip it as BSON `Binary` and `verify_password()`'s
  `.encode("utf-8")` call would break on read. It isn't bytes. Moving on.
- All timestamps (`created_at`, `updated_at`, `published_at`, `submitted_at`,
  `reviewed_at`, `timestamp`) are ISO-8601 **strings** from `now_iso()`, not Python
  `datetime` objects. Keep it that way — don't let Motor auto-convert to BSON dates
  on some paths and leave strings on others, or you'll get inconsistent
  sort/comparison behavior between old (dict-store) and new (Mongo) records if this
  migration ever runs alongside partially-migrated data. Since this backend resets
  fully as a hard cutover (Section 14), this is mostly a "stay consistent" reminder
  rather than a real migration hazard — just don't reach for `datetime.now()` while
  you're in here.
- `TeamMember` is a Pydantic model embedded as a list of dicts on the team document
  (`body.model_dump()` in `add_member`). This maps directly to a Mongo embedded
  array — no schema change needed, it's already shaped the way Mongo wants it.
- `EmailStr` fields (from `pydantic[email]`) validate format on the way in but don't
  normalize case. If you add the lowercase-email index recommended in Section 6,
  audit every write path that stores an email (`auth.register`, `add_member`,
  `ensure_member_login`) and lowercase it there — retrofitting a unique index onto
  data that already has case-duplicate emails will fail to create.

## 13. Manually re-test every flow (there's no test suite yet)

Per `CLAUDE.md`, there is no backend test suite — verification has always been
manual, via Swagger UI at `http://localhost:8000/docs`. Same plan here, but be
deliberate about it since this migration touches every router. Walk through, in
order, confirming with a **second, separate request** that data actually persisted
(not just that the first request returned 200):

1. `POST /auth/register` a new participant → `POST /auth/login` with the same
   credentials → confirm you get a token back (validates password hashing round-
   trips through Mongo correctly).
2. `POST /teams` as that participant → `GET /teams/mine` → confirm the team comes
   back with the right `id`, and `viewer_is_leader: true`.
3. `POST /teams/{id}/members` to add a teammate → `GET /teams/{id}` again → confirm
   the member is actually in the `members` array (catches the `$push` step above if
   you missed it) → then log in as that member's email with password `tm@123` and
   confirm `ensure_member_login` created a real, working account.
4. `POST /teams/{id}/submissions` for level 1 → check `status` moved to
   `l1_submitted` on a fresh `GET`, not just in the POST response.
5. Log in as a coordinator (`parthashankar21@gmail.com` / whatever password you
   configured per Section 7) → `POST /teams/{id}/screening/1/review` with
   `pass_: true` → `GET /teams/{id}` again as the participant → confirm `status` is
   now `l1_cleared` **and** `level1.score`/`level1.feedback` are populated. This is
   the single most important check in the whole list — it's the exact scenario
   Section 11 warns about.
6. `PATCH /teams/{id}/lock` with `locked: true` → try `POST /teams/{id}/members`
   again → confirm you get `423 Locked`, not a silent success.
7. `POST /promotions/{id}/shares` (unauthenticated, per its design) → `GET
   /promotions/wall` → confirm the new share shows up with the right
   auto-detected `platform`.
8. `GET /stats/public` and `GET /stats/admin` → sanity-check the numbers match what
   you just created (teams_registered, total_students, by_stage counts).

If all eight pass with data surviving a second, independent request, the migration
is functionally done.

## 14. This is a hard cutover, not a gradual rollout

There is no user data in the in-memory store worth migrating — it resets on every
backend restart already (per `ARCHITECTURE.md`), so there's nothing to export from
`memory.py` into Mongo. The plan is: build `mongo.py`, convert every router, point
`app/main.py` at it, delete the `from app.db import memory` imports, and that's the
whole cutover. Don't build a dual-write shim or a feature flag to run both stores at
once — for a dataset this small and this disposable, that's meaningfully more work
than the migration itself for zero benefit.

## 15. Rollback plan

Don't delete `app/db/memory.py` until the checklist in Section 13 fully passes
against Mongo. If something goes wrong mid-migration and you need the app working
again before you've finished converting every router, the fastest path back is `git
stash` / a revert on the in-progress branch — not trying to un-migrate individual
files. Commit after each row of the Section 9 table passes its manual smoke test
(one commit per router file), so a revert can land on any of those checkpoints
instead of losing the whole session's work.

## 16. What NOT to do in this pass

- **Don't touch the frontend.** Every response model (`TeamPublic`, `UserPublic`,
  etc.) keeps the exact same JSON shape if you follow Section 4/6 (`id` field always
  present, same types). If a frontend page breaks after this migration, it means a
  response shape changed, which means Section 4 wasn't followed — not that the
  frontend needs updating too.
- **Don't add Cloudinary in the same pass.** It's a separate, unrelated integration
  (`docs/ARCHITECTURE.md` lists it as "not yet wired" alongside Mongo, but they're
  independent — file storage has nothing to do with where team/user records live).
  Mixing them into one migration session makes it much harder to tell which system
  broke if something goes wrong.
- **Don't rewrite the screening state machine's logic** while converting it to
  async. `ALLOWED_TRANSITIONS` and the transition-legality check in
  `app/models/team.py`/`app/services/screening.py` should come out **behaviorally
  identical** — same statuses, same legal moves, same audit log shape. The only
  change here is persistence mechanics (Section 11), not business logic. If you spot
  something you want to improve about the state machine itself, write it down and do
  it as a separate, reviewable change.
- **Don't introduce a Mongo aggregation pipeline for `stats.py`** in this pass (see
  the table row above) — it's a nice-to-have, not required for correctness at this
  data volume, and it's easy to get a `$facet`/`$group` pipeline subtly wrong under
  time pressure. Ship the boring version first.

## 17. Suggested order for tomorrow

If you're doing this in one sitting, this is the sequence that lets you keep the
server runnable (and manually testable via `/docs`) after almost every step, instead
of a big-bang rewrite you can't test until the very end:

1. Atlas cluster + `.env` (Section 5) — 15 minutes, no code yet.
2. Write `app/db/mongo.py` (Section 6). Server still won't start correctly yet
   because nothing calls it — that's fine, expected.
3. Convert `app/core/deps.py` (Section 8).
4. Convert `app/routers/auth.py`. At this point the server should boot and
   `/auth/register` + `/auth/login` should work end-to-end against real Mongo —
   your first real checkpoint. Commit here.
5. Convert `app/services/screening.py`, then `app/routers/teams.py` and
   `app/routers/screening.py` together (they're coupled — Section 9, rows 4-6).
   This is the biggest, riskiest chunk; budget the most time for it and re-read
   Section 11 while you're in `teams.py`. Commit here.
6. Convert `problem_statements.py`, `announcements.py`, `content.py` — these three
   are the simplest files in the router list, no state machine, no nested arrays.
   Commit here.
7. Convert `promotions.py`, then `results.py`, then `stats.py`.
8. Wire up `app/main.py`'s lifespan (Section 10).
9. Run the full manual checklist in Section 13, end to end, one more time against
   the fully-converted app.
10. Once everything in Section 13 passes: delete `app/db/memory.py`, remove any
    leftover `from app.db import memory` imports (`grep -rn "from app.db import
    memory" backend/app` should return nothing), update `docs/ARCHITECTURE.md`'s
    "In-memory dict store" row in the tech-stack table to say MongoDB Atlas
    instead, and commit.
