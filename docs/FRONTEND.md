# Frontend

React 19 + TypeScript, built with Vite, styled with Tailwind CSS v4. No SSR, no meta-framework — it's a client-rendered SPA behind React Router.

## Directory structure

```
frontend/src/
  api/            axios calls to the backend (client.ts holds the JWT interceptor)
  components/
    layout/       NavBar, Footer, PublicLayout, AppShell
    ui/           Button, StatusBadge, StatCounter, FlipCard
    icons.tsx      shared inline SVG icon components
    SparkThread.tsx    the scroll-linked SVG thread (landing/public pages only)
    Reveal.tsx     whileInView fade+slide wrapper, used on almost every page
    AdminGate.tsx  the /admin route guard (see below)
    ProtectedRoute.tsx  the /dashboard route guard
  lib/
    auth.tsx       AuthContext — login/signup/logout, reads real API
    data.ts        static/derived content: problem themes, people, timeline, mock roster
    utils.ts       cn(), detectPlatform(), initials()
  pages/
    public/        16 routes, see below
    dashboard/      participant-only
    admin/          coordinator+ only
  App.tsx           route table
  index.css         design tokens + global styles (see docs/DESIGN_SYSTEM.md)
```

## Route table (`App.tsx`)

**Public** (wrapped in `PublicLayout`: grain overlay, `SparkThread`, `NavBar`, `Footer`):
`/`, `/why-sih`, `/why-join`, `/timeline`, `/problem-statements`, `/rules`, `/spark-story`, `/people`, `/developers`, `/updates`, `/spread-the-spark`, `/results`, `/faq`, `/contact`, `/login`, `/register`, `/privacy`.

**Dashboard** (wrapped in `ProtectedRoute minimumRole="participant"` → `AppShell`):
`/dashboard`, `/dashboard/members`, `/dashboard/submissions`, `/dashboard/announcements`.

**Admin** (wrapped in `AdminGate`, not `ProtectedRoute` — see below):
`/admin`, `/admin/registrations`, `/admin/screening`, `/admin/promotions`, `/admin/updates`, `/admin/content`.

## Two login surfaces, one auth endpoint

`AdminGate` (`components/AdminGate.tsx`) is intentionally different from `ProtectedRoute`:

```
if (!ready) return null
if (!user) return <AdminLogin />              // renders the login form in place — no redirect
if (!hasRole(user, 'coordinator')) return <AdminLogin denied />   // logged in, but not staff
return <Outlet />
```

There is no nav link to `/admin` anywhere for logged-out visitors — reaching it means typing the URL. `AdminLogin.tsx` and the public `Login.tsx` both call the same `login()` from `AuthContext`, but each one checks the returned role and calls `logout()` immediately if it doesn't belong on that surface, then shows the same generic error either page would show for bad credentials. Neither page ever reveals whether an email/role combination exists.

## State management

- **Auth**: `lib/auth.tsx` — a React Context wrapping the real `/auth/*` endpoints. Token lives in `localStorage` (`ignite.auth.token`); an axios interceptor in `api/client.ts` attaches it to every request.
- **Server data**: TanStack Query (`useQuery`/`useMutation`) for anything backend-backed — team data, promo posts/shares, registrations. `queryClient.invalidateQueries` after mutations (e.g. adding a team member, publishing a promo post).
- **Everything else**: local `useState`, no global store. There's no Redux/Zustand — the app doesn't need it.

## Mock vs. real data — the important distinction

`lib/data.ts` holds two categories of content that look similar but are not:

1. **Genuinely static content** — problem theme descriptions, the timeline phases, people bios, the 18 theme images. This is real content, just not something that needs a database row (nobody edits it through the admin panel yet).
2. **`TEAMS` — a synthetic 1,247-row roster**, generated with a seeded PRNG (`mulberry32`) so it's stable across reloads. This exists *specifically* to demonstrate the admin **Registrations** table (search/filter/pagination) at realistic scale, since the real backend's in-memory store starts empty. `getMyTeam(email)` derives a deterministic "team" from a hash of the logged-in email for the dashboard's status view — it is not the team that email actually registered.

Everything else — auth, team creation/members, submissions, screening decisions, promotions/shares, stats — talks to the real FastAPI backend. When wiring the dashboard/admin views to a real database, `TEAMS` and `getMyTeam` are the two things to delete; every real page already has a comment noting the endpoint it should call.

## Key interaction patterns

- **`.eyebrow` / `.lede`** (in `index.css`) — every page's small kicker label and intro paragraph use these two classes, not one-off Tailwind strings, specifically so a global size/color change (this happened once already, per user feedback) is a two-line CSS edit, not a 16-file find-and-replace.
- **`Reveal`** — a thin wrapper around Framer Motion's `whileInView`, used instead of scattering animation props across every page.
- **Circular "spotlight" portraits, not boxed cards** — People, Developers, and Contact all use the same photo treatment (glow ring behind a circular photo) instead of a bordered rectangle. This was a deliberate redesign after early versions used square cards.
- **Mobile gets different components, not just breakpoints** — the pipeline steps on the landing page become a horizontal snap-scroll strip (`.snap-x-strip`) below 900px instead of a shrunk grid; the problem-theme orbit (in the original concept mockups) became a chip strip on narrow screens.

## Fonts

Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (eyebrows/data) — self-hosted as `.woff2` files in `frontend/public/fonts/`, loaded via `@font-face` in `index.css`. Not loaded from Google Fonts at runtime (the original concept mockups inlined them as base64 for the same reason: no external font CDN at request time).
