import { useEffect, useRef, useState } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Chapter = {
  id: string;
  label: string;
  title: string;
  body: string;
  glowSize: string;
  glowOpacity: number;
  dark?: boolean;
  cta?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    id: 'cover',
    label: 'A story in eight parts',
    title: 'This is the story\nof one idea.',
    body: 'It could be yours.',
    glowSize: '38vmax',
    glowOpacity: 0.16,
  },
  {
    id: 'ch1',
    label: 'Chapter 1',
    title: 'It starts small.',
    body: 'Somewhere on campus, right now, a student is looking at a problem. No plan yet. Just a feeling — this could be better.',
    glowSize: '8vmax',
    glowOpacity: 0.5,
  },
  {
    id: 'ch2',
    label: 'Chapter 2',
    title: 'The spark.',
    body: "One evening, an idea shows up. It's simple. A little bit crazy. Worth trying.",
    glowSize: '16vmax',
    glowOpacity: 0.65,
  },
  {
    id: 'ch3',
    label: 'Chapter 3',
    title: 'The team forms.',
    body: 'An idea needs hands. A few people come together — different skills, one goal.',
    glowSize: '26vmax',
    glowOpacity: 0.7,
  },
  {
    id: 'ch4',
    label: 'Chapter 4 · Level 1',
    title: 'They send it in.',
    body: 'The team writes it down and submits it. A coordinator reads every word and writes back with real feedback.',
    glowSize: '38vmax',
    glowOpacity: 0.75,
  },
  {
    id: 'ch5',
    label: 'Chapter 5 · Level 2',
    title: 'It gets sharper.',
    body: 'What was rough is now real. The idea goes back in front of the judges — better than before.',
    glowSize: '52vmax',
    glowOpacity: 0.85,
  },
  {
    id: 'ch6',
    label: 'Chapter 6 · The finale',
    title: 'Their name is on the list.',
    body: 'The SPOC publishes the results. Somewhere, a classroom just made history.',
    glowSize: '70vmax',
    glowOpacity: 1,
    dark: true,
  },
  {
    id: 'ch7',
    label: 'Your turn',
    title: 'Every story on this\nlist starts the same way.',
    body: 'Someone hits register.',
    glowSize: '20vmax',
    glowOpacity: 0.25,
    cta: true,
  },
];

export function SparkStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = chapterRefs.current.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') return;
      e.preventDefault();
      const delta = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : -1;
      const next = Math.min(Math.max(active + delta, 0), CHAPTERS.length - 1);
      chapterRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <div className="relative">
      <nav
        aria-label="Chapter progress"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 sm:flex md:right-8"
      >
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            aria-label={`Go to: ${c.label}`}
            onClick={() => chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={cn(
              'h-2.5 w-2.5 rounded-full border transition-transform',
              active === i ? 'scale-125 border-marigold bg-marigold' : 'border-ink-soft bg-transparent'
            )}
          />
        ))}
      </nav>

      <div
        ref={containerRef}
        className="h-dvh snap-y snap-mandatory overflow-y-scroll motion-reduce:snap-none"
      >
        {CHAPTERS.map((c, i) => (
          <section
            key={c.id}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
            className={cn(
              'relative flex h-[100dvh] snap-start flex-col items-center justify-center overflow-hidden px-6 text-center',
              c.dark && 'bg-ink text-paper'
            )}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]"
              style={{
                width: c.glowSize,
                height: c.glowSize,
                opacity: c.glowOpacity,
                background: c.dark
                  ? 'radial-gradient(circle, var(--color-spark-glow), var(--color-marigold) 35%, var(--color-indigo) 75%, var(--color-ink) 100%)'
                  : i === CHAPTERS.length - 1
                    ? 'radial-gradient(circle, var(--color-spark-glow), transparent 70%)'
                    : 'radial-gradient(circle, var(--color-spark-glow), var(--color-marigold) 55%, transparent 78%)',
              }}
            />
            <div className="relative z-[1] max-w-xl">
              <div className={cn('mono mb-5 text-[0.72rem]', c.dark ? 'text-spark-glow' : 'text-marigold')}>{c.label}</div>
              <h2 className="whitespace-pre-line text-[clamp(2rem,7vw,3.6rem)] font-bold leading-[1.05]">{c.title}</h2>
              <p className={cn('mt-5 text-[clamp(1rem,2.2vw,1.2rem)] leading-relaxed', c.dark ? 'text-paper/80' : 'text-ink-soft')}>
                {c.body}
              </p>
              {c.cta && (
                <div className="mt-8 flex justify-center">
                  <LinkButton to="/register" variant="primary">
                    Start your team's story →
                  </LinkButton>
                </div>
              )}
            </div>
            {i === 0 && (
              <div className="mono absolute bottom-9 flex flex-col items-center gap-1.5 text-[0.68rem] text-ink-soft">
                <span>Scroll to begin</span>
                <span className="animate-bounce motion-reduce:animate-none">↓</span>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
