# API Reference

Base URL: `http://localhost:8000/api/v1` (proxied from the frontend dev server at `/api/*`, see `frontend/vite.config.ts`). Interactive docs at `http://localhost:8000/docs`.

Auth: `Authorization: Bearer <token>` header. Roles shown are the **minimum** — a higher role can always call a lower-role route.

## Auth — `routers/auth.py`

| Method & path | Auth | Body → Response |
|---|---|---|
| `POST /auth/register` | public | `{name, email, password, department, year}` → `{access_token, user}` — always creates role `participant` |
| `POST /auth/login` | public | `{email, password}` → `{access_token, user}` |
| `GET /auth/me` | any logged-in user | → `UserPublic` |

## Teams — `routers/teams.py`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /teams` | participant | Creates a team; caller becomes `leader_id`. 409 if you already lead one. |
| `GET /teams/mine` | participant | Your own team (404 if you don't lead one). |
| `GET /teams` | coordinator+ | Query params: `status`, `q`, `page`, `page_size`. |
| `GET /teams/{id}` | any logged-in user | |
| `POST /teams/{id}/members` | leader only | `{name, email, department, year, role}`. 400 at 5 members (6 total incl. leader). 409 on duplicate email. |
| `DELETE /teams/{id}/members/{email}` | leader only | |
| `POST /teams/{id}/submissions` | leader only | `{level: 1|2, submission_url}` — advances the state machine. |

## Screening — `routers/screening.py`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /teams/{id}/screening/{level}/review` | coordinator+ | `{score, feedback, pass_}`. `level` is `1` or `2`. Auto-transitions `*_submitted → *_under_review` first if needed, then records the decision. |

## Problem statements — `routers/problem_statements.py`

| Method & path | Auth |
|---|---|
| `GET /problem-statements?q=&theme=` | public |
| `PUT /problem-statements/{id}` | admin |

## Announcements — `routers/announcements.py`

| Method & path | Auth |
|---|---|
| `GET /announcements` | public |
| `POST /announcements` | coordinator+ |

## Content — `routers/content.py`

Free-form JSON blocks (principal message, coordinator bios) keyed by slug, so institutional copy can change without a deploy.

| Method & path | Auth |
|---|---|
| `GET /content/{slug}` | public |
| `PUT /content/{slug}` | admin |

## Results & stats — `routers/results.py`, `routers/stats.py`

| Method & path | Auth |
|---|---|
| `GET /results` | public — teams with `status == "selected"` |
| `POST /results/publish` | spoc |
| `GET /stats/public` | public — `{teams_registered, ideas_submitted, problem_statements, days_to_deadline}` |
| `GET /stats/admin` | coordinator+ — funnel counts by stage |

## Promotions ("Spread the Spark") — `routers/promotions.py`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /promotions` | coordinator+ | Create a promo post: `{title, caption, hashtags, media_url}` |
| `GET /promotions` | public | Each post includes a computed `share_count` |
| `POST /promotions/{id}/shares` | **public, no auth** | `{name, usn, post_url, is_public_on_wall}` — platform is detected server-side from `post_url`, never trusted from the client. Returns `count_for_post`. |
| `GET /promotions/shares` | coordinator+ | Every submission, across all posts |
| `GET /promotions/{id}/shares` | coordinator+ | Submissions for one post |
| `GET /promotions/wall` | public | Only shares with `is_public_on_wall: true` |

### Platform detection

`detect_platform(url)` matches the URL's hostname against a fixed table (`instagram.com`, `linkedin.com`, `facebook.com`, `x.com`/`twitter.com`, `whatsapp.com`, `youtube.com`/`youtu.be`) and falls back to `"Other"`. Both the backend (source of truth) and the frontend (`lib/utils.ts` → `detectPlatform`, for the live preview only) implement this the same way independently.

## Error shape

FastAPI's default: `{"detail": "message"}` with the appropriate status code (401/403/404/409/400). The frontend doesn't parse `detail` in most places — it shows a generic message instead, deliberately, on both login surfaces (see `docs/FRONTEND.md`).
