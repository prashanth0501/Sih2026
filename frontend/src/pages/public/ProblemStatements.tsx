import { useMemo, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { PROBLEM_THEMES } from '@/lib/data';

export function ProblemStatements() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROBLEM_THEMES;
    return PROBLEM_THEMES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.blurb.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-24 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Problem Statements</div>
        <h1 className="max-w-[16ch] text-[clamp(2.2rem,5vw,3.4rem)]">Eighteen themes. One search box.</h1>
        <p className="lede mt-5 max-w-[65ch]">
          These are the same themes used across national SIH. Search or just scroll — find the one your team
          actually wants to spend two months solving.
        </p>
      </Reveal>

      <div className="sticky top-20 z-10 mt-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search themes — try “health” or “energy”"
          className="w-full max-w-md border border-line bg-paper px-5 py-3.5 text-[0.95rem] outline-none placeholder:text-ink-soft/60 focus-visible:border-marigold"
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((theme, i) => (
          <Reveal key={theme.name} delay={Math.min(i * 0.03, 0.3)}>
            <div className="group h-full overflow-hidden border border-line bg-paper-2 transition-colors hover:border-marigold">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={theme.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0" />
              </div>
              <div className="p-6">
                <h2 className="text-[1.1rem] font-bold">{theme.name}</h2>
                <p className="mt-2 text-[0.9rem] text-ink-soft">{theme.blurb}</p>
              </div>
            </div>
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-ink-soft">No themes match "{query}" — try a different word.</p>
        )}
      </div>
    </div>
  );
}
