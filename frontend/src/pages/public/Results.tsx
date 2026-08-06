import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/utils';

const TABS = ['Screening Funnel', 'Selected Teams'] as const;

export function Results() {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Results</div>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">How far did the sparks travel?</h1>
        <p className="lede mt-5 max-w-[65ch]">
          Every team's journey, from registration to the national stage. This page fills in as screening
          happens — nothing to show yet.
        </p>
      </Reveal>

      <div className="mt-10 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'mono -mb-px border-b-2 px-1 py-3 text-[0.72rem]',
              tab === t ? 'border-marigold text-ink' : 'border-transparent text-ink-soft hover:text-ink'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col items-center gap-3 border border-dashed border-line py-20 text-center">
          <div className="h-2.5 w-2.5 rounded-full bg-spark" style={{ boxShadow: '0 0 10px var(--color-spark-glow)' }} />
          <div className="mono text-[0.68rem] text-marigold">Coming soon</div>
          <p className="max-w-[40ch] text-ink-soft">
            {tab === 'Screening Funnel'
              ? 'The funnel will show how many teams have cleared each round once Level 1 screening opens.'
              : "The SPOC hasn't published a selected-teams list yet. It will appear here the moment results go live."}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
