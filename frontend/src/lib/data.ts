// Mock data layer. Every function here is shaped to match the real API
// responses described in ARCHITECTURE.md, so swapping to `src/api/*` (axios
// calls to FastAPI) later means changing the import, not the call site.

export type ScreeningStatus =
  | 'registered'
  | 'l1_submitted'
  | 'l1_under_review'
  | 'l1_cleared'
  | 'l1_rejected'
  | 'l2_submitted'
  | 'l2_under_review'
  | 'selected'
  | 'l2_rejected';

export const STATUS_LABEL: Record<ScreeningStatus, string> = {
  registered: 'Registered',
  l1_submitted: 'Level 1 submitted',
  l1_under_review: 'Level 1 in review',
  l1_cleared: 'Cleared Level 1',
  l1_rejected: 'Not selected (Level 1)',
  l2_submitted: 'Level 2 submitted',
  l2_under_review: 'Level 2 in review',
  selected: 'Selected for SIH',
  l2_rejected: 'Not selected (Level 2)',
};

export const STATUS_STAGE: Record<ScreeningStatus, 0 | 1 | 2 | 3> = {
  registered: 0,
  l1_submitted: 1,
  l1_under_review: 1,
  l1_cleared: 1,
  l1_rejected: 1,
  l2_submitted: 2,
  l2_under_review: 2,
  l2_rejected: 2,
  selected: 3,
};

export const STATUS_TONE: Record<ScreeningStatus, 'neutral' | 'progress' | 'good' | 'bad'> = {
  registered: 'neutral',
  l1_submitted: 'progress',
  l1_under_review: 'progress',
  l1_cleared: 'good',
  l1_rejected: 'bad',
  l2_submitted: 'progress',
  l2_under_review: 'progress',
  selected: 'good',
  l2_rejected: 'bad',
};

export const PROBLEM_THEMES = [
  { name: 'Smart Automation', blurb: 'Make repetitive, manual work run itself.', image: '/themes/smart-automation.webp' },
  { name: 'Fitness & Sports', blurb: 'Help people train, recover, and play better.', image: '/themes/fitness-sports.webp' },
  { name: 'Space Technology', blurb: 'Tools for satellites, orbits, and exploration.', image: '/themes/space-technology.webp' },
  { name: 'Heritage & Culture', blurb: 'Protect and share what makes a place unique.', image: '/themes/heritage-culture.webp' },
  { name: 'MedTech / BioTech / HealthTech', blurb: 'Better care, earlier diagnosis, easier access.', image: '/themes/medtech-healthtech.webp' },
  { name: 'Agriculture & Rural Development', blurb: 'More yield, less waste, fairer prices for farmers.', image: '/themes/agriculture-rural.webp' },
  { name: 'Smart Vehicles', blurb: 'Safer, cleaner, smarter ways to move.', image: '/themes/smart-vehicles.webp' },
  { name: 'Transportation & Logistics', blurb: 'Get people and goods where they need to be, faster.', image: '/themes/transportation-logistics.webp' },
  { name: 'Robotics & Drones', blurb: 'Machines that can see, move, and act on their own.', image: '/themes/robotics-drones.webp' },
  { name: 'Clean & Green Technology', blurb: 'Less waste, less carbon, more circular systems.', image: '/themes/clean-green-technology.webp' },
  { name: 'Tourism', blurb: 'Make travel easier to plan, book, and enjoy.', image: '/themes/tourism.webp' },
  { name: 'Renewable Energy', blurb: 'Generate, store, and share clean power better.', image: '/themes/renewable-energy.webp' },
  { name: 'Blockchain & Cybersecurity', blurb: 'Keep data, identity, and money safe.', image: '/themes/blockchain-cybersecurity.webp' },
  { name: 'Smart Education', blurb: 'Learning that adapts to the student, not the other way round.', image: '/themes/smart-education.webp' },
  { name: 'Disaster Management', blurb: 'Predict, warn, and respond before it is too late.', image: '/themes/disaster-management.webp' },
  { name: 'Games & Toys', blurb: 'Play that teaches, includes, or just delights.', image: '/themes/games-toys.webp' },
  { name: 'FinTech', blurb: 'Simpler, fairer access to money and credit.', image: '/themes/fintech.webp' },
  { name: 'Miscellaneous', blurb: 'A real problem that does not fit a neat box — bring it anyway.', image: '/themes/miscellaneous.webp' },
] as const;

export const PEOPLE = {
  principal: {
    name: 'Thippeswamy',
    role: 'Principal, Nagarjuna College of Engineering & Technology',
    photoUrl: '/people/principal.webp',
    quote:
      "Innovation isn't a subject you pass. It's a habit you build — and this is where our students build it first.",
    message: [
      'Every year, Smart India Hackathon gives our students a rare kind of exam — one with no textbook answer.',
      'They have to find a real problem, understand who it hurts, and build something that actually helps. That is a harder and more useful skill than almost anything we teach in a classroom.',
      'This portal exists so that process is fair, visible, and worth remembering — for the students who make it to the national round, and just as much for the ones who try for the first time this year.',
    ],
  },
  spoc: {
    name: 'Bhargav R',
    role: 'College SPOC',
    initials: 'BR',
    photoUrl: '/people/bhargav.webp',
    email: 'dr.bhargava@ncetmail.com',
    phone: '+91 96633 00824',
    bio: 'Owns final selection and publishes results to the national SIH portal. The single point of contact between this college and the national organisers.',
  },
  coordinators: [
    {
      name: 'Partha Shankar',
      role: 'Coordinator',
      initials: 'PS',
      photoUrl: '/people/partha.webp',
      email: 'parthashankar21@gmail.com',
      phone: '+91 93531 89326',
      bio: 'Runs the day-to-day of the internal hackathon — registrations, communication, and keeping announcements current.',
    },
    {
      name: 'Nirmith M Jain',
      role: 'Coordinator',
      initials: 'NJ',
      photoUrl: '/people/nirmith.webp',
      email: 'nirmithmjain@gmail.com',
      phone: '+91 94821 10905',
      bio: 'Works alongside Partha on logistics and communication for the internal hackathon.',
    },
  ],
};

// Dates per the official SIH 2026 Guidelines (SPOC registration, and the
// national nomination/idea-submission deadline, are fixed by AICTE — the
// internal-screening dates in between are this college's own schedule.
export const COLLEGE_SOCIAL = {
  instagram: 'https://www.instagram.com/ncet_official/',
  youtube: 'https://www.youtube.com/channel/UC7z2VqJIhSkCh4HC1y9zdaw',
  linkedin: 'https://www.linkedin.com/school/nagarjuna-college-bangalore/',
};

export const SIH_OFFICIAL = {
  website: 'https://sih.gov.in/',
  email: 'sih@aicte-india.org',
  phones: ['011 2958 1222', '011 2958 1223', '011 2958 1239', '011 2958 1240', '011 2958 1241', '011 2958 1319'],
  social: {
    x: 'https://x.com/SIH2025',
    linkedin: 'https://in.linkedin.com/company/moe-innovation-cell',
    facebook: 'https://www.facebook.com/mhrdInnovation/',
    instagram: 'https://www.instagram.com/mhrd.innovationcell/',
  },
};

export const DEVELOPERS = [
  {
    name: 'Partha Shankar',
    role: 'Developer & Coordinator',
    initials: 'PS',
    photoUrl: '/people/partha.webp',
    linkedin: 'https://www.linkedin.com/in/partha-shankar?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    email: 'parthashankar21@gmail.com',
    phone: '+91 93531 89326',
    bio: 'Designed and built this entire portal — frontend, backend, the screening flow, and the admin console. Also a coordinator running the internal hackathon.',
  },
  {
    name: 'Nirmith M Jain',
    role: 'Frontend Design & Coordinator',
    initials: 'NJ',
    photoUrl: '/people/nirmith.webp',
    linkedin: 'https://www.linkedin.com/in/nirmith-m-jain-3126b027a?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    email: 'nirmithmjain@gmail.com',
    phone: '+91 94821 10905',
    bio: 'Assisted with the frontend design, and works as a coordinator for the internal hackathon.',
  },
];

// Per the official SIH 2026 timeline graphic (AICTE / MoE Innovation Cell).
export const TIMELINE_PHASES = [
  {
    phase: 'Setup',
    range: 'Jun – Aug 2026',
    items: [
      { date: 'Jun–Aug', title: 'Registration of SPOCs', detail: "The college's SPOC registers on the national SIH portal." },
      { date: 'Jun–Aug', title: 'Internal Hackathon', detail: 'This college runs its own screening — register your team on this portal.' },
    ],
  },
  {
    phase: 'Submit & screen',
    range: 'Jul – Oct 2026',
    items: [
      { date: 'Jul–Aug', title: 'SIH problem statement launch', detail: 'The national portal publishes this year’s problem statements.' },
      { date: 'Jul–Aug', title: 'Internal hackathon report', detail: "The SPOC compiles and uploads this college's internal hackathon report." },
      { date: 'Aug–Sep', title: 'Nomination & idea submission', detail: 'The SPOC nominates the top teams and submits their ideas on the national portal.' },
      { date: 'Sep–Oct', title: 'Screening of ideas', detail: 'National-level experts evaluate every submitted idea.' },
    ],
  },
  {
    phase: 'Results',
    range: 'Oct – Nov 2026',
    items: [
      { date: 'Oct', title: 'Result publication', detail: 'The national portal publishes screening results.' },
      { date: 'Nov', title: 'Communication to finalist teams', detail: 'Shortlisted teams are notified directly.' },
    ],
  },
  {
    phase: 'Grand Finale',
    range: 'Nov – Dec 2026',
    items: [
      { date: 'Nov', title: 'Mentoring & training sessions', detail: 'Shortlisted teams prepare with mentors ahead of the finale.' },
      { date: 'Nov', title: 'Grand Finale shortlist announced', detail: 'Final list of students attending the Grand Finale is announced.' },
      { date: 'Dec', title: 'SIH Grand Finale', detail: 'Shortlisted teams travel to their assigned nodal centre for the national round.' },
    ],
  },
] as const;

export const ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'Level 1 submission window is open',
    body: 'You can now submit your first idea from your dashboard. Feedback typically arrives within 5 working days.',
    date: '2026-08-01',
  },
  {
    id: 'a2',
    title: 'Mentoring sessions this week',
    body: 'Drop-in mentoring is available in the innovation lab, 3–5pm, Tuesday to Thursday.',
    date: '2026-08-04',
  },
];

export type PostKind = 'post' | 'update';

export type UpdatePost = {
  id: string;
  kind: PostKind;
  author: string;
  date: string;
  title: string;
  body: string;
};

export const UPDATES: UpdatePost[] = [
  {
    id: 'u1',
    kind: 'post',
    author: 'Bhargav R · SPOC',
    date: '2026-07-28',
    title: 'Internal registrations are now open',
    body: 'Any student at this college can now register a team for SIH 2026 screening. Six members per team, at least one woman on the team, all from this college — full rules are on the Rules page.',
  },
  {
    id: 'u2',
    kind: 'update',
    author: 'Partha Shankar · Coordinator',
    date: '2026-07-30',
    title: 'Mentor sign-ups opening soon',
    body: "If you'd like to mentor a team through the screening rounds, we'll open sign-ups for faculty and industry mentors next week. Teams shortlisted for the national round can carry up to 2 mentors to the Grand Finale.",
  },
];

// ---- mock registrations roster (1000+ students, for the admin table) ----

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna',
  'Ishaan', 'Rohan', 'Kabir', 'Aryan', 'Dhruv', 'Karthik', 'Manoj', 'Nikhil',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kavya', 'Ira', 'Myra', 'Sara',
  'Priya', 'Neha', 'Riya', 'Sneha', 'Pooja', 'Divya', 'Meera', 'Lakshmi',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Rao', 'Reddy', 'Nair', 'Iyer', 'Menon',
  'Shetty', 'Kumar', 'Patil', 'Joshi', 'Desai', 'Pillai', 'Naidu', 'Bhat',
];
const DEPARTMENTS = ['CSE', 'ISE', 'AI & ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech'];
const STATUS_POOL: ScreeningStatus[] = [
  'registered', 'registered', 'l1_submitted', 'l1_under_review', 'l1_cleared',
  'l1_rejected', 'l2_submitted', 'l2_under_review', 'selected', 'l2_rejected',
];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TeamRow = {
  id: string;
  teamName: string;
  leader: string;
  department: string;
  year: 1 | 2 | 3 | 4;
  theme: string;
  members: number;
  status: ScreeningStatus;
  level1Score: number | null;
  level2Score: number | null;
};

function buildRoster(count: number): TeamRow[] {
  const rand = mulberry32(20260731);
  const rows: TeamRow[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const status = STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)];
    const stage = STATUS_STAGE[status];
    rows.push({
      id: `team-${i + 1}`,
      teamName: `Team ${last}${(i % 37) + 1}`,
      leader: `${first} ${last}`,
      department: DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)],
      year: ((Math.floor(rand() * 4) + 1) as 1 | 2 | 3 | 4),
      theme: PROBLEM_THEMES[Math.floor(rand() * PROBLEM_THEMES.length)].name,
      members: Math.floor(rand() * 4) + 3,
      status,
      level1Score: stage >= 1 && status !== 'registered' ? Math.floor(rand() * 30) + 60 : null,
      level2Score: stage >= 2 ? Math.floor(rand() * 30) + 60 : null,
    });
  }
  return rows;
}

export const TEAMS: TeamRow[] = buildRoster(1247);

export function getMyTeam(email: string): TeamRow {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return TEAMS[hash % TEAMS.length];
}

export const ADMIN_STATS = {
  totalStudents: TEAMS.reduce((sum, t) => sum + t.members, 0),
  totalTeams: TEAMS.length,
  // Cumulative — "reached at least this stage" — so the funnel is
  // monotonically non-increasing, not a snapshot of current-status counts.
  byStage: [0, 1, 2, 3].map(
    (stage) => TEAMS.filter((t) => STATUS_STAGE[t.status] >= stage).length
  ),
  selected: TEAMS.filter((t) => t.status === 'selected').length,
};
