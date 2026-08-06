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
    <footer className="relative z-[3] overflow-hidden bg-ink text-paper">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-spark" style={{ boxShadow: '0 0 10px var(--color-spark-glow)' }} />
              <span className="font-display text-[1.15rem] font-bold">Ignite</span>
            </div>
            <p className="mt-4 max-w-[28ch] text-[0.92rem] text-paper/65">
              One idea, four stops, one nationwide stage — the SIH 2026 portal for Nagarjuna College of
              Engineering &amp; Technology.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href={COLLEGE_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="College Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold">
                <IconInstagram className={iconClass} />
              </a>
              <a href={COLLEGE_SOCIAL.youtube} target="_blank" rel="noopener noreferrer" aria-label="College YouTube" className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold">
                <IconYoutube className={iconClass} />
              </a>
              <a href={COLLEGE_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="College LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-marigold hover:text-marigold">
                <IconLinkedIn className={iconClass} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {LINK_GROUPS.map((group) => (
              <div key={group.heading}>
                <div className="mono text-[0.64rem] text-spark-glow">{group.heading}</div>
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

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/10 py-7 text-[0.85rem] text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/nagarjuna-logo.webp" alt="Nagarjuna College of Engineering & Technology" className="h-7 w-auto opacity-90" />
            <span>© 2026 Nagarjuna College of Engineering &amp; Technology</span>
          </div>
          <span>
            Developed by{' '}
            <a
              href="https://www.linkedin.com/in/partha-shankar?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-marigold hover:underline"
            >
              Partha Shankar
            </a>{' '}
            &amp;{' '}
            <a
              href="https://www.linkedin.com/in/nirmith-m-jain-3126b027a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-marigold hover:underline"
            >
              Nirmith M Jain
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
