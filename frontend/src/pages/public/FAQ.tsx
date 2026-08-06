import { useState } from 'react';
import { Reveal } from '@/components/Reveal';

const FAQS = [
  {
    q: 'Who can register a team?',
    a: 'Any student currently enrolled at the college. A team needs between 3 and 6 members, including one team leader who creates the registration.',
  },
  {
    q: 'Do we need to pick a problem statement before we register?',
    a: "It helps, but it isn't required on day one. You can register your team first and lock in a problem statement any time before Level 1 submissions close.",
  },
  {
    q: 'What happens after we submit for Level 1?',
    a: 'A coordinator reviews your submission and records a score with written feedback. You will see both on your dashboard — usually within 5 working days.',
  },
  {
    q: "What if our team isn't selected at Level 1?",
    a: "That team's journey ends there for this cycle, but the feedback stays on your dashboard. Many teams come back stronger the following year.",
  },
  {
    q: 'Can we change our problem statement after registering?',
    a: 'Yes, any time before Level 1 submissions close. After that, your problem statement is locked for the rest of the cycle.',
  },
  {
    q: 'Who do we contact if something goes wrong?',
    a: 'Start with your coordinator (Partha Shankar or Nirmith M Jain) — see the Contact page for details. The SPOC handles anything a coordinator can’t resolve.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">FAQ</div>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">Questions people actually ask.</h1>
      </Reveal>

      <div className="mt-14 divide-y divide-line border-t border-line">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[1.02rem] font-medium">{item.q}</span>
                <span className="mono shrink-0 text-marigold">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <p className="pb-5 pr-8 text-ink-soft">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
