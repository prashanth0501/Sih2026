import { Link } from 'react-router-dom';
import { COLLEGE_SOCIAL } from '@/lib/data';
import { IconInstagram, IconYoutube, IconLinkedIn } from '@/components/icons';

const LINK_GROUPS = [
  {
    heading: 'Explore',
    links: [
      { to: '/why-sih', label: 'Why SIH' },
      { to: '/why-join', label: 'Why Join' },
      { to: '/problem-statements', label: 'Explorer' },
      { to: '/timeline', label: 'Timeline' },
      { to: '/rules', label: 'Rules' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { to: '/people', label: 'People' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/updates', label: 'Updates' },
      { to: '/spread-the-spark', label: 'Spread the Spark' },
      { to: '/spark-story', label: "Spark's Story" },
      { to: '/results', label: 'Results' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact' },
      { to: '/register', label: 'Register' },
      { to: '/login', label: 'Log in' },
    ],
  },
  {
    heading: 'Legal & team',
    links: [
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/developers', label: 'Meet the developers' },
    ],
  },
];

const iconClass = 'h-4 w-4';

export function Footer() {
  return (
    <footer className="relative z-[3] w-full overflow-hidden bg-ink text-paper border-t border-paper/10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-14 pb-8 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-spark" style={{ boxShadow: '0 0 10px var(--color-spark-glow)' }} />
              <span className="font-display text-[1.25rem] font-bold">Ignite</span>
            </div>
            <p className="mt-4 max-w-[28ch] text-[0.92rem] text-paper/65">
              One idea, four stops, one nationwide stage — the SIH 2026 portal for Nagarjuna College of
              Engineering &amp; Technology.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={COLLEGE_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="College Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold"
              >
                <IconInstagram className={iconClass} />
              </a>
              <a
                href={COLLEGE_SOCIAL.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="College YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold"
              >
                <IconYoutube className={iconClass} />
              </a>
              <a
                href={COLLEGE_SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="College LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold"
              >
                <IconLinkedIn className={iconClass} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {LINK_GROUPS.map((group) => (
              <div key={group.heading}>
                <div className="mono text-[0.68rem] font-bold text-spark-glow tracking-wider uppercase">{group.heading}</div>
                <ul className="mt-3.5 grid gap-2.5 text-[0.88rem] text-paper/70">
                  {group.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="transition-colors hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CREATIVE DEVELOPER CREDITS (NO EMOJIS — CLEAN, STANDARD, HIGH-END STYLING) */}
        <div className="mt-12 flex flex-col gap-6 border-t border-paper/15 pt-8 text-[0.9rem] text-paper/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/nagarjuna-logo.webp" alt="Nagarjuna College Logo" className="h-8 w-auto opacity-90" />
            <span className="text-[0.85rem]">© 2026 Nagarjuna College of Engineering &amp; Technology</span>
          </div>

          {/* Clean Developer Credit Pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-[0.95rem]">
            <span className="mono text-[0.78rem] text-paper/60 uppercase tracking-wide">Developed by</span>
            <a
              href="https://www.linkedin.com/in/partha-shankar?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-marigold/40 bg-marigold/10 px-3.5 py-1 font-display text-[0.92rem] font-bold text-marigold shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all hover:scale-105 hover:border-marigold hover:bg-marigold hover:text-ink"
            >
              <span className="mono text-xs font-bold">•</span> Partha Shankar
            </a>
            <span className="text-paper/40 font-mono">&amp;</span>
            <a
              href="https://www.linkedin.com/in/nirmith-m-jain-3126b027a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-marigold/40 bg-marigold/10 px-3.5 py-1 font-display text-[0.92rem] font-bold text-marigold shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all hover:scale-105 hover:border-marigold hover:bg-marigold hover:text-ink"
            >
              <span className="mono text-xs font-bold">•</span> Nirmith M Jain
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
