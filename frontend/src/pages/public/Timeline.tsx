import { Reveal } from '@/components/Reveal';
import { TIMELINE_PHASES } from '@/lib/data';

export function Timeline() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Key dates</div>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">The screening calendar.</h1>
        <p className="lede mt-5 max-w-[65ch]">
          Four phases, eleven milestones, straight from the official SIH 2026 timeline — from SPOC registration
          in June to the Grand Finale in December.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10">
        {TIMELINE_PHASES.map((phase, pi) => (
          <Reveal key={phase.phase} delay={Math.min(pi * 0.08, 0.3)}>
            <div className="border border-line bg-paper-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="mono flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[0.62rem] text-paper">
                    {pi + 1}
                  </span>
                  <h2 className="text-[1.15rem] font-bold">{phase.phase}</h2>
                </div>
                <span className="mono text-[0.66rem] text-marigold">{phase.range}</span>
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-2">
                {phase.items.map((item) => (
                  <div key={item.title} className="bg-paper-2 px-6 py-5">
                    <div className="mono text-[0.64rem] text-ink-soft">{item.date}</div>
                    <h3 className="mt-1.5 text-[1rem] font-bold">{item.title}</h3>
                    <p className="mt-1.5 text-[0.86rem] text-ink-soft">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mono mt-6 text-[0.6rem] text-ink-soft/60">
        Source: official SIH 2026 timeline, AICTE / MoE Innovation Cell — dates are month-ranges set
        nationally; this college's internal steps happen inside the "Setup" and "Submit &amp; screen" phases.
      </p>
    </div>
  );
}
