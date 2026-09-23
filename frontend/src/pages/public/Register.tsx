import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { AnimatedNumber } from '@/components/ui/StatCounter';

export function Register() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
      <Reveal>
        <div className="rounded-3xl border-2 border-marigold/40 bg-paper-2 p-8 sm:p-12 text-ink shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-marigold/30 bg-marigold/10 px-5 py-1.5 mono text-xs font-bold uppercase tracking-widest text-marigold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Event Concluded
          </div>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Registrations Have Been Closed
          </h1>
          <p className="text-lg text-ink font-semibold">
            Thank you for showing interest!
          </p>
          <p className="text-base text-ink-soft max-w-lg mx-auto leading-relaxed">
            The internal screening rounds for Smart India Hackathon 2026 at NCET have officially concluded. Registrations are no longer being accepted. We encourage you to build your ideas and come next year!
          </p>

          <div className="grid gap-3 sm:grid-cols-3 pt-6 border-t border-line">
            <div className="p-4 border border-line bg-paper rounded-2xl">
              <div className="font-display text-3xl font-bold text-marigold tabular-nums">
                <AnimatedNumber target={100} suffix="+" />
              </div>
              <div className="mono text-[0.68rem] text-ink-soft mt-1 uppercase font-bold">Registered Teams</div>
            </div>
            <div className="p-4 border border-line bg-paper rounded-2xl">
              <div className="font-display text-3xl font-bold text-marigold tabular-nums">
                <AnimatedNumber target={600} suffix="+" />
              </div>
              <div className="mono text-[0.68rem] text-ink-soft mt-1 uppercase font-bold">Student Hackers</div>
            </div>
            <div className="p-4 border border-emerald-600/30 bg-emerald-500/10 rounded-2xl">
              <div className="font-display text-3xl font-bold text-emerald-600 tabular-nums">
                <AnimatedNumber target={50} />
              </div>
              <div className="mono text-[0.68rem] text-emerald-700 dark:text-emerald-400 mt-1 uppercase font-bold">50 Teams Selected</div>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-full bg-marigold px-8 py-3.5 text-xs font-bold text-slate-950 hover:bg-marigold/90 transition-all shadow-md"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
