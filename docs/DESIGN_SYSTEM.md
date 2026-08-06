# Design System — "The Spark Thread"

## The concept

One idea's journey — concept → Level 1 → Level 2 → finale — is drawn as a literal glowing thread that runs through the site. It shows up three times, in three shapes, which is what makes it read as one designed system rather than three unrelated features:

1. **Landing page** — a generated (never hand-authored) wavy SVG path (`components/SparkThread.tsx`) that draws itself as you scroll, with a spark marker traveling along it via `getPointAtLength`. Hidden below 900px — see "Mobile is different" below.
2. **The Spark's Story** (`/spark-story`) — an 8-chapter, full-screen scroll-snap narrative where a background glow literally grows and brightens chapter by chapter, visualizing the idea getting bigger.
3. **Participant dashboard** — the same 4-stage thread becomes the team's literal status bar, spark sitting at whatever node the team currently occupies.

**Explicit anti-goals**, stated early and held to throughout: no 3D/particle hero (the single most common tell of a generic AI-generated site right now), no centered-hero-stack-of-cards template layout, no stock illustration, no lorem ipsum.

## Palette

Light-only, deliberately — no dark mode, no toggle. This was a direct instruction partway through the build (an earlier navy/parchment/saffron-green version was rejected as not vivid enough).

| Token (`index.css` `@theme`) | Value | Use |
|---|---|---|
| `--color-ink` | `#241b3a` | body text — warm deep plum, not navy or black |
| `--color-paper` | `#fcf8ef` | canvas — bright warm ivory |
| `--color-marigold` | `#ff7a1a` | primary accent, CTAs, "Post" tag |
| `--color-indigo` | `#4a3ab4` | secondary accent, "Update" tag |
| `--color-spark` | `#ffa92e` | the thread + glow — used nowhere else |
| `--color-line` | `rgba(36,27,58,.13)` | borders |

## Type

**Fraunces** (display, bold/editorial, large and tight-tracked — not the soft airy serif-on-cream look that's become an AI-design cliché) + **IBM Plex Sans** (body) + **IBM Plex Mono** (eyebrows, stat labels, step numbers — the "circuit" half of a tradition-meets-technology pairing). All three self-hosted as `.woff2` in `frontend/public/fonts/`.

## The `.eyebrow` / `.lede` pattern

Every page opens with the same three-part header: a small mono kicker label (`.eyebrow`), a display headline, and an intro paragraph (`.lede`). Both classes live in `index.css` specifically so a global size/weight/color change is a two-line edit — this happened once already mid-build (the eyebrow was originally small and left-aligned; feedback asked for it "enlarged and centralised," and because it was one CSS class instead of 16 inlined Tailwind strings, the fix took one edit + a `sed` pass, not sixteen file edits).

```css
.eyebrow { font-family: var(--font-mono); font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: var(--color-marigold); font-size: 1.05rem; }
.lede { color: var(--color-ink); opacity: .88; font-size: 1.12rem; font-weight: 450; }
```

Most page headers wrap this trio in a `.text-center` div with `mx-auto` on the headline/lede, so the block reads as one centered unit rather than a centered label above a left-aligned headline.

## Circular "spotlight" portraits, not boxed cards

People, Developers, and Contact all use the same photo treatment: a circular photo with a soft radial glow behind it (same `--color-spark-glow` used everywhere else), rather than a bordered rectangle with the photo inset. This was an explicit redesign — an earlier version used square bordered cards, and feedback was direct: *"remove the square from here, just circle is enough."* Developers additionally connects the two portraits with a dashed line generated in SVG (not hand-authored path data) as a small motif for "two people, one project."

## Mobile is a different design, not a shrunk desktop

Three concrete swaps, not just breakpoints:
- Nav collapses to a bottom sheet (thumb reach) instead of a corner dropdown.
- The pipeline steps become a horizontal, `.snap-x-strip` snap-scroll strip instead of a stacked grid.
- The `SparkThread` SVG doesn't render at all below 900px — it doesn't work without room to breathe, so it's not squeezed, it's absent, and the layout doesn't try to compensate for its absence.

## Signature interactions

- **Reveal** (`components/Reveal.tsx`) — a thin `whileInView` wrapper (Framer Motion), used instead of scattering `initial`/`animate` props across every page.
- **StatCounter** — odometer-style count-up on scroll-into-view, respects `prefers-reduced-motion` (jumps straight to the target instead of animating).
- **Magnetic buttons** (`components/ui/Button.tsx`) — subtle cursor-follow on desktop pointer devices only (`hover:hover) and (pointer:fine)`), inert on touch.
- Everything above degrades gracefully: reduced-motion users get instant states, keyboard focus is always visible (`:focus-visible` outline in `index.css`).

## A real, if minor, CSS bug worth remembering

Early in the build, several "the page scrolls past the footer" reports turned out to be two different things layered on top of each other:

1. **Most of the time**, it was the site being genuinely broken (a bad import after a rename) — not a CSS bug at all. Lesson: verify the app actually renders before debugging layout.
2. **Once it was real**: on a page shorter than the viewport, `<body>`'s background only paints its own (short) box. The remaining viewport space fell through to `<html>`, which had no background set, showing the browser's default white. Fixed by giving `html` the same paper background plus `min-height: 100%`, and `body` a `min-height: 100vh`. See `index.css`.
