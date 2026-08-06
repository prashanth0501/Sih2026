import { Reveal } from '@/components/Reveal';
import { LinkButton } from '@/components/ui/Button';

const CLAIMS = [
  {
    title: 'A nationwide platform, not a class project',
    body: "Smart India Hackathon is a nationwide initiative that gives students a real platform to solve problems people face every day. It isn't graded coursework — it's a working answer that a ministry, a hospital, or a company can actually use.",
  },
  {
    title: 'Out-of-the-box thinking, on purpose',
    body: "SIH exists to build a culture of product innovation and a habit of problem-solving — the kind of thinking that doesn't wait for permission to try something new.",
  },
  {
    title: 'Your classroom, connected to the country',
    body: 'Every year, over 40 central ministries, every state, and 100+ major companies bring real problems to SIH. This is the closest most students get to industry before they graduate.',
  },
  {
    title: "It's bigger than you'd think",
    body: 'Since it began, SIH has brought in more than 18 lakh students, from over 9,000 institutes, submitting over 3,000 problem statements — and more than 150 startups have grown out of it.',
  },
];

export function WhySIH() {
  return (
    <div className="mx-auto max-w-[860px] px-5 pb-24 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">Why SIH</div>
          <h1 className="mx-auto text-[clamp(2rem,5vw,3rem)]">
            "No problem is too big.
            <br />
            No idea is too small."
          </h1>
          <p className="lede mx-auto mt-6 max-w-[60ch]">
            That's the line Smart India Hackathon has run on since it started. Here's what it actually means
            for you, as a student at this college.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="relative mt-14 overflow-hidden rounded-sm">
          <img
            src="/hero/mural-workspace.webp"
            alt="Students working on laptops in a creatively decorated workspace"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <p className="mono absolute bottom-5 left-6 text-[0.66rem] text-paper/90">
            This is what a working session actually looks like — heads down, ideas out loud.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-10">
        {CLAIMS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06}>
            <div className="border-t border-line pt-7">
              <h2 className="mb-3 text-[1.4rem] font-bold">{c.title}</h2>
              <p className="max-w-[62ch] text-ink-soft">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-20 border border-line bg-paper-2 p-8 text-center sm:p-12">
          <h2 className="mx-auto max-w-[20ch] text-[1.6rem]">Ready to see if your idea holds up?</h2>
          <div className="mt-6 flex justify-center">
            <LinkButton to="/register" variant="primary">
              Register your team →
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
