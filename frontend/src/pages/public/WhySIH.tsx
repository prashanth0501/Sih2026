import { Reveal } from '@/components/Reveal';
import { Link } from 'react-router-dom';

const SIH_SCALE_STATS = [
  { val: '1.8 Million+', label: 'Student Innovators', desc: 'Engaged nationwide since launch' },
  { val: '50+ Ministries', label: 'Government Bodies', desc: 'Posting official challenge statements' },
  { val: '9,000+ Colleges', label: 'Participating Institutes', desc: 'Across all states in India' },
  { val: '150+ Startups', label: 'Commercial Ventures', desc: 'Born directly out of winning prototypes' },
];

const SIH_EDITIONS = [
  {
    edition: 'Software Edition',
    duration: '36 Hours Non-Stop',
    image: '/themes/blockchain-cybersecurity.webp',
    description:
      'A continuous 36-hour coding marathon where teams build web platforms, mobile apps, AI models, cloud systems, and blockchain infrastructure to solve digital challenges.',
    focusPoints: [
      'Artificial Intelligence & Machine Learning',
      'Cybersecurity & Smart Governance',
      'Fintech, EdTech & Public Service Portals',
    ],
  },
  {
    edition: 'Hardware Edition',
    duration: '5-Day Prototyping Sprint',
    image: '/hero/wiring-closeup.webp',
    description:
      'A multi-day physical fabrication challenge where teams assemble mechanical structures, IoT sensor arrays, robotics, drones, and smart hardware prototypes.',
    focusPoints: [
      'Robotics, Drones & Autonomous Systems',
      'Clean Energy, EV & Smart Agriculture',
      'MedTech Devices & Defense Technology',
    ],
  },
];

const NATIONAL_PILLARS = [
  {
    number: '01',
    title: 'Solving Real Ministry & Industry Challenges',
    body: 'SIH is not a theoretical classroom assignment. Every problem statement is submitted by an actual government department, hospital, or enterprise — seeking workable solutions they can deploy.',
    image: '/gallery/nodal-evaluator-room.webp',
    caption: 'Official evaluation of practical, deployable student prototypes.',
  },
  {
    number: '02',
    title: 'NCET as a National Nodal Centre',
    body: 'Nagarjuna College of Engineering & Technology has served as an official SIH Nodal Centre, hosting finalist teams, AICTE evaluators, and government officials on our Bengaluru campus.',
    image: '/gallery/nodal-guard-of-honour.webp',
    caption: 'NCET hosting national dignitaries and student finalists.',
  },
  {
    number: '03',
    title: 'Bridging Academia and Public Innovation',
    body: 'SIH connects classroom engineering directly with national development. Student solutions have been implemented in smart city traffic management, rural water testing, and emergency health dispatch.',
    image: '/gallery/nodal-lamp-lighting.webp',
    caption: 'Inauguration of national open innovation initiatives at NCET.',
  },
];

export function WhySIH() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-8 pb-24 pt-6 sm:pt-8 space-y-20">
      
      {/* 1. Open Clean Hero Title Block */}
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl space-y-4">
          <div className="eyebrow">
            The National Movement · SIH 2026
          </div>

          <h1 className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-ink leading-tight text-center">
            What is Smart India Hackathon?
          </h1>

          <p className="lede mx-auto text-base sm:text-xl text-ink-soft max-w-2xl text-center">
            India's largest open innovation initiative by the Ministry of Education and AICTE — bridging engineering classrooms directly with national problem-solving.
          </p>
        </div>
      </Reveal>

      {/* 2. Hero Feature Image Banner */}
      <Reveal delay={0.05}>
        <div className="relative overflow-hidden rounded-3xl border border-line shadow-lg">
          <img
            src="/gallery/nodal-audience.webp"
            alt="Smart India Hackathon Nodal Centre Audience at Nagarjuna College"
            className="h-64 sm:h-96 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-paper space-y-1">
            <div className="mono text-xs font-bold text-marigold uppercase tracking-wider">
              Nagarjuna College of Engineering & Technology
            </div>
            <div className="font-display text-lg sm:text-2xl font-bold">
              Where Young Minds Build Solutions for 1.4 Billion Citizens
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3. Scale & National Impact Metrics */}
      <Reveal delay={0.08}>
        <div className="rounded-2xl border border-marigold/30 bg-marigold/10 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {SIH_SCALE_STATS.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="font-display text-2xl sm:text-4xl font-bold text-marigold">
                  {stat.val}
                </div>
                <div className="mono text-xs text-ink font-bold pt-1">
                  {stat.label}
                </div>
                <div className="text-[0.72rem] text-ink-soft">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 4. Software vs. Hardware Editions Comparison */}
      <Reveal delay={0.12}>
        <div className="space-y-8 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Two Hackathon Formats</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              Software & Hardware Editions
            </h2>
            <p className="lede text-sm sm:text-base max-w-2xl mx-auto text-center">
              SIH offers two distinct competition tracks designed for different engineering disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SIH_EDITIONS.map((ed, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={ed.image}
                    alt={ed.edition}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 right-4 mono text-xs font-bold text-paper bg-ink/80 backdrop-blur-md px-3 py-1 rounded-full border border-paper/20">
                    {ed.duration}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                      {ed.edition}
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {ed.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-line/40">
                    <div className="mono text-xs font-bold text-marigold uppercase tracking-wider">
                      Key Technology Focus:
                    </div>
                    <ul className="space-y-1.5 text-xs text-ink-soft font-medium">
                      {ed.focusPoints.map((pt, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-marigold shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 5. National Pillars & NCET Nodal Legacy */}
      <Reveal delay={0.15}>
        <div className="space-y-10 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">The Legacy of SIH</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              Why Nagarjuna College Drives SIH Innovation
            </h2>
            <p className="lede text-sm sm:text-base max-w-2xl mx-auto text-center">
              Understanding how SIH bridges classrooms with real government ministries and industry leaders.
            </p>
          </div>

          <div className="space-y-8">
            {NATIONAL_PILLARS.map((item) => (
              <div
                key={item.number}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-line bg-paper p-6 sm:p-8 shadow-sm"
              >
                <div className="space-y-3 lg:col-span-7 text-left">
                  <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-3 py-1">
                    Pillar {item.number}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                    {item.body}
                  </p>
                </div>

                <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-line shadow-md">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-48 sm:h-56 w-full object-cover"
                  />
                  <div className="p-2.5 bg-paper-2 text-[0.68rem] mono text-ink-soft text-center border-t border-line">
                    {item.caption}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 6. Closing Call to Action Section */}
      <Reveal delay={0.18}>
        <div className="rounded-3xl border-2 border-marigold/50 bg-gradient-to-br from-paper via-paper-2 to-paper-3 p-8 sm:p-14 text-center space-y-6 shadow-xl">
          <div className="eyebrow">Be Part of India's Next Breakthrough</div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink max-w-2xl mx-auto">
            Ready to Represent Nagarjuna College Nationally?
          </h2>

          <p className="lede text-base sm:text-lg text-ink-soft max-w-xl mx-auto text-center">
            Register your team for internal screening, pick your ministry problem statement, and start building.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="mono inline-flex items-center rounded-full bg-marigold px-8 py-4 text-base font-bold text-paper shadow-lg shadow-marigold/30 transition-all hover:scale-105 hover:bg-marigold/90"
            >
              Register Team for SIH 2026
            </Link>
            <Link
              to="/why-join"
              className="mono inline-flex items-center rounded-full border-2 border-ink/80 bg-paper px-7 py-4 text-base font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105"
            >
              See Student Benefits
            </Link>
          </div>
        </div>
      </Reveal>

      <p className="mono text-[0.68rem] text-ink-soft/70 text-center leading-relaxed max-w-3xl mx-auto">
        Smart India Hackathon is organized by AICTE and the Ministry of Education Innovation Cell. Information and metrics are based on official SIH portal statistics.
      </p>

    </div>
  );
}
