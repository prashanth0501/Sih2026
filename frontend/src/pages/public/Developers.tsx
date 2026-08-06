import { Reveal } from '@/components/Reveal';
import { DEVELOPERS } from '@/lib/data';
import { IconLinkedIn, IconMail, IconPhone } from '@/components/icons';

const iconBtn =
  'flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-marigold hover:text-marigold hover:bg-marigold/5';

export function Developers() {
  return (
    <div className="mx-auto max-w-[960px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">Behind the portal</div>
          <h1 className="mx-auto text-[clamp(2rem,5vw,3rem)]">Meet the Developers</h1>
          <p className="lede mx-auto mt-5 max-w-[65ch]">
            This portal was designed and built entirely by two students at this college. If something's
            broken, or you just want to talk shop, reach out directly.
          </p>
        </div>
      </Reveal>

      <div className="relative mt-20 grid gap-16 sm:grid-cols-2 sm:gap-8">
        <svg
          className="pointer-events-none absolute left-1/2 top-16 hidden -translate-x-1/2 sm:block"
          width="240"
          height="4"
          aria-hidden="true"
        >
          <line x1="0" y1="2" x2="240" y2="2" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="2 8" />
        </svg>

        {DEVELOPERS.map((dev, i) => (
          <Reveal key={dev.name} delay={i * 0.12}>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className="absolute inset-[-14%] rounded-full opacity-70 blur-xl"
                  style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 72%)' }}
                />
                <img
                  src={dev.photoUrl}
                  alt={dev.name}
                  className="relative h-44 w-44 rounded-full object-cover shadow-xl shadow-ink/15 sm:h-52 sm:w-52"
                />
                <span
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-marigold text-[0.9rem] text-paper shadow-md"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </div>

              <h2 className="mt-6 font-display text-[1.4rem] font-bold">{dev.name}</h2>
              <div className="mono mt-1.5 text-[0.68rem] text-marigold">{dev.role}</div>
              <p className="mt-4 max-w-[36ch] text-[0.92rem] text-ink-soft">{dev.bio}</p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${dev.name} on LinkedIn`} className={iconBtn}>
                  <IconLinkedIn className="h-[18px] w-[18px]" />
                </a>
                <a href={`mailto:${dev.email}`} aria-label={`Email ${dev.name}`} className={iconBtn}>
                  <IconMail className="h-[18px] w-[18px]" />
                </a>
                <a href={`tel:${dev.phone.replace(/\s+/g, '')}`} aria-label={`Call ${dev.name}`} className={iconBtn}>
                  <IconPhone className="h-[18px] w-[18px]" />
                </a>
              </div>
              <div className="mono mt-3 text-[0.68rem] text-ink-soft/70">{dev.email} · {dev.phone}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
