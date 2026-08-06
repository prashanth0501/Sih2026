import { Reveal } from '@/components/Reveal';
import { SIH_OFFICIAL } from '@/lib/data';

const SECTIONS = [
  {
    title: 'Team formation',
    points: [
      'A team has exactly 6 members, including the team leader.',
      'All 6 members must be from this college — inter-college teams are not allowed.',
      'At least one female team member is mandatory (all-female teams are welcome too).',
      'Members can come from any department — mixed-discipline teams are encouraged, especially for the hardware edition.',
      'Your team name must be unique and must not contain the college’s name in any form.',
    ],
  },
  {
    title: 'How registration actually works',
    points: [
      'Students don’t register directly on the national SIH portal — only the college SPOC can. This site is that missing piece: it’s where you register, get screened, and get shortlisted internally.',
      'Only teams that clear this college’s internal screening get nominated to the national round.',
      'This institute can nominate a maximum of 50 teams nationally (45 shortlisted + 5 waitlisted) — so internal screening is real, not a formality.',
      'Once the SPOC enters your nominated team’s details on the national portal, they cannot be changed — check everything twice.',
    ],
  },
  {
    title: 'Idea submission',
    points: [
      'A team may submit an idea against a maximum of 2 problem statements nationally.',
      'Each problem statement accepts a maximum of 500 idea submissions nationwide — once full, it closes.',
      'The national deadline for team nomination and idea submission is 15 September 2026. There are no extensions after this date.',
      'Ideas must be original — solutions that already existed in a previous event or programme are not eligible.',
    ],
  },
  {
    title: 'How ideas are judged',
    points: [
      'Novelty of the idea, and how well it actually answers the assigned problem statement.',
      'Complexity, clarity, and level of detail in your submission.',
      'Feasibility and practicability — can this actually be built and used.',
      'Sustainability and scale of impact.',
      'User experience, and potential for the idea to keep developing after the event.',
    ],
  },
  {
    title: 'Originality & IP',
    points: [
      'Plagiarism of ideas, code, or designs is not allowed, and can get a team disqualified.',
      'If your solution assembles existing open-source components, use verified ones only and credit them — your team is solely responsible for any licensing or copyright conflict that results.',
      'If your team wins, the IP is split equally between your team and the organisation that posted the problem statement, or as mutually agreed — the sponsoring ministry gets a free licence to use it, but the idea doesn’t stop being yours.',
    ],
  },
  {
    title: 'If you reach the Grand Finale',
    points: [
      'The Grand Finale is held offline at nodal centres across India (proposed December 2026) — selected teams travel to their assigned centre.',
      'Only officially registered team members and up to 2 mentors may stay at or participate in the venue — no exceptions for family, friends, or unregistered faculty.',
      'Travel reimbursement is capped at ₹3,000 per person for a round trip, on production of actual bills; accommodation at the nodal centre is arranged for you.',
      'A college photo ID and a signed consent letter are mandatory to participate in the finale.',
    ],
  },
];

export function Rules() {
  return (
    <div className="mx-auto max-w-[820px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">Rules</div>
          <h1 className="mx-auto text-[clamp(2rem,5vw,3rem)]">Read this before you register.</h1>
          <p className="lede mx-auto mt-5 max-w-[65ch]">
            Everything below comes from the official SIH 2026 Guidelines. Nothing here is this college's
            invention — it's what AICTE and the MoE Innovation Cell actually require.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12">
        {SECTIONS.map((section, i) => (
          <Reveal key={section.title} delay={Math.min(i * 0.06, 0.3)}>
            <div className="border-t border-line pt-7">
              <h2 className="mb-4 text-[1.25rem] font-bold">{section.title}</h2>
              <ul className="grid gap-2.5 text-ink-soft">
                {section.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div className="mt-14 border border-dashed border-line p-6 text-[0.85rem] text-ink-soft">
          <p>
            Questions about anything above go to a coordinator first — see the{' '}
            <a href="/contact" className="text-marigold hover:underline">Contact</a> page.
          </p>
          <p className="mt-3">
            For questions the national organisers need to answer directly: write to{' '}
            <a href={`mailto:${SIH_OFFICIAL.email}`} className="text-marigold hover:underline">{SIH_OFFICIAL.email}</a>{' '}
            or call{' '}
            {SIH_OFFICIAL.phones.map((p, i) => (
              <span key={p}>
                <a href={`tel:${p.replace(/\s+/g, '')}`} className="text-marigold hover:underline">{p}</a>
                {i < SIH_OFFICIAL.phones.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        </div>
      </Reveal>

      <p className="mono mt-6 text-[0.6rem] text-ink-soft/60">Source: Smart India Hackathon 2026 Guidelines, AICTE / MoE Innovation Cell.</p>
    </div>
  );
}
