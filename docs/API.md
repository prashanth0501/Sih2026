# API Reference

Base URL: `https://sih2026.onrender.com/api/v1` (Production Render API) / `http://localhost:8000/api/v1` (Local dev). Interactive OpenAPI docs at `/docs`.

Auth: `Authorization: Bearer <token>` header. Roles shown are the **minimum** required — higher roles inherit all lower permissions (`participant` < `coordinator` < `spoc` < `admin`).

---

## System Control Settings — `routers/content.py`

Admins and coordinators can toggle registration and submission stages in real-time.

| Method & path | Auth | Description / Response |
|---|---|---|
| `GET /content/settings` | public | Returns `{registration_open, level1_open, level2_open}` |
| `PATCH /content/settings` | coordinator+ | Updates system settings `{registration_open, level1_open, level2_open}` |

---

## Auth — `routers/auth.py`

*(Protected by 10 req/min sliding window rate limiter)*

| Method & path | Auth | Body → Response |
|---|---|---|
| `POST /auth/register` | public | `{name, email, password, department, year}` → `{access_token, user}` |
| `POST /auth/login` | public | `{email, password}` → `{access_token, user}` (Email is case-insensitive & whitespace trimmed) |
| `GET /auth/me` | any logged-in user | → `UserPublic` |

---

## Teams — `routers/teams.py`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /teams` | participant | Creates a team; caller becomes `leader_id`. Body: `{name, theme, members: [{name, email, department, year, github_url}]}`. Validates `registration_open` and compulsory `github_url`. |
| `GET /teams/mine` | participant | Returns current user's team (`viewer_is_leader: true|false`). |
| `GET /teams` | coordinator+ | Query params: `status`, `q`, `page`, `page_size` (default 200). Returns live teams array. |
| `GET /teams/{id}` | any logged-in user | Returns team details by ID. |
| `POST /teams/{id}/members` | leader only | `{name, email, department, year, github_url}`. Enforces max 5 members + 1 leader. Validates `github_url`. |
| `DELETE /teams/{id}/members/{email}` | leader only | Removes team member by email. |
| `POST /teams/{id}/submissions` | leader only | `{level: 1|2, submission_url}` — Level 1 expects Google Drive PPT link. Enforces `level1_open` and `level2_open` admin toggles. |

---

## Screening & Evaluation — `routers/screening.py`

State machine transitions: `registered → l1_submitted → l1_under_review → l1_cleared → l2_submitted → l2_under_review → selected`.

| Method & path | Auth | Notes |
|---|---|---|
| `POST /teams/{id}/screening/{level}/review` | coordinator+ | `{score, feedback, pass}`. `level` is `1` or `2`. Auto-transitions status. Setting `pass: true` for Level 1 unlocks Level 2 for the team. |

---

## Problem Statements — `routers/problem_statements.py`

| Method & path | Auth | Description |
|---|---|---|
| `GET /problem-statements?q=&theme=` | public | Search problem statements with `$regex` sanitization (`re.escape`). |
| `PUT /problem-statements/{id}` | admin | Upsert problem statement entry. |

---

## Announcements — `routers/announcements.py`

| Method & path | Auth | Description |
|---|---|---|
| `GET /announcements` | public | Fetch official hackathon announcements. |
| `POST /announcements` | coordinator+ | Post new announcement. |

---

## Results & Statistics — `routers/results.py`, `routers/stats.py`

| Method & path | Auth | Description |
|---|---|---|
| `GET /results` | public | Teams with `status == "selected"`. |
| `POST /results/publish` | spoc | Publishes final SIH results. |
| `GET /stats/public` | public | Live counts `{teams_registered, ideas_submitted, problem_statements, days_to_deadline}`. |
| `GET /stats/admin` | coordinator+ | Live dynamic metrics `{total_teams, total_students, by_stage, selected}`. |

---

## Promotions ("Spread the Spark") — `routers/promotions.py`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /promotions` | coordinator+ | Create promo post: `{title, caption, hashtags, media_url}`. |
| `GET /promotions` | public | Promo posts with computed `share_count`. |
| `POST /promotions/{id}/shares` | **public, rate limited (30/min)** | `{student_name, usn, post_url, is_public_on_wall}`. Server detects platform from `post_url`. |
| `GET /promotions/shares` | coordinator+ | All submitted share links. |
| `GET /promotions/wall` | public | Shares marked `is_public_on_wall: true`. |

---

## Platform Detection Logic

`detect_platform(url)` matches hostname against (`instagram.com`, `linkedin.com`, `facebook.com`, `x.com`/`twitter.com`, `whatsapp.com`, `youtube.com`/`youtu.be`) or falls back to `"Other"`.

---

## Error Handling

FastAPI standard: `{"detail": "message"}` with HTTP status codes (401/403/404/409/422/429/500). Global exception handler intercepts unhandled backend crashes, suppressing tracebacks in production.
