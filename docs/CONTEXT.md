# Project Context

Who this is for, why certain decisions were made, and what changed mid-build and why. The other docs describe the system as it is; this one explains how it got here.

## Who and what

Internal SIH 2026 screening portal for **Nagarjuna College of Engineering & Technology**. Built by two students:

- **Partha Shankar** — designed and built the entire portal (frontend, backend, screening flow, admin console).
- **Nirmith M Jain** — assisted with the frontend design.

Both are also coordinators for the college's internal hackathon — a dual role that shaped a few decisions below (e.g. the coordinator bios deliberately don't claim they personally review every submission, because in reality they don't; someone else on the SPOC/faculty side handles that).

Named people baked into seed data and copy throughout: SPOC **Bhargav R**, coordinators **Partha Shankar** and **Nirmith M Jain**, Principal **Thippeswamy**.

## Why the visual direction is what it is

The very first ask was open-ended: *"design a unique, creative frontend — not a typical website, not vibe-coded."* That produced the Spark Thread concept (`docs/DESIGN_SYSTEM.md`) and two throwaway concept mockups (published as standalone artifacts, referenced in early chat history) before any real code was written. The palette went through one full revision — an early navy/parchment/saffron-green version was explicitly rejected ("not pleased with the present colors... make it different light colors") in favor of the current ivory/marigold/indigo system.

## Why "Spread the Spark" doesn't require login

It didn't start that way. The first version required a participant login and credited shares to the logged-in team. Two pieces of direct feedback changed that:

1. *"there is no credit"* — logging a share silently wasn't satisfying; students wanted visible proof they'd been counted.
2. *"there is no need to login to paste the link"* — since the form already collects name + USN, requiring a separate login was redundant friction.

The fix addressed both at once: drop the auth requirement, and make credit visible immediately (*"You're #N to share this one"* on submit, plus a public Spark Wall listing everyone who's shared). The public-wall opt-in checkbox was added, then removed again two messages later (*"remove this"*) — it's now unconditional (every submission appears on the wall; `is_public_on_wall` defaults to `true` server-side and the client no longer exposes a toggle).

## Why the two login pages actively reject each other's accounts

Originally, `/admin` and `/login` shared one login form's worth of logic, and a coordinator logging in via the public page would just get redirected to `/admin`. The explicit ask was stricter than that: *"make sure that admin credentials do not work in the login page of the team, also team credentials do not work in [admin]."* The fix isn't a redirect — each page now checks the returned role and calls `logout()` immediately if it's wrong, showing the same generic "incorrect email or password" a bad password would produce. Neither surface ever confirms an email/role combination exists.

## Why there's no separate "admin" account

The original architecture spec had four roles (`participant / coordinator / spoc / admin`). In practice, this college only has three non-participant humans, and none of them needed a role above `spoc`. Rather than invent a fourth account for nobody, the seed data uses exactly the three real accounts, and every admin-panel route is gated at `coordinator` rank (which `spoc` also satisfies, per the rank hierarchy).

## Why some data is mock and some is real

Early on, the admin **Registrations** table needed to prove the UI holds up with "1000+ students" — a real, explicit requirement. Generating 1,247 rows through the actual registration API would have been slow and pointless (they're not real students), so `lib/data.ts` generates them with a seeded PRNG instead. Everything a real user actually does — register, log in, create a team, add members, submit work, get screened, share a promo link — hits the real FastAPI backend. The dashboard's "your team" view still reads from the mock roster (deterministically, by hashing your email) rather than the team you actually created, which is the one piece of mock data that's slightly misleading if you don't know it's there — hence it being called out explicitly in `docs/FRONTEND.md`.

## Why the theme images are what they are, not something else

18 problem-statement theme images were sourced from Openverse (aggregating Flickr, Wikimedia Commons, etc. under CC licenses), not generated, and not hot-linked — downloaded once into `frontend/public/themes/` and committed. Two things went wrong in the process, worth remembering if this needs redoing:

- **Wikimedia's own upload CDN rate-limits aggressive/automated fetching** (`HTTP 429` with a generic "Wikimedia Error" page) — fetching many images back-to-back from `upload.wikimedia.org` directly will get blocked. Openverse's search results mostly point to *original* hosts (Flickr, etc.) instead, which don't share that limit.
- **Automated top-result selection produces some genuinely bad matches** — a search for "green technology" returned an abstract macro photo of colored glass; "fintech" returned a fringe conspiracy-meme image with a gas mask. Every one of the 18 was manually reviewed before being committed; 5 of the first-pass picks were thrown out and re-searched. Don't trust the first result blindly if this list is ever regenerated. `frontend/public/themes/SOURCES.json` records the title/creator/license/source URL for each image kept, for attribution.

## Open items, honestly

- MongoDB Atlas isn't connected — see `docs/ARCHITECTURE.md`. Everything resets on backend restart.
- Cloudinary upload signing isn't wired (`POST /uploads/sign` doesn't exist yet) — submission URLs are plain text links, not uploaded files.
- No rate limiting on auth endpoints.
- No automated tests (frontend or backend) — verification so far has been manual: `tsc --noEmit`, and Playwright smoke scripts run ad hoc during the build, not checked into the repo as a suite.
