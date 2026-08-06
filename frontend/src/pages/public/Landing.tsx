import { useQuery } from '@tanstack/react-query';
import { LinkButton } from '@/components/ui/Button';
import { StatCounter } from '@/components/ui/StatCounter';
import { Reveal } from '@/components/Reveal';
import { getPublicStats } from '@/api/stats';
import { PROBLEM_THEMES } from '@/lib/data';

export function Landing() {
  const { data: stats } = useQuery({ queryKey: ['public-stats'], queryFn: getPublicStats });

  return (
    <>
      <section className="flex min-h-svh items-center px-5 pt-24 sm:px-8">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="eyebrow mb-5 flex items-center gap-2.5 text-left">
                <span className="h-px w-7 bg-marigold" /> Internal Screening Portal · SIH 2026
              </div>
              <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-[1.02]">
                Every idea
                <br />
                starts as <em className="not-italic text-marigold italic">a spark.</em>
              </h1>
              <p className="mt-6 max-w-[46ch] text-[1.08rem] text-ink-soft">
                No problem is too big. No idea is too small. Register your team, send in your idea, and
                watch it grow through two rounds — all the way to the national stage.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton to="/register" variant="primary">
                  Register your team →
                </LinkButton>
                <LinkButton to="/problem-statements" variant="ghost">
                  Explore problem statements
                </LinkButton>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-56 md:max-w-none">
              <div className="absolute inset-0 animate-[spin_40s_linear_infinite] rounded-full border border-line motion-reduce:animate-none" />
              <div className="absolute inset-[12%] animate-[spin_55s_linear_infinite_reverse] rounded-full border border-indigo/40 motion-reduce:animate-none" />
              <div className="absolute inset-[26%] rounded-full border border-dashed border-line" />
              <div
                className="absolute inset-[32%] rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, var(--color-spark-glow), var(--color-spark) 45%, var(--color-marigold) 100%)',
                  boxShadow: '0 0 60px var(--color-spark-glow), 0 0 120px color-mix(in srgb, var(--color-marigold) 30%, transparent)',
                }}
              />
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              <StatCounter target={stats?.teams_registered ?? 0} label="Teams registered" />
              <StatCounter target={stats?.ideas_submitted ?? 0} label="Ideas submitted" />
              <StatCounter target={stats?.problem_statements ?? PROBLEM_THEMES.length} label="Problem themes" />
              <StatCounter target={stats?.days_to_deadline ?? 0} label="Days to Level 1" />
            </div>
            <p className="mono mt-2.5 text-[0.6rem] text-ink-soft/70">Live counts from the screening database</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="relative mx-auto max-w-[720px] sm:h-[420px]">
              <div
                className="absolute inset-0 -z-10 hidden rounded-full opacity-40 blur-3xl sm:block"
                style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 70%)' }}
              />
              <img
                src="/hero/gears-team.webp"
                alt="A team of students gathered around a mechanical prototype"
                className="h-72 w-full rounded-sm object-cover shadow-xl shadow-ink/15 sm:absolute sm:left-0 sm:top-0 sm:h-[300px] sm:w-[62%] sm:-rotate-1"
              />
              <img
                src="/hero/lab-electronics.webp"
                alt="Students wiring a circuit board together in a lab"
                className="mt-5 h-56 w-full rounded-sm object-cover shadow-xl shadow-ink/15 sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:h-[260px] sm:w-[46%] sm:rotate-1"
              />
            </div>
          </Reveal>
          <p className="mono mt-6 text-center text-[0.62rem] text-ink-soft/60">
            Hackathons look the same everywhere — heads down, screens open, deadline getting closer.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm">
              <img
                src="/gallery/nodal-podium.webp"
                alt="A speaker addressing the SIH 2025 nodal-centre audience from a Nagarjuna-branded podium"
                className="h-72 w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <div className="mono mb-3 text-[0.68rem] text-spark-glow">Nodal Centre · SIH 2025</div>
                <h2 className="max-w-[24ch] text-[clamp(1.5rem,3.5vw,2.4rem)] text-paper">
                  We didn't just send a team. We hosted the floor.
                </h2>
                <p className="mt-3 max-w-[56ch] text-[0.92rem] text-paper/80">
                  Nagarjuna was chosen as an official Nodal Centre for SIH 2025 — judges, dignitaries, and
                  teams from across the region, on our own campus.
                </p>
                <LinkButton to="/gallery" variant="ghost" className="mt-5 border-paper/40 text-paper hover:bg-paper/10">
                  See how it went →
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 md:py-36">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[180px_1fr]">
          <div className="mono text-[0.7rem] text-ink-soft md:[writing-mode:vertical-rl] md:[text-orientation:mixed]">
            Why this exists
          </div>
          <div className="grid gap-7">
            {[
              {
                k: '01',
                title: 'Solve a real problem, now',
                body: "Your coursework can answer a problem that a real hospital, ministry, or company actually has. You don't have to wait until after college.",
              },
              {
                k: '02',
                title: 'A fair, open process',
                body: 'Every team goes through the same two rounds. Every score and every comment is saved, so you always know where your idea stands.',
              },
              {
                k: '03',
                title: 'One nationwide stage',
                body: "If your team is selected, you don't just win here. You carry the college's name into India's biggest hackathon.",
              },
            ].map((item, i) => (
              <Reveal key={item.k} delay={i * 0.08}>
                <div className="grid grid-cols-[56px_1fr] gap-5 border-t border-line py-6">
                  <div className="mono text-marigold">{item.k}</div>
                  <div>
                    <h3 className="mb-2 text-[1.3rem] font-bold">{item.title}</h3>
                    <p className="max-w-[60ch] text-ink-soft">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 md:py-36">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="eyebrow mb-5">The Innovation Pipeline</div>
            <h2 className="max-w-[24ch] text-[clamp(1.8rem,4vw,2.6rem)]">One idea. Four stops. One clear path.</h2>
          </Reveal>
          <div className="mt-14 flex snap-x-strip -mx-5 px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:px-0">
            {[
              { step: 'Step 01', title: 'Concept', body: 'Build your team. Pick a problem you care about. Register.' },
              { step: 'Step 02', title: 'Level 1', body: 'Send in your first idea. A coordinator reads it and tells you what to improve.' },
              { step: 'Step 03', title: 'Level 2', body: 'Make it better and send it again. This round decides who moves ahead.' },
              { step: 'Step 04', title: 'Finale', body: 'Selected teams get their certificate. The national SIH begins.' },
            ].map((n, i) => (
              <Reveal key={n.step} delay={i * 0.08} className="w-[78%] shrink-0 sm:w-auto">
                <div className="h-full border border-line bg-paper-2 p-6">
                  <div className="mb-4 h-2.5 w-2.5 rounded-full bg-spark" style={{ boxShadow: '0 0 10px var(--color-spark-glow)' }} />
                  <div className="mono text-[0.68rem] text-ink-soft">{n.step}</div>
                  <h3 className="my-2.5 text-[1.15rem] font-bold">{n.title}</h3>
                  <p className="text-[0.88rem] text-ink-soft">{n.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mono mt-2.5 text-[0.62rem] text-ink-soft/60 sm:hidden">← swipe to see all four →</p>
        </div>
      </section>

      <section className="px-5 py-24 text-center sm:px-8 md:py-36">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <div className="eyebrow mb-5 flex justify-center">Ready when you are</div>
            <h2 className="mx-auto max-w-[16ch] text-[clamp(2.2rem,5vw,3.6rem)]">Your idea has somewhere to go.</h2>
            {stats && stats.days_to_deadline > 0 && (
              <p className="mono mt-5 text-[0.75rem] text-marigold">Registration window closes in {stats.days_to_deadline} days</p>
            )}
            <div className="mt-8 flex justify-center">
              <LinkButton to="/register" variant="primary" className="px-10 py-5 text-[0.8rem]">
                Start your team's journey →
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
