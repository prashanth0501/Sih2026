import { Reveal } from '@/components/Reveal';
import { FlipCard } from '@/components/ui/FlipCard';
import { PEOPLE } from '@/lib/data';

export function People() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">From the Principal's desk</div>
        <div className="grid gap-8 sm:grid-cols-[300px_1fr] sm:items-start">
          <img
            src={PEOPLE.principal.photoUrl}
            alt={PEOPLE.principal.name}
            className="h-64 w-64 rounded-full object-cover shadow-lg shadow-ink/10 sm:h-72 sm:w-72"
          />
          <div>
            <blockquote className="text-[clamp(1.4rem,3vw,2rem)] font-bold leading-tight">
              "{PEOPLE.principal.quote}"
            </blockquote>
            <div className="mt-3 text-[0.85rem] text-ink-soft">
              <span className="font-bold text-ink">{PEOPLE.principal.name}</span> · {PEOPLE.principal.role}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 grid gap-4 border-t border-line pt-8 text-[1.02rem] leading-relaxed text-ink-soft">
          {PEOPLE.principal.message.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-20">
          <div className="eyebrow mb-5">A message from the SPOC</div>
          <div className="flex flex-col gap-6 border border-line bg-paper-2 p-7 sm:flex-row sm:items-start">
            <img
              src={PEOPLE.spoc.photoUrl}
              alt={PEOPLE.spoc.name}
              className="h-40 w-40 shrink-0 rounded-full object-cover shadow-md shadow-ink/10"
            />
            <div>
              <h2 className="text-[1.15rem] font-bold">{PEOPLE.spoc.name}</h2>
              <div className="mono mb-3 text-[0.64rem] text-ink-soft">{PEOPLE.spoc.role}</div>
              <p className="text-ink-soft">
                "Two rounds, real feedback, and one clear scoreboard — that's all a fair process needs. My job
                is to make sure every team that puts in the work gets a straight answer about where they
                stand, and that the teams we send to the national round have genuinely earned it."
              </p>
              <p className="mt-3 text-[0.85rem] text-ink-soft/80">{PEOPLE.spoc.bio}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-20">
          <div className="eyebrow mb-6">Coordinators</div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PEOPLE.coordinators.map((c) => (
              <FlipCard key={c.name} initials={c.initials} name={c.name} role={c.role} bio={c.bio} photoUrl={c.photoUrl} />
            ))}
          </div>
          <p className="mono mt-4 text-[0.62rem] text-ink-soft/60">Tap a card to flip it</p>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="mt-20 border-t border-line pt-8">
          <div className="eyebrow mb-6">Moments from the hackathon floor</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <img
              src="/hero/mentor-session.webp"
              alt="A mentor explaining a hardware build to a student team"
              className="h-56 w-full rounded-sm object-cover shadow-md shadow-ink/10 sm:h-64"
            />
            <img
              src="/hero/gears-team.webp"
              alt="A team of students gathered around a mechanical prototype"
              className="h-56 w-full rounded-sm object-cover shadow-md shadow-ink/10 sm:h-64"
            />
            <img
              src="/hero/lab-electronics.webp"
              alt="Students wiring a circuit board together in a lab"
              className="h-56 w-full rounded-sm object-cover shadow-md shadow-ink/10 sm:h-64"
            />
          </div>
          <p className="mono mt-4 text-[0.62rem] text-ink-soft/60">
            This is what teams like yours look like once the work actually starts.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
