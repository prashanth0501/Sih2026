# Frontend Design Plan — SIH 2026 College Portal

Companion to `ARCHITECTURE.md`. This is the creative/UX layer on top of that system design — it adds a visual identity, a page-by-page plan across all three surfaces, and one new feature line (student-led promotion) that the architecture doc didn't originally cover. Nothing here contradicts the architecture doc's roles, state machine, or API shape; it extends section 5 (data model), section 7 (API), and section 8 (frontend structure).

Two live concept mockups, both with real motion/interaction, shared in chat:
- **Ignite** — the landing page.
- **The Spark's Story** — a full-screen, chapter-by-chapter scroll story of one idea's journey, linked from Ignite's nav.

Treat both as the reference for tone, not a literal template to copy-paste — the real build should push further once real content (real coordinator photos, real problem statements, real counts) is in.

---

## 1. Creative concept: "The Spark Thread"

One idea's journey — concept → Level 1 → Level 2 → finale — is drawn as a literal glowing thread that runs through the site. It's generated as an SVG path (never hand-authored point data) and scroll-scrubbed: as the visitor scrolls, the thread draws itself and a spark marker travels along it. The same visual vocabulary reappears in three places, which is what makes the whole thing read as *designed*, not assembled:

- **Landing page** — the thread is the scroll spine of the page itself.
- **Participant dashboard** — the thread becomes the team's literal status bar; the spark sits at whatever node the team currently occupies.
- **Admin funnel view** — the same pipeline shape, aggregated across all teams.

Explicit anti-goals, because "creative" without guardrails drifts into cliché: no 3D/particle hero (the single biggest tell of a generic AI-generated site right now), no centered-hero-stack-of-cards layout, no stock illustration, no lorem-ipsum in the real build.

## 2. Visual identity

| Token | Value | Use |
|---|---|---|
| `--ink` | `#241B3A` | body text — a warm deep plum, not navy or black |
| `--paper` | `#FCF8EF` | canvas — bright warm ivory |
| `--marigold` | `#FF7A1A` | primary accent, CTAs |
| `--indigo` | `#4A3AB4` | secondary accent, contrast pop |
| `--spark` | `#FFA92E` | the thread + glow, used nowhere else |

Type: **Fraunces** (display, bold/editorial, used large and tight-tracked — not the soft airy serif-on-cream look) + **IBM Plex Sans** (body) + **IBM Plex Mono** (eyebrows, stat labels, step numbers — the "circuit" half of the tradition-meets-technology idea). Full palette/type spec and working code are in the Ignite artifact's `:root` tokens.

**Light-only, deliberately.** This is a committed visual world — a warm, bright, paper-and-ink identity — not a light mode with a dark mode bolted on. No dark theme, no toggle.

## 3. Signature interactions

- **Load ritual** — first paint, the spark ignites and the thread draws itself before the page settles (skippable, `prefers-reduced-motion`-safe).
- **Scroll-scrubbed thread** — `stroke-dashoffset` + `getPointAtLength` tied to scroll fraction, not a canned animation.
- **Orbit nav**, not a static navbar — a single button expands a compact menu; on the problem-statement explorer, themes sit on an actual orbit around a central hub instead of a card grid.
- **Magnetic CTAs**, flip-card people profiles, odometer stat counters, cross-page transitions where the thread carries across routes instead of a hard cut.
- Everything above degrades gracefully: reduced-motion users get instant states, no motion sickness triggers, keyboard focus is always visible.

**Mobile is a different design, not a shrunk desktop.** Three concrete swaps, not just breakpoints:
- Nav collapses to a bottom sheet (thumb reach) instead of a corner dropdown.
- The pipeline steps become a horizontal, snap-scroll swipe strip instead of a stacked grid.
- The orbiting problem-statement wheel — which only works with room to breathe — becomes a horizontal scroll chip strip on phones, not a squeezed circle.

## 3b. "The Spark's Story" — a dedicated story page

A second, standalone experience reachable from the main nav: one idea's journey told as eight full-screen chapters (cover → spark → team forms → Level 1 → Level 2 → finale → your turn), scroll-snapped one per screen, with a side progress rail (bottom rail on mobile), arrow-key navigation, and a background glow that grows and intensifies chapter by chapter — the idea visibly getting bigger as the story moves forward. Plain, short sentences throughout; no jargon. This is the page to send a junior who needs to feel what SIH is about in ninety seconds, before they've read a single feature list.

## 4. Page plan by surface

### Public site
1. **Landing** — spark thread genesis, live counters from `/stats/public`, pipeline teaser.
2. **Why SIH** — scroll-driven data story (3–4 claims, not a wall of text).
3. **Timeline** — horizontal milestone rail.
4. **Problem Statement Explorer** — orbit layout, 18 themes, search + filter.
5. **Principal's Message** — cinematic centerpiece (portrait/video).
6. **Team / Coordinators** — flip cards for Bhargav, Partha, Nirmith.
7. **Register** — multi-step wizard; each step lights a pipeline node.
8. **Results** — funnel/podium reveal, confetti on publish, certificate download.
9. **Spread the Spark** — new, see §6.
10. **FAQ / Contact** — deliberately calm; not every page needs spectacle.

### Participant dashboard
- Team status rendered as the literal thread/pipeline with the spark at the current node.
- Submissions as stamped "envelopes"; feedback as a report-card reveal, not raw JSON.
- **My Promotion Kit** — the participant-facing half of §6.

### Admin / coordinator panel
- Kept dense and utilitarian by design — coordinators need speed, not spectacle.
- Registrations table, screening console driving the state machine, funnel analytics reusing the pipeline shape.
- **Promotion Composer** — the admin-facing half of §6.

## 5. Tech approach

Framer Motion + native `useScroll`/`useTransform` for the thread; no GSAP, no Three.js. Motion-heavy sections lazy-loaded. Design tokens live in `frontend/src/lib` as the single source of colour/type/spacing, matching the architecture doc's existing structure.

---

## 6. New feature: "Spread the Spark" (student-led promotion)

Not in the original architecture doc — added per your direction: promotional videos are AI-generated by students themselves, and the portal's job is to turn that content into something students will actually post as their own, then get credit for having posted it.

**Flow:**
1. A student (or coordinator) produces a promo video/asset elsewhere (AI tools, own editing) and hands it to an admin, or a coordinator/admin drafts caption copy directly.
2. **Admin posts it** through a Promotion Composer: title, caption, hashtags, and the media (uploaded to Cloudinary like any other asset, or a link if it's already hosted).
3. It appears on the public **Spread the Spark** page as a ready-to-post card: preview, a **Copy caption** button (caption + hashtags in one click), and share actions.
4. The student posts it *as their own content* on their own social account — the portal never posts on anyone's behalf.
5. The student comes back and **pastes the link to their live post**. That submission is logged against their team.
6. Admin/coordinators see all submissions in one console; a public **Spark Wall** can showcase who's spreading the word — real social proof, and a small recognition mechanic for juniors.

**Why the "copy + share" pattern instead of auto-posting:** no platform lets a third-party site post to Instagram/WhatsApp/LinkedIn on a user's behalf without OAuth and business review overhead that isn't worth it here. The realistic mechanism is:
- **Web Share API** (`navigator.share`) on mobile — hands off to the native share sheet (works for Instagram, WhatsApp, everything installed).
- **Direct intent links** on desktop for platforms that support them: WhatsApp (`wa.me`), X (`twitter.com/intent/tweet`), LinkedIn (`linkedin.com/sharing/share-offsite`), Facebook (`facebook.com/sharer`).
- Instagram has no web share-intent — for that platform the card just offers **Copy caption + Download asset**, since posting there is inherently a manual, in-app action.

**Data model additions (extends architecture §5):**

```
promoPosts
{ _id, title, caption, hashtags: [string], mediaUrl, mediaType, createdBy, isPublished, createdAt }

promoShares
{ _id, promoPostId, teamId, submittedBy, platform, postUrl, isPublicOnWall, status: "pending"|"verified", submittedAt }
```

`isPublicOnWall` is an explicit opt-in from the student before their post URL appears on the public Spark Wall — publishing someone's personal social link without consent by default is a privacy miss, not just a nice-to-have.

**API additions (extends architecture §7):**

- `POST /promotions` — create a promo post (admin/coordinator)
- `GET /promotions` — list published promo posts (public)
- `PATCH /promotions/{id}` / `DELETE /promotions/{id}` — admin
- `POST /promotions/{id}/shares` — submit a posted link (participant, authenticated)
- `GET /promotions/{id}/shares` — review submissions (coordinator+)
- `GET /promotions/wall` — public, opted-in shares only

**Frontend additions:**
- Public `Spread the Spark` page (card feed, copy + share actions, "submit your link" form).
- Dashboard widget: "Your team's shares" — quick status of what's been submitted.
- Admin `Promotion Composer` + a submissions review table alongside the existing screening console.

---

## Open decisions for you

- Should "Spread the Spark" be public (visible to anyone, pre-registration — useful as a recruitment funnel) or gated to logged-in participants only?
- Does a submitted share need coordinator verification before it counts toward anything (e.g. a small leaderboard/recognition), or is logging it enough?
