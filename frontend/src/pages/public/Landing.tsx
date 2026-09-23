import { LinkButton } from '@/components/ui/Button';
import { Reveal } from '@/components/Reveal';
import { AnimatedNumber } from '@/components/ui/StatCounter';

export function Landing() {

  return (
    <>
      {/* HERO SECTION — EVENT CONCLUDED ANNOUNCEMENT */}
      <section className="flex min-h-[80vh] items-center px-5 pt-28 pb-16 sm:px-8">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="grid items-center gap-12 md:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="eyebrow mb-5 flex items-center gap-2.5 text-left text-marigold font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SIH 2026 Internal Hackathon · Concluded Successfully</span>
              </div>
              <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.04] text-ink">
                Every idea starts as <em className="not-italic text-marigold italic">a spark.</em>
                <br />
                Every team found its stage.
              </h1>
              <p className="mt-6 max-w-[50ch] text-[1.08rem] text-ink-soft leading-relaxed">
                The internal screening rounds for <strong>Smart India Hackathon 2026</strong> at NCET have officially concluded. Over <strong>100+ teams</strong> and <strong>600+ student hackers</strong> developed groundbreaking solutions across hardware and software themes.
              </p>
            </div>

            {/* Glowing Innovation Orb */}
            <div className="relative mx-auto aspect-square w-full max-w-64 md:max-w-none">
              <div className="absolute inset-0 animate-[spin_40s_linear_infinite] rounded-full border border-line motion-reduce:animate-none" />
              <div className="absolute inset-[12%] animate-[spin_55s_linear_infinite_reverse] rounded-full border border-indigo/40 motion-reduce:animate-none" />
              <div className="absolute inset-[26%] rounded-full border border-dashed border-marigold/40" />
              <div
                className="absolute inset-[32%] rounded-full flex items-center justify-center text-center p-4"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, var(--color-spark-glow), var(--color-spark) 45%, var(--color-marigold) 100%)',
                  boxShadow: '0 0 60px var(--color-spark-glow), 0 0 120px color-mix(in srgb, var(--color-marigold) 35%, transparent)',
                }}
              >
                <div className="text-slate-950 font-bold font-display leading-tight">
                  <div className="text-2xl sm:text-3xl">50</div>
                  <div className="text-[0.65rem] uppercase tracking-wider font-mono">Teams Selected</div>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-IMPACT ARCHITECTED METRICS GRID */}
          <div className="mt-20 border-t border-line pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="mono text-xs font-bold uppercase tracking-wider text-marigold">Event Impact &amp; Key Metrics</span>
                <h2 className="text-xl sm:text-2xl font-bold text-ink mt-0.5">SIH 2026 Participation Statistics</h2>
              </div>
              <span className="mono text-[0.7rem] text-ink-soft hidden sm:inline-block">Official NCET Internal Hackathon Audit</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div className="group border border-line bg-paper p-5 rounded-2xl transition-all hover:border-marigold hover:shadow-lg">
                <div className="font-display text-3xl sm:text-4xl font-bold text-marigold tabular-nums">
                  <AnimatedNumber target={100} suffix="+" />
                </div>
                <div className="mono text-[0.7rem] font-bold text-ink uppercase tracking-wider mt-2">Teams Registered</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">Multi-dept engineering rosters</div>
              </div>

              <div className="group border border-line bg-paper p-5 rounded-2xl transition-all hover:border-marigold hover:shadow-lg">
                <div className="font-display text-3xl sm:text-4xl font-bold text-marigold tabular-nums">
                  <AnimatedNumber target={600} suffix="+" />
                </div>
                <div className="mono text-[0.7rem] font-bold text-ink uppercase tracking-wider mt-2">Student Hackers</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">Innovators from 1st to 4th year</div>
              </div>

              <div className="group border border-emerald-600/30 bg-emerald-500/10 p-5 rounded-2xl transition-all hover:border-emerald-600 hover:shadow-lg">
                <div className="font-display text-3xl sm:text-4xl font-bold text-emerald-600 tabular-nums">
                  <AnimatedNumber target={50} />
                </div>
                <div className="mono text-[0.7rem] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-2">Teams Selected</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">50 teams selected</div>
              </div>

              <div className="group border border-line bg-paper p-5 rounded-2xl transition-all hover:border-marigold hover:shadow-lg">
                <div className="font-display text-3xl sm:text-4xl font-bold text-marigold tabular-nums">
                  <AnimatedNumber target={100} suffix="%" />
                </div>
                <div className="mono text-[0.7rem] font-bold text-ink uppercase tracking-wider mt-2">Female Diversity</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">Gender-compliant teams</div>
              </div>

              <div className="group border border-line bg-paper p-5 rounded-2xl transition-all hover:border-marigold hover:shadow-lg">
                <div className="font-display text-3xl sm:text-4xl font-bold text-marigold tabular-nums">
                  <AnimatedNumber target={8} suffix="+" />
                </div>
                <div className="mono text-[0.7rem] font-bold text-ink uppercase tracking-wider mt-2">Departments</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">CSE, ECE, AIML, DS, Civil, BCA...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY & PODIUM HIGHLIGHTS */}
      <section className="px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-line shadow-2xl">
              <img
                src="/gallery/nodal-podium.webp"
                alt="A speaker addressing the SIH nodal-centre audience"
                className="h-80 w-full object-cover sm:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
                <div className="mono mb-3 text-xs text-spark-glow font-bold uppercase tracking-wider">Official Nodal Centre · SIH 2025 &amp; 2026</div>
                <h2 className="max-w-[24ch] text-[clamp(1.6rem,3.8vw,2.6rem)] font-bold text-paper">
                  We didn't just send a team. We hosted the floor.
                </h2>
                <p className="mt-3 max-w-[56ch] text-[0.95rem] text-paper/80 leading-relaxed">
                  Nagarjuna College of Engineering and Technology (NCET) stands proud as an official Nodal Centre, bringing together top judges, dignitaries, and innovators on our campus.
                </p>
                <LinkButton to="/gallery" variant="ghost" className="mt-6 border-paper/40 text-paper hover:bg-paper/10">
                  See Hackathon Gallery &amp; Photos 📸 →
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY THIS MATTERS — HALL OF FAME */}
      <section className="px-5 py-16 sm:px-8 md:py-24 border-t border-line">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[180px_1fr]">
          <div className="mono text-[0.7rem] text-ink-soft md:[writing-mode:vertical-rl] md:[text-orientation:mixed] font-bold uppercase tracking-wider">
            Why this matters
          </div>
          <div className="grid gap-7">
            {[
              {
                k: '01',
                title: 'Solving Real-World National Challenges',
                body: 'Our student teams engineered solutions for problems directly submitted by Union Ministries, State Departments, and industry leaders.',
              },
              {
                k: '02',
                title: 'Rigorous Transparent Evaluation',
                body: 'Every single team went through two transparent screening rounds with detailed feedback recorded on the portal.',
              },
              {
                k: '03',
                title: 'Carrying NCET to the National Stage',
                body: 'The 50 teams selected carry NCET\'s legacy to the national finals of India\'s largest hackathon.',
              },
            ].map((item, i) => (
              <Reveal key={item.k} delay={i * 0.08}>
                <div className="grid grid-cols-[56px_1fr] gap-5 border-t border-line py-6">
                  <div className="mono font-bold text-marigold">{item.k}</div>
                  <div>
                    <h3 className="mb-2 text-[1.3rem] font-bold text-ink">{item.title}</h3>
                    <p className="max-w-[60ch] text-ink-soft leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA SECTION — EVENT CONCLUDED */}
      <section className="px-5 py-20 sm:px-8 md:py-28 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-marigold/30 bg-marigold/10 px-5 py-1.5 mono text-xs font-bold uppercase tracking-widest text-marigold mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Event Concluded
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center max-w-xl mx-auto leading-tight">
              Congratulations to all participating teams!
            </h2>
            <p className="mt-5 text-base sm:text-lg text-ink-soft max-w-lg mx-auto text-center leading-relaxed">
              Smart India Hackathon 2026 internal screening rounds at NCET have come to an inspiring finish. 50 teams selected to represent our college. Thank you to every student, mentor, and organizer who made this edition truly exceptional.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
