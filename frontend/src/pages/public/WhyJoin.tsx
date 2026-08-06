import { Reveal } from '@/components/Reveal';
import { LinkButton } from '@/components/ui/Button';

export function WhyJoin() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">What you actually get</div>
          <h1 className="mx-auto max-w-[18ch] text-[clamp(2.2rem,5vw,3.4rem)]">This isn't just a line on your resume.</h1>
          <p className="lede mx-auto mt-5 max-w-[65ch]">
            SIH is built around real problems from real ministries, industries, and NGOs — and it's judged
            like one. Here's what's actually in it for you, at every stage.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="relative mt-14 overflow-hidden rounded-sm">
          <img
            src="/hero/mentor-session.webp"
            alt="A mentor guiding a student team through a hardware build"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <p className="mono absolute bottom-5 left-6 text-[0.66rem] text-paper/90">
            This is what "building something real" actually looks like.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-16 border-t border-line pt-8">
          <div className="mono mb-3 text-[0.7rem] text-marigold">If you take part</div>
          <h2 className="text-[1.5rem] font-bold">You learn to think like a builder, not a student.</h2>
          <ul className="mt-5 grid gap-3 text-ink-soft">
            <li>• Your idea is judged on the same criteria national judges use: novelty, feasibility, clarity, scalability, and real-world impact — not just "does it run."</li>
            <li>• You get direct, written feedback from your own coordinators at every round — not a grade, an actual critique.</li>
            <li>• You practice pitching to people who didn't write the problem statement with you — the hardest and most useful audience there is.</li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-14 border-t border-line pt-8">
          <div className="mono mb-3 text-[0.7rem] text-marigold">If your team gets nominated</div>
          <h2 className="text-[1.5rem] font-bold">Your college puts its name behind you.</h2>
          <ul className="mt-5 grid gap-3 text-ink-soft">
            <li>• A letter signed by the Principal, on college letterhead, naming your whole team — required for the national round, yours to keep either way.</li>
            <li>• Up to 2 mentors from industry or academia can join your team ahead of the finale, if you want them.</li>
            <li>• If you're shortlisted for the Grand Finale, travel reimbursement and nodal-centre accommodation are covered for you and your mentors.</li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-14 border-t border-line pt-8">
          <div className="mono mb-3 text-[0.7rem] text-marigold">If you win</div>
          <h2 className="text-[1.5rem] font-bold">Your idea doesn't just end at a demo.</h2>
          <ul className="mt-5 grid gap-3 text-ink-soft">
            <li>• ₹1,50,000 in prize money per problem statement, awarded to one winning team — paid by the ministry or company that posted the problem, if they like what you built.</li>
            <li>• The organisation that posted the problem gets a free licence to use your solution — but the IP itself is split equally between your team and them, or by mutual agreement. It's still yours.</li>
            <li>• Winning ideas get support to keep developing after the event — this is the rare case where the "prototype" doesn't just get shelved.</li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.26}>
        <div className="mt-16 border border-line bg-paper-2 p-8 text-center sm:p-12">
          <h2 className="mx-auto max-w-[22ch] text-[1.6rem]">None of this happens if you don't register.</h2>
          <div className="mt-6 flex justify-center">
            <LinkButton to="/register" variant="primary">
              Register your team →
            </LinkButton>
          </div>
        </div>
      </Reveal>

      <p className="mono mt-6 text-[0.6rem] leading-relaxed text-ink-soft/60">
        Figures and terms above are from the official SIH 2026 Guidelines (AICTE / MoE Innovation Cell). Prize
        money is awarded at the sponsoring organisation's discretion and isn't guaranteed for every problem
        statement.
      </p>
    </div>
  );
}
