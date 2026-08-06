import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/utils';

type Milestone = {
  step: string;
  dateRange: string;
  title: string;
  description: string;
  who: string;
  deliverable: string;
  phaseId: number;
  phaseName: string;
  themeColor: string;
  badgeBg: string;
};

const MILESTONES: Milestone[] = [
  // Phase 1: Setup & Launch
  {
    step: '01',
    dateRange: 'JUNE – AUGUST 2026',
    title: 'Registration of College SPOCs',
    description:
      'SPOC Bhargav R registers Nagarjuna College of Engineering & Technology on the official Ministry of Education SIH central portal, establishing NCET’s participating status.',
    who: 'NCET SPOC & AICTE Portal',
    deliverable: 'Official College Authorization & SPOC Account Verification',
    phaseId: 1,
    phaseName: 'Phase 1 · Setup & Launch',
    themeColor: '#4a3ab4',
    badgeBg: 'bg-indigo/15 text-indigo border-indigo/30',
  },
  {
    step: '02',
    dateRange: 'JUNE – AUGUST 2026',
    title: 'Internal NCET Hackathon Portal Opens',
    description:
      'The NCET internal screening portal opens for all students across CSE, ECE, Mech, Civil, and AI streams to form 6-member teams and create draft submissions.',
    who: 'NCET Student Teams (All Branches)',
    deliverable: '6-Member Team Formation & Profile Verification',
    phaseId: 1,
    phaseName: 'Phase 1 · Setup & Launch',
    themeColor: '#4a3ab4',
    badgeBg: 'bg-indigo/15 text-indigo border-indigo/30',
  },
  {
    step: '03',
    dateRange: 'JULY – AUGUST 2026',
    title: 'SIH Ministry Problem Statements Release',
    description:
      'The Ministry of Education & AICTE release 100+ official problem statements submitted by central government ministries, public departments, and industry sponsors.',
    who: 'MoE Innovation Cell & Sponsoring Ministries',
    deliverable: '18 Official Theme Categories & Problem Statement List',
    phaseId: 1,
    phaseName: 'Phase 1 · Setup & Launch',
    themeColor: '#4a3ab4',
    badgeBg: 'bg-indigo/15 text-indigo border-indigo/30',
  },

  // Phase 2: Screening & Nomination
  {
    step: '04',
    dateRange: 'JULY – AUGUST 2026',
    title: 'Internal Hackathon Report & Deck Upload',
    description:
      'Teams submit their Level 1 Google Drive presentation decks and demonstrate their working software/hardware prototypes to the NCET evaluation panel.',
    who: 'Registered Teams & NCET Review Panel',
    deliverable: 'Google Drive Deck Link & Internal Panel Scorecard',
    phaseId: 2,
    phaseName: 'Phase 2 · Screening & Nomination',
    themeColor: '#ff7a1a',
    badgeBg: 'bg-marigold/15 text-marigold border-marigold/30',
  },
  {
    step: '05',
    dateRange: 'AUGUST – SEPTEMBER 2026',
    title: 'Nomination of Top Teams on National Portal',
    description:
      'Top shortlisted NCET teams receive Principal Thippeswamy’s official nomination letter on college letterhead, authorizing their upload to the central SIH portal.',
    who: 'Principal Thippeswamy & SPOC Team',
    deliverable: 'Signed College Nomination Letter & Portal Submission',
    phaseId: 2,
    phaseName: 'Phase 2 · Screening & Nomination',
    themeColor: '#ff7a1a',
    badgeBg: 'bg-marigold/15 text-marigold border-marigold/30',
  },
  {
    step: '06',
    dateRange: 'SEPTEMBER – OCTOBER 2026',
    title: 'National Idea Screening by Ministries',
    description:
      'AICTE technical experts and ministry representatives evaluate all nominated student projects submitted by participating colleges across India.',
    who: 'AICTE Jury & Central Ministry Evaluators',
    deliverable: 'National Level 2 Evaluation Scores',
    phaseId: 2,
    phaseName: 'Phase 2 · Screening & Nomination',
    themeColor: '#ff7a1a',
    badgeBg: 'bg-marigold/15 text-marigold border-marigold/30',
  },

  // Phase 3: Results & Mentorship
  {
    step: '07',
    dateRange: 'OCTOBER 2026',
    title: 'National Result Publication',
    description:
      'The Ministry of Education officially announces the finalist teams shortlisted for the offline 36-hour Grand Finale across all problem statements.',
    who: 'Ministry of Education Innovation Cell',
    deliverable: 'Official Finalist Announcement List',
    phaseId: 3,
    phaseName: 'Phase 3 · Results & Mentorship',
    themeColor: '#ffa92e',
    badgeBg: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  },
  {
    step: '08',
    dateRange: 'NOVEMBER 2026',
    title: 'Communication of Result to Finalist Teams',
    description:
      'Nodal coordinators directly notify selected NCET teams with travel logistics, nodal center locations, and finale guidelines.',
    who: 'SIH Nodal Center Coordinators',
    deliverable: 'Official Finale Invitation Letter & Travel Pass',
    phaseId: 3,
    phaseName: 'Phase 3 · Results & Mentorship',
    themeColor: '#ffa92e',
    badgeBg: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  },
  {
    step: '09',
    dateRange: 'NOVEMBER 2026',
    title: 'Mentoring & Training Bootcamp Sessions',
    description:
      'NCET faculty mentors conduct intensive prototyping bootcamps, code reviews, and pitch practice sessions to refine solutions for the finale.',
    who: 'NCET Faculty Mentors & Student SPOCs',
    deliverable: 'Refined Working Model & Pitch Deck Polish',
    phaseId: 3,
    phaseName: 'Phase 3 · Results & Mentorship',
    themeColor: '#ffa92e',
    badgeBg: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  },

  // Phase 4: Grand Finale
  {
    step: '10',
    dateRange: 'NOVEMBER 2026',
    title: 'Announcement of Shortlist & Nodal Center Allotment',
    description:
      'AICTE announces designated Nodal Centers across India where finalist teams will travel to compete live under ministry supervision.',
    who: 'AICTE Nodal Coordination Cell',
    deliverable: 'Nodal Center Assignment & Reporting Schedule',
    phaseId: 4,
    phaseName: 'Phase 4 · Grand Finale & Victory',
    themeColor: '#e11d48',
    badgeBg: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  },
  {
    step: '11',
    dateRange: 'DECEMBER 2026',
    title: 'SIH Grand Finale (36-Hour Offline Hackathon)',
    description:
      'Finalist teams travel to their allotted Nodal Center for 36 hours of non-stop coding, prototype testing, and live pitching to ministry judges.',
    who: 'Ministry Judges, AICTE Evaluators & Finalist Teams',
    deliverable: '₹1,50,000 Cash Prize & AICTE Victory Trophy',
    phaseId: 4,
    phaseName: 'Phase 4 · Grand Finale & Victory',
    themeColor: '#e11d48',
    badgeBg: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  },
];

export function Timeline() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-8 pb-24 pt-6 sm:pt-8 space-y-12">
      
      {/* 1. Centered Header Block */}
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl space-y-4">
          <div className="eyebrow">
            Official SIH 2026 Timeline
          </div>

          <h1 className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-ink leading-tight text-center">
            The Roadmap to National Glory
          </h1>

          <p className="lede mx-auto text-base sm:text-xl text-ink-soft max-w-2xl text-center">
            11 official milestones across 4 key phases — from initial team setup in June to the 36-hour Grand Finale in December.
          </p>
        </div>
      </Reveal>

      {/* 2. Prominent & Convenient Milestone Cards Grid */}
      <div className="space-y-8">
        {MILESTONES.map((m, idx) => (
          <Reveal key={m.step} delay={Math.min(idx * 0.04, 0.2)}>
            <div className="overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-marigold/60">
              
              {/* Card Top Header: Prominent Date Tag & Step Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 bg-paper/60 px-6 sm:px-8 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="mono flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-paper shadow-sm"
                    style={{ backgroundColor: m.themeColor }}
                  >
                    {m.step}
                  </span>
                  <span className={cn('mono text-[0.68rem] font-bold rounded-full border px-3 py-1', m.badgeBg)}>
                    {m.phaseName}
                  </span>
                </div>

                {/* PROMINENT DATES DISPLAY */}
                <div className="mono text-xs sm:text-sm font-bold text-marigold bg-marigold/15 border border-marigold/30 rounded-lg px-4 py-1.5 shadow-xs">
                  📅 {m.dateRange}
                </div>
              </div>

              {/* Card Body: Rich Multi-Column Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="font-display text-xl sm:text-3xl font-bold text-ink">
                    {m.title}
                  </h2>
                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* Structured Action Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line/40 text-xs sm:text-sm">
                  <div className="rounded-xl border border-line/60 bg-paper p-4 space-y-1">
                    <div className="mono text-[0.68rem] font-bold text-marigold uppercase tracking-wider">
                      Target Audience / Participants
                    </div>
                    <div className="font-bold text-ink">
                      {m.who}
                    </div>
                  </div>

                  <div className="rounded-xl border border-line/60 bg-paper p-4 space-y-1">
                    <div className="mono text-[0.68rem] font-bold text-marigold uppercase tracking-wider">
                      Key Milestone Deliverable
                    </div>
                    <div className="font-bold text-ink">
                      {m.deliverable}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Reveal>
        ))}
      </div>

      {/* Official Source Note */}
      <p className="mono text-[0.68rem] text-ink-soft/70 text-center leading-relaxed max-w-3xl mx-auto border-t border-line/60 pt-8">
        Timeline dates are derived directly from official Ministry of Education Innovation Cell and AICTE SIH 2026 guidelines.
      </p>

    </div>
  );
}
