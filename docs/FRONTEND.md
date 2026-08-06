# Frontend Architecture & Component Implementation

React 19 + TypeScript, built with Vite, styled with Vanilla CSS design tokens & Tailwind CSS. Client-rendered SPA powered by React Router and TanStack Query.

## Directory Structure

```
frontend/src/
  api/            Axios API client with JWT interceptor & rate-limit error handlers
    client.ts, auth.ts, teams.ts, screening.ts, stats.ts, settings.ts, promotions.ts
  components/
    layout/       NavBar, Footer, PublicLayout, AppShell
    ui/           Button, StatusBadge, StatCounter, FlipCard
    icons.tsx      Shared inline SVG icon components
    SparkThread.tsx Overflow-bounded scroll-linked SVG thread (Landing & Public pages)
    Reveal.tsx     whileInView motion wrapper
    AdminGate.tsx  /admin gate wrapper
    ProtectedRoute.tsx /dashboard route guard
  lib/
    auth.tsx       AuthContext — JWT auth & role permission checks
    data.ts        Static content: problem themes, people, timeline, rules
    utils.ts       cn(), detectPlatform(), initials()
  pages/
    public/        16 public routes
    dashboard/     Participant Team Dashboard & Submissions
    admin/         Coordinator & SPOC Admin Console
  App.tsx          App routes
  index.css        Design tokens & responsive typography
```

---

## Route Table (`App.tsx`)

- **Public Routes** (wrapped in `PublicLayout`):
  `/`, `/why-sih`, `/why-join`, `/timeline`, `/problem-statements`, `/rules`, `/spark-story`, `/people`, `/developers`, `/updates`, `/spread-the-spark`, `/results`, `/faq`, `/contact`, `/login`, `/register`, `/privacy`.

- **Participant Dashboard** (wrapped in `ProtectedRoute` → `AppShell`):
  `/dashboard`, `/dashboard/members`, `/dashboard/submissions`, `/dashboard/announcements`.

- **Admin Console** (wrapped in `AdminGate` → `AppShell`):
  `/admin`, `/admin/teams` (Lock), `/admin/registrations`, `/admin/screening` (Console & Toggles), `/admin/promotions`, `/admin/updates`, `/admin/content`.

---

## Key Workflows & Features

### 1. Team Registration & Compulsory Member GitHub URLs ([`Register.tsx`](file:///d:/sih2026/frontend/src/pages/public/Register.tsx))
- **GitHub URLs**: Requires a valid GitHub profile URL (`github_url`) for the team leader and **every team member** added during registration.
- **Admin Settings Enforcement**: Displays a clean "Registrations Are Closed" banner if `registration_open === false` in system settings.

### 2. Level 1 Google Drive PPT Submissions & Gated Level 2 ([`Submissions.tsx`](file:///d:/sih2026/frontend/src/pages/dashboard/Submissions.tsx))
- **Level 1**: Expects shared Google Drive presentation link (`submission_url`).
- **Gated Progression**: Level 2 submission & details are **strictly locked** (`🔒 Locked`) until a team's Level 1 PPT is selected and cleared (`l1_cleared`) by admin screening.

### 3. Streamlined Admin Screening Console ([`ScreeningConsole.tsx`](file:///d:/sih2026/frontend/src/pages/admin/ScreeningConsole.tsx))
- **Portal Control Toggles**: Admins toggle `registration_open`, `level1_open`, and `level2_open` in real-time.
- **Google Drive PPT Button**: One-click **`📂 Open PPT in Google Drive ↗`** opens student presentation decks directly in a new tab.
- **Inline Scoring**: Admin enters score (0–100), adds reviewer notes, and clicks **`SELECT / CLEAR LEVEL 1 ✓`** or **`REJECT ✕`**.

---

## 100% Live Backend Integration

All admin pages (`AdminHome`, `Registrations`, `ScreeningConsole`, `TeamLock`) are 100% connected to live MongoDB API endpoints. `TEAMS` mock arrays are replaced with live query hooks (`useQuery`) refetching dynamic data from `/api/v1/teams` and `/api/v1/stats/admin`.

---

## Responsiveness & Design System

- **Primary Navbar & Drawer**: Top header features key links (`Home`, `Explorer`, `Timeline`, `Results`, `Dashboard`/`Admin`, `Register`). The toggle button (`✦`) opens an expanded slide-out drawer on all screens.
- **AppShell**: Responsive sidebar for desktop (`w-60`) + mobile top bar with horizontal scrollable sub-nav strip & sliding drawer.
