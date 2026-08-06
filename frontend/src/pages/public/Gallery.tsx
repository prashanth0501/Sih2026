import { Reveal } from '@/components/Reveal';

type Photo = {
  src: string;
  alt: string;
  caption: string;
  tall?: boolean;
};

const NODAL_PHOTOS: Photo[] = [
  {
    src: '/gallery/nodal-podium.webp',
    alt: 'A speaker addressing the SIH 2025 nodal-centre audience from a Nagarjuna-branded podium',
    caption: 'Opening remarks on the nodal-centre stage.',
    tall: true,
  },
  {
    src: '/gallery/nodal-lamp-lighting.webp',
    alt: 'Dignitaries lighting the ceremonial lamp to inaugurate SIH 2025 at Nagarjuna',
    caption: 'Lighting the lamp — SIH 2025 officially opens.',
  },
  {
    src: '/gallery/nodal-guard-of-honour.webp',
    alt: 'A guard of honour welcoming dignitaries on campus for SIH 2025',
    caption: 'A guard of honour for the visiting dignitaries.',
  },
  {
    src: '/gallery/nodal-audience.webp',
    alt: 'Rows of participants and faculty seated for the SIH 2025 opening session',
    caption: '"Hack for Bharat, Build" — the hall fills up.',
  },
  {
    src: '/gallery/nodal-memento.webp',
    alt: 'A dignitary presenting a memento to a guest on stage at SIH 2025',
    caption: 'A memento for the guests who made the day possible.',
  },
  {
    src: '/gallery/nodal-judging.webp',
    alt: 'A judge questioning a student team at their laptop during evaluation',
    caption: 'Judging in progress — every team gets grilled.',
    tall: true,
  },
  {
    src: '/gallery/nodal-team-review.webp',
    alt: 'An evaluator reviewing a team submission booklet at their desk',
    caption: 'Reading the fine print before the questions start.',
  },
  {
    src: '/gallery/nodal-team-briefing.webp',
    alt: 'Coordinators briefing a group of student teams at their laptops',
    caption: 'A coordinator walks a team through the next round.',
  },
  {
    src: '/gallery/nodal-mentor-briefing.webp',
    alt: 'A mentor addressing a group of students in yellow event polos',
    caption: 'One last briefing before the floor opens.',
  },
  {
    src: '/gallery/nodal-student-focus.webp',
    alt: 'A participant focused on their laptop during the hackathon',
    caption: 'Heads down — the clock is still running.',
  },
  {
    src: '/gallery/nodal-video-conference.webp',
    alt: 'The nodal centre screen showing a live inter-centre video address',
    caption: 'Every nodal centre in the country, on one call.',
  },
  {
    src: '/gallery/nodal-team-alvengers.webp',
    alt: 'A visiting student team seated at laptops during the SIH 2025 grand finale',
    caption: 'One of the visiting teams, mid-build.',
  },
  {
    src: '/gallery/nodal-team-red.webp',
    alt: 'A visiting student team in matching hoodies seated at a shared table of laptops',
    caption: 'Every table, a different team, the same deadline.',
  },
  {
    src: '/gallery/nodal-team-maroon.webp',
    alt: 'A student team in maroon polos posing at their workstation',
    caption: 'Seven laptops, one shared table.',
    tall: true,
  },
  {
    src: '/gallery/nodal-team-yellow.webp',
    alt: 'Coordinators briefing a student team in yellow event polos',
    caption: 'A quick word with the coordinators before evaluation.',
  },
  {
    src: '/gallery/nodal-evaluation-panel.webp',
    alt: 'A panel of evaluators reviewing paperwork around a conference table',
    caption: 'Where the scoring actually happens.',
  },
  {
    src: '/gallery/nodal-officials-briefing.webp',
    alt: 'College officials speaking with a student team at the hackathon floor',
    caption: 'A walkthrough with the organisers.',
  },
  {
    src: '/gallery/nodal-evaluator-room.webp',
    alt: 'An evaluator addressing a student team gathered around a laptop in a small room',
    caption: 'A closer room, a closer look at the build.',
  },
];

const MOMENT_PHOTOS: Photo[] = [
  {
    src: '/hero/mural-workspace.webp',
    alt: 'Students at laptops in a mural-covered workspace',
    caption: 'Heads down, ideas out loud.',
  },
  {
    src: '/hero/mentor-session.webp',
    alt: 'A mentor guiding a student team through a hardware build',
    caption: 'Mentorship, hands-on.',
  },
  {
    src: '/hero/gears-team.webp',
    alt: 'A team of students gathered around a mechanical prototype',
    caption: 'A prototype worth crowding around.',
  },
  {
    src: '/hero/lab-electronics.webp',
    alt: 'Students wiring a circuit board together in a lab',
    caption: 'Wiring it up, one connection at a time.',
  },
  {
    src: '/hero/wiring-closeup.webp',
    alt: 'Two students in event polos wiring a breadboard together at a desk',
    caption: 'Two heads, one tangle of wires.',
  },
];

function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {photos.map((p, i) => (
        <Reveal key={p.src} delay={(i % 6) * 0.05} className={p.tall ? 'sm:row-span-2' : undefined}>
          <figure className="group relative h-full overflow-hidden rounded-sm">
            <img
              src={p.src}
              alt={p.alt}
              className={`w-full object-cover shadow-md shadow-ink/10 transition-transform duration-500 group-hover:scale-105 ${
                p.tall ? 'h-full min-h-72' : 'h-56 sm:h-64'
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <figcaption className="pointer-events-none absolute bottom-3 left-4 right-4 text-[0.72rem] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {p.caption}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

export function Gallery() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-6 sm:pt-8">
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl space-y-3">
          <div className="eyebrow">Nodal Centre · SIH 2025</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
            We didn't just send a team. We hosted the floor.
          </h1>
          <p className="lede text-center mx-auto max-w-2xl">
            In 2025, Nagarjuna College of Engineering &amp; Technology was chosen as an official Nodal Centre
            for Smart India Hackathon — opening our doors to teams, judges, and dignitaries from across the
            region. Here's what that day actually looked like.
          </p>
        </div>
      </Reveal>

      <div className="mt-16">
        <PhotoGrid photos={NODAL_PHOTOS} />
      </div>

      <Reveal>
        <div className="mt-24 border-t border-line pt-10 text-center">
          <div className="eyebrow mb-5 flex justify-center">Everyday moments</div>
          <h2 className="mx-auto max-w-[24ch] text-[clamp(1.6rem,3.5vw,2.2rem)]">
            The same energy, minus the ceremony.
          </h2>
          <p className="lede mx-auto mt-4 max-w-[60ch]">
            Hackathons aren't only inaugurations and mementos — most of the work happens quietly, at a table,
            with a laptop and a deadline.
          </p>
        </div>
      </Reveal>

      <div className="mt-12">
        <PhotoGrid photos={MOMENT_PHOTOS} />
      </div>
    </div>
  );
}
