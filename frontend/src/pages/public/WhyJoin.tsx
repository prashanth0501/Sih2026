import { Reveal } from '@/components/Reveal';
import { Link } from 'react-router-dom';

// Gallery spotlight images showing real SIH experience at Nagarjuna College
const GALLERY_HIGHLIGHTS = [
  {
    image: '/gallery/nodal-team-alvengers.webp',
    title: 'Team Spirit & Victory',
    subtitle: 'Build with your close friends, solve real challenges, and win together.',
  },
  {
    image: '/gallery/nodal-student-focus.webp',
    title: 'Real Hands-on Coding',
    subtitle: 'Shift from textbook theory to building live working software and hardware.',
  },
  {
    image: '/gallery/nodal-judging.webp',
    title: 'Expert Industry Feedback',
    subtitle: 'Present your ideas directly to experienced judges and senior mentors.',
  },
  {
    image: '/gallery/nodal-podium.webp',
    title: 'National Recognition',
    subtitle: 'Represent Nagarjuna College on the national stage and earn top honors.',
  },
  {
    image: '/gallery/nodal-lamp-lighting.webp',
    title: 'Grand Inauguration',
    subtitle: 'Be part of a prestigious nationwide event celebrated across India.',
  },
  {
    image: '/gallery/nodal-team-review.webp',
    title: 'Live Pitching Practice',
    subtitle: 'Learn to pitch your prototype to judges, faculty, and industry leaders.',
  },
  {
    image: '/gallery/nodal-memento.webp',
    title: 'Awards & Certificates',
    subtitle: 'Receive official certificates signed by AICTE and Ministry of Education.',
  },
  {
    image: '/gallery/nodal-audience.webp',
    title: 'Vibrant Innovation Network',
    subtitle: 'Connect with hundreds of passionate student developers and creators.',
  },
];

// Tech & Hardware Prototyping Showcase Images
const PROTOTYPING_SHOWCASE = [
  {
    image: '/hero/mentor-session.webp',
    title: 'Personalized Mentor Guidance',
    desc: 'Work side-by-side with experienced professors and industry leaders who guide your technical architecture and presentation.',
  },
  {
    image: '/hero/lab-electronics.webp',
    title: 'Advanced Labs & Equipment',
    desc: 'Access specialized hardware components, sensors, microcontrollers, and computing power at Nagarjuna College.',
  },
  {
    image: '/hero/wiring-closeup.webp',
    title: 'Hardware & Circuit Prototyping',
    desc: 'Build physical IoT devices, drones, and smart automation systems alongside your software applications.',
  },
  {
    image: '/hero/gears-team.webp',
    title: 'Collaborative Problem Solving',
    desc: 'Combine software coding, hardware design, and business strategy to deliver complete end-to-end solutions.',
  },
];

// SIH Innovation Themes Showcase
const THEMES_SHOWCASE = [
  {
    image: '/themes/smart-automation.webp',
    title: 'AI & Smart Automation',
    desc: 'Build machine learning models, smart assistant apps, and computer vision systems for real-world tasks.',
  },
  {
    image: '/themes/robotics-drones.webp',
    title: 'Robotics & Drones',
    desc: 'Design autonomous drones, robotic arms, and smart hardware for agriculture and industrial safety.',
  },
  {
    image: '/themes/medtech-healthtech.webp',
    title: 'MedTech & Healthcare',
    desc: 'Create digital health monitoring tools, AI diagnosis assistants, and emergency medical response platforms.',
  },
  {
    image: '/themes/clean-green-technology.webp',
    title: 'Clean & Green Technology',
    desc: 'Develop eco-friendly energy monitors, waste management apps, and sustainable environmental solutions.',
  },
  {
    image: '/themes/blockchain-cybersecurity.webp',
    title: 'Cybersecurity & Blockchain',
    desc: 'Build secure authentication tools, data protection systems, and transparent blockchain networks.',
  },
  {
    image: '/themes/space-technology.webp',
    title: 'Space & Satellite Tech',
    desc: 'Analyze satellite imagery, space data, and navigation systems to solve geospatial challenges.',
  },
];

// Core Reasons to Join
const REASONS = [
  {
    number: '01',
    title: 'Big Cash Prizes & Official Awards',
    description:
      'Winning teams receive ₹1,50,000 cash prize per problem statement directly from sponsoring ministries and companies, along with official national certificates.',
    tag: 'Financial & National Reward',
  },
  {
    number: '02',
    title: 'Solve Real Problems That Matter',
    description:
      'Work on actual challenges posted by top government departments, industries, and NGOs. Your code can directly help millions of citizens across India.',
    tag: 'Real World Impact',
  },
  {
    number: '03',
    title: 'Supercharge Your Resume & Placements',
    description:
      'SIH projects stand out to campus recruiters. You gain a complete working prototype, real team experience, and a strong GitHub project to present in job interviews.',
    tag: 'Career Growth',
  },
  {
    number: '04',
    title: 'Full College & Mentorship Support',
    description:
      'Nagarjuna College provides dedicated faculty guidance, official recommendation letters signed by the Principal, and full travel support for grand finalists.',
    tag: 'NCET Endorsement',
  },
  {
    number: '05',
    title: '36 Hours of High Energy & Fun',
    description:
      'Experience the thrilling 36-hour non-stop hackathon vibe, late-night coding sessions, team camaraderie, and the joy of creating something from scratch.',
    tag: 'Unforgettable Vibe',
  },
  {
    number: '06',
    title: 'Keep Ownership of Your Innovation',
    description:
      'You retain intellectual property rights for your solution. Winning prototypes often receive incubation funding to turn into real startups.',
    tag: 'Startup Potential',
  },
];

const STATS = [
  { label: 'Prize Per Problem', value: '₹1.5 Lakh' },
  { label: 'Hackathon Duration', value: '36 Hours' },
  { label: 'Max Team Members', value: '6 Students' },
  { label: 'NCET Mentorship', value: '100% Free' },
];

export function WhyJoin() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-8 pb-20 pt-6 sm:pt-8 space-y-16">
      
      {/* 1. Open Clean Hero Title Block (No Outer Square Container, No Redundant Buttons) */}
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl space-y-4">
          <div className="eyebrow">
            Internal Screening Stage · SIH 2026
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight text-center">
            Why You Should Join Smart India Hackathon 2026
          </h1>

          <p className="lede mx-auto text-base sm:text-xl text-ink-soft max-w-2xl text-center">
            Don’t just study engineering — live it. Build real software and hardware, work with your best friends, win cash prizes, and represent Nagarjuna College on the national stage.
          </p>
        </div>
      </Reveal>

      {/* 2. Photo Gallery Showcase Banner (Real NCET SIH Photos) */}
      <Reveal delay={0.05}>
        <div className="space-y-6">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Real Moments from NCET</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              Experience the True Spirit of Innovation
            </h2>
            <p className="lede text-sm sm:text-base max-w-xl mx-auto text-center">
              Here is what happens when students step up, collaborate, and build solutions together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {GALLERY_HIGHLIGHTS.map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 space-y-1 text-center">
                  <div className="font-display text-base font-bold text-ink group-hover:text-marigold transition-colors">
                    {item.title}
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed text-center">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 3. Prototyping & Mentorship Visual Section */}
      <Reveal delay={0.08}>
        <div className="space-y-8 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Building Real Products</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              Turn Ideas into Working Hardware & Software
            </h2>
            <p className="lede text-sm sm:text-base max-w-2xl mx-auto text-center">
              At Nagarjuna College, you get direct access to lab facilities, mentoring sessions, and prototyping guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROTOTYPING_SHOWCASE.map((item, idx) => (
              <div
                key={idx}
                className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition-all duration-300 hover:border-marigold/60 hover:shadow-lg"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5 sm:w-3/5 flex flex-col justify-center space-y-2 text-left">
                  <div className="font-display text-lg font-bold text-ink group-hover:text-marigold transition-colors">
                    {item.title}
                  </div>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 4. Quick Motivational Stats Banner */}
      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-marigold/30 bg-marigold/10 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="font-display text-2xl sm:text-4xl font-bold text-marigold">
                  {stat.value}
                </div>
                <div className="mono text-xs text-ink-soft font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 5. SIH Innovation Domains Visual Mosaic */}
      <Reveal delay={0.12}>
        <div className="space-y-8 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Choose Your Passion</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              18 Problem Themes to Choose From
            </h2>
            <p className="lede text-sm sm:text-base max-w-2xl mx-auto text-center">
              Whether you love AI, robotics, healthcare, green technology, or cybersecurity, there is a problem statement waiting for your team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES_SHOWCASE.map((theme, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={theme.image}
                    alt={theme.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5 space-y-2 text-center">
                  <div className="font-display text-base font-bold text-ink group-hover:text-marigold transition-colors">
                    {theme.title}
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed text-center">
                    {theme.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/problem-statements"
              className="mono inline-flex items-center rounded-full border border-ink/70 bg-paper px-6 py-3 text-xs font-bold text-ink hover:border-marigold hover:text-marigold transition-all"
            >
              Browse All 18 Problem Themes in Detail
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 6. Core Benefits Grid (In Simple English) */}
      <Reveal delay={0.14}>
        <div className="space-y-8 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Six Reasons to Register</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              What You Actually Gain at Every Stage
            </h2>
            <p className="lede text-sm sm:text-base max-w-2xl mx-auto text-center">
              Smart India Hackathon gives you practical advantages that go far beyond standard classroom tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map((reason) => (
              <div
                key={reason.number}
                className="flex flex-col justify-between rounded-2xl border border-line bg-paper p-6 sm:p-7 transition-all duration-300 hover:border-marigold/60 hover:shadow-lg space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-2.5 py-1">
                      {reason.number}
                    </span>
                    <span className="mono text-[0.65rem] font-semibold text-ink-soft bg-paper-3 rounded-full px-2.5 py-0.5">
                      {reason.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-ink">
                    {reason.title}
                  </h3>

                  <p className="text-sm text-ink-soft leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 7. Spotlight NCET Support Banner */}
      <Reveal delay={0.16}>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-2 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-left">
              <div className="mono text-xs font-bold text-marigold uppercase tracking-wider">
                Full Support from College Leadership
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink">
                You Are Not Alone in This Journey
              </h2>
              <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                Nagarjuna College of Engineering & Technology provides end-to-end guidance. Our Single Point of Contact (SPOC) and student coordinators review your progress, assist with presentation decks, and issue official endorsement letters.
              </p>
              <div className="pt-2">
                <Link
                  to="/people"
                  className="mono inline-flex items-center rounded-full border border-ink/70 bg-paper px-5 py-2.5 text-xs font-bold text-ink hover:border-marigold hover:text-marigold transition-all"
                >
                  Meet College Mentors & SPOC
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line shadow-md">
              <img
                src="/gallery/nodal-mentor-briefing.webp"
                alt="Mentor Briefing Session at Nagarjuna College"
                className="h-64 sm:h-72 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* 8. Simple Step-by-Step Hackathon Roadmap */}
      <Reveal delay={0.18}>
        <div className="space-y-8 border-t border-line/60 pt-12">
          <div className="text-center flex flex-col items-center justify-center mx-auto space-y-2">
            <div className="eyebrow">Simple 3-Step Journey</div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink text-center">
              How You Go from Idea to Finale
            </h2>
            <p className="lede text-sm sm:text-base max-w-xl mx-auto text-center">
              The internal screening process at Nagarjuna College is simple and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-line bg-paper p-6 space-y-3">
              <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-2.5 py-1">
                Step 1
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                Form Team & Pick Problem
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Form a team of up to 6 students, select your favorite problem statement from the explorer, and submit your registration details.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 space-y-3">
              <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-2.5 py-1">
                Step 2
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                Internal College Screening
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Submit your Google Drive presentation deck. Faculty evaluators review your concept for novelty, clarity, and feasibility.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 space-y-3">
              <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-2.5 py-1">
                Step 3
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                Grand Finale Nomination
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Top teams receive official college nomination letters signed by the Principal and advance to the national 36-hour hackathon.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <p className="mono text-[0.68rem] text-ink-soft/70 text-center leading-relaxed max-w-3xl mx-auto">
        Guidelines and terms are sourced from AICTE and Ministry of Education Innovation Cell for SIH 2026. Cash awards and nodal centre logistics are conducted in accordance with official SIH regulations.
      </p>

    </div>
  );
}
