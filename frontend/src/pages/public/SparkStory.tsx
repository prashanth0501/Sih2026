import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { SparkStoryCanvas3D } from '@/components/3d/SparkStoryCanvas3D';
import { SIHQuizModal } from '@/components/ui/SIHQuizModal';

type StoryChapter = {
  id: string;
  number: string;
  stage: string;
  title: string;
  subtitle: string;
  story: string;
  impactQuote: string;
  image: string;
  imageCaption: string;
  highlight: string;
  badgeColor: string;
  dark?: boolean;
};

const CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1',
    number: '01',
    stage: 'The Spark of Curiosity',
    title: 'It Starts with a Single Observation',
    subtitle: 'Where engineering meets real human need.',
    story:
      'Somewhere in the NCET labs or on your daily commute, you notice a systemic problem — traffic congestion, agricultural yield loss, medical diagnostic delay, or renewable grid instability. No code written yet. Just a spark of engineering curiosity and the belief that you can build the solution.',
    impactQuote: '"Every national breakthrough started as a single student asking: what if we fixed this?"',
    image: '/hero/lab-electronics.webp',
    imageCaption: 'NCET Electronics & Robotics Lab — where ideas take spark.',
    highlight: '1 Observation = The Origin of Innovation',
    badgeColor: '#ff7a1a',
  },
  {
    id: 'ch2',
    number: '02',
    stage: 'The National Movement',
    title: 'What is Smart India Hackathon?',
    subtitle: 'The world’s largest open innovation initiative by MoE & AICTE.',
    story:
      'Smart India Hackathon (SIH) is a nationwide initiative by the Ministry of Education, Government of India. It challenges college students across the country to solve pressing challenges posed by central ministries, state departments, hospitals, and industrial giants.',
    impactQuote: '"Not just a college competition — a chance to build software used by millions."',
    image: '/gallery/nodal-audience.webp',
    imageCaption: 'Thousands of student innovators uniting across India.',
    highlight: 'World’s Largest Hackathon Platform',
    badgeColor: '#ffa92e',
  },
  {
    id: 'ch3',
    number: '03',
    stage: 'Dream Team Assembly',
    title: 'Gathering Your 6-Member Crew',
    subtitle: 'Combining software, hardware, UI/UX, and domain intelligence.',
    story:
      'An idea needs hands. At Nagarjuna College, students form cross-disciplinary teams of up to 6 members. Mix computer science developers with electronics hardware integrators and domain strategists. SIH rules mandate at least 1 female team member, fostering inclusive leadership.',
    impactQuote: '"Diverse teams win hackathons. Bring coders, builders, and storytellers together."',
    image: '/gallery/nodal-team-alvengers.webp',
    imageCaption: 'NCET student team collaborating on solution architecture.',
    highlight: '6 Minds, 1 Shared Mission (Female Representation Mandatory)',
    badgeColor: '#4a3ab4',
  },
  {
    id: 'ch4',
    number: '04',
    stage: 'Theme Exploration',
    title: 'Selecting from 18 National Challenges',
    subtitle: 'From AI & Smart Automation to MedTech & Green Energy.',
    story:
      'Teams dive into 18 problem statement categories released by government ministries — covering Smart Vehicles, Space Technology, Cyber Security, Blockchain, Renewable Energy, and Disaster Management. Choose the challenge that aligns with your team’s passion.',
    impactQuote: '"Pick a challenge that keeps your team awake with excitement."',
    image: '/themes/smart-automation.webp',
    imageCaption: 'Exploring 18 national problem themes for SIH 2026.',
    highlight: '18 Official Ministry Problem Themes',
    badgeColor: '#ff7a1a',
  },
  {
    id: 'ch5',
    number: '05',
    stage: 'Mentorship & Prototyping',
    title: 'Turning Concepts into Code & Hardware',
    subtitle: 'Supported by NCET SPOC & Faculty Coordinators.',
    story:
      'Late afternoons in NCET labs transform into breakthrough sessions. SPOC Bhargav R and student coordinators Partha Shankar & Nirmith M Jain provide guidance on software design, cloud integration, and hardware wiring to ensure your prototype is submission-ready.',
    impactQuote: '"With 24/7 lab access and faculty mentorship, your vision takes physical form."',
    image: '/hero/mentor-session.webp',
    imageCaption: 'Hands-on faculty mentorship & code review at NCET.',
    highlight: '24/7 NCET Lab Access & Cloud Credits',
    badgeColor: '#9c90f2',
  },
  {
    id: 'ch6',
    number: '06',
    stage: 'Internal Screening Battle',
    title: 'Presenting to the College Evaluation Panel',
    subtitle: 'Level 1 Google Drive Deck & Live Prototype Pitch.',
    story:
      'Before reaching the national stage, teams submit their Level 1 Google Drive presentation deck and demonstrate their prototype to the internal NCET jury. Evaluators score submissions on technical novelty, feasibility, user experience, and impact clarity.',
    impactQuote: '"The internal pitch refines your delivery for national scrutiny."',
    image: '/gallery/nodal-judging.webp',
    imageCaption: 'Internal screening review and live panel scoring.',
    highlight: 'Official Level 1 Screening Clearance',
    badgeColor: '#ff7a1a',
  },
  {
    id: 'ch7',
    number: '07',
    stage: 'Principal’s Nomination',
    title: 'The Official College Letterhead Endorsement',
    subtitle: 'Clearing Level 1 grants your passport to the Grand Finale.',
    story:
      'Clearing NCET internal screening unlocks the national nomination. Your team receives an official nomination letter signed by Principal Thippeswamy on college letterhead, authorizing your entry into the central SIH portal.',
    impactQuote: '"Your hard work earns the official stamp of Nagarjuna College of Engineering."',
    image: '/gallery/nodal-mentor-briefing.webp',
    imageCaption: 'Receiving national nomination endorsement from NCET leadership.',
    highlight: 'Principal’s Nomination Letter Issued',
    badgeColor: '#ffa92e',
  },
  {
    id: 'ch8',
    number: '08',
    stage: 'The 36-Hour Grand Finale',
    title: 'The Electric Vibe of the Offline Nodal Center',
    subtitle: '36 hours of non-stop coding, caffeine, and national competition.',
    story:
      'Selected teams travel to designated Nodal Centers across India for the 36-hour offline Grand Finale. Surrounded by top student innovators, you code through the night, iterate on feedback from ministry judges, and pitch live in the final evaluation rounds.',
    impactQuote: '"36 hours that will test your grit, sharpen your skill, and forge lifelong bonds."',
    image: '/gallery/nodal-lamp-lighting.webp',
    imageCaption: 'Inauguration ceremony at the national 36-hour offline nodal finale.',
    highlight: '36-Hour Non-Stop Hackathon Arena',
    badgeColor: '#ff3366',
  },
  {
    id: 'ch9',
    number: '09',
    stage: 'National Glory & Cash Prize',
    title: 'Winning ₹1.5 Lakhs & National Recognition',
    subtitle: 'Certificates from Ministry of Education & AICTE.',
    story:
      'The final evaluation concludes. Winning teams earn the prestigious ₹1,50,000 cash prize per problem statement, national trophies, and official certificates signed by government leaders. Best of all, your team retains 100% intellectual property ownership.',
    impactQuote: '"₹1.5 Lakh cash prize, national acclaim, and complete ownership of your IP."',
    image: '/gallery/nodal-podium.webp',
    imageCaption: 'Celebrating victory on the national SIH podium stage.',
    highlight: '₹1.5 Lakh Cash Prize & 100% IP Rights',
    badgeColor: '#ffd700',
    dark: true,
  },
  {
    id: 'ch10',
    number: '10',
    stage: 'From Hackathon to Startup',
    title: 'Launching Your Solution into the Real World',
    subtitle: 'NCET Incubation, Patent Filing & Angel Support.',
    story:
      'SIH victory is just the beginning. At Nagarjuna College, winning prototypes receive incubator support, mentorship for patent filings, and opportunities to deploy solutions directly with government ministries and industry partners.',
    impactQuote: '"Transform your hackathon prototype into a thriving tech startup."',
    image: '/hero/mural-workspace.webp',
    imageCaption: 'NCET Innovation & Startup Incubation Workspace.',
    highlight: 'Incubation Support & Real-World Deployment',
    badgeColor: '#ff7a1a',
  },
];

const SIH_STATS = [
  { label: 'Prize Money', val: '₹1.5 Lakhs', desc: 'Per problem statement winner' },
  { label: 'National Reach', val: '100,000+', desc: 'Student innovators across India' },
  { label: 'Problem Themes', val: '18 Domains', desc: 'From AI to Space & MedTech' },
  { label: 'Finale Duration', val: '36 Hours', desc: 'Non-stop offline coding sprint' },
];

export function SparkStory() {
  const chapterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [tilt, setTilt] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // 1. Scroll Active Chapter Tracker
  useEffect(() => {
    function handleScroll() {
      const viewportCenter = window.innerHeight / 2;
      let closestIdx = 0;
      let minDistance = Infinity;

      chapterRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = index;
        }
      });

      setActiveIdx(closestIdx);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. 3D Mouse Parallax Card Tilt
  const handleMouseMoveCard = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 10;
    const rotateY = (x / rect.width) * 10;

    setTilt((prev) => ({ ...prev, [idx]: { x: rotateX, y: rotateY } }));
  };

  const handleMouseLeaveCard = (idx: number) => {
    setTilt((prev) => ({ ...prev, [idx]: { x: 0, y: 0 } }));
  };

  // 3. Victory Confetti Trigger
  const triggerVictoryConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // 4. Ambient Web Audio Synth Toggle
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 note
        gain.gain.setValueAtTime(0.04, ctx.currentTime); // Subtle volume

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        setIsAudioPlaying(true);
      } catch (err) {
        console.warn('Audio Context failed to start', err);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-paper overflow-x-hidden pb-24 pt-4 sm:pt-6 [perspective:1400px]">

      {/* 3D WebGL Canvas Layer */}
      <SparkStoryCanvas3D activeChapterIndex={activeIdx} />

      {/* Quiz Modal */}
      <SIHQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

      {/* Floating Audio & Quiz Quick Toolbar */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-paper/90 backdrop-blur-md border border-line/80 p-2 rounded-full shadow-2xl">
        <button
          onClick={toggleAmbientSound}
          title={isAudioPlaying ? 'Mute Ambient Sound' : 'Play Ambient Synth Sound'}
          className={cn(
            'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold mono transition-all cursor-pointer',
            isAudioPlaying
              ? 'bg-marigold text-paper shadow-md shadow-marigold/40'
              : 'bg-paper-3 text-ink-soft hover:bg-marigold/20'
          )}
        >
          {isAudioPlaying ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
        </button>

        <button
          onClick={() => setIsQuizOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-indigo px-4 py-2 text-xs font-bold text-paper mono shadow-lg shadow-indigo/30 hover:scale-105 transition-all cursor-pointer"
        >
          ✨ Take Quiz
        </button>
      </div>

      {/* Desktop Floating Right Navigation Dots */}
      <nav
        aria-label="3D Story Progress"
        className="fixed right-4 sm:right-8 top-1/2 z-40 hidden lg:flex -translate-y-1/2 flex-col gap-2.5 rounded-2xl border border-line/70 bg-paper/85 backdrop-blur-md p-3 shadow-xl max-h-[85vh] overflow-y-auto"
      >
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            aria-label={`Chapter ${c.number}: ${c.stage}`}
            onClick={() => {
              chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="group relative flex items-center justify-end cursor-pointer"
          >
            <span className="absolute right-7 opacity-0 transition-opacity duration-200 group-hover:opacity-100 mono text-[0.65rem] font-bold text-ink whitespace-nowrap bg-paper px-2.5 py-1 rounded-lg border border-line shadow-md">
              Ch {c.number}: {c.stage}
            </span>
            <span
              className={cn(
                'h-3.5 w-3.5 rounded-full border transition-all duration-300',
                activeIdx === i
                  ? 'scale-125 border-marigold bg-marigold shadow-md shadow-marigold/60'
                  : 'border-ink-soft/40 bg-paper-3 hover:border-marigold'
              )}
            />
          </button>
        ))}
      </nav>

      {/* Hero Header Introduction Block */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-6 mb-12 pt-6">
        <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-ink drop-shadow-sm">
          The Spark’s Story
        </h1>

        <p className="lede mx-auto text-base sm:text-2xl text-ink-soft max-w-2xl text-center leading-relaxed font-medium">
          From a single observation in NCET labs to national victory at Smart India Hackathon 2026.
          Scroll down to experience the 3D journey of innovation.
        </p>

        {/* Hero Interactive Quiz Launcher Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={() => setIsQuizOpen(true)}
            className="mono text-xs font-bold rounded-full bg-marigold px-6 py-3.5 text-paper shadow-xl shadow-marigold/30 hover:scale-105 transition-all cursor-pointer"
          >
            🎯 What’s Your SIH Persona? (Take Quiz)
          </button>
        </div>

        <div className="mono text-xs text-marigold font-bold pt-2 animate-bounce">
          Scroll down to launch the 3D experience ↓
        </div>
      </div>

      {/* SIH Key Stats Glass Banner */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl border border-line/60 bg-paper/40 backdrop-blur-md p-6 shadow-lg hover:bg-paper/50 transition-all">
          {SIH_STATS.map((st, idx) => (
            <div key={idx} className="text-center p-3">
              <div className="mono text-2xl sm:text-3xl font-bold text-marigold">{st.val}</div>
              <div className="mono text-xs font-bold text-ink pt-1">{st.label}</div>
              <div className="text-[0.72rem] text-ink-soft">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Storytelling Chapters */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8 space-y-20 sm:space-y-28">
        {CHAPTERS.map((chapter, idx) => {
          const isEven = idx % 2 === 0;
          const cardTilt = tilt[idx] || { x: 0, y: 0 };

          return (
            <div
              key={chapter.id}
              ref={(el) => {
                chapterRefs.current[idx] = el;
              }}
              className="scroll-mt-28 [perspective:1400px]"
            >
              <div
                onMouseMove={(e) => handleMouseMoveCard(idx, e)}
                onMouseLeave={() => handleMouseLeaveCard(idx)}
                style={{
                  transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) translateZ(10px)`,
                  transition: 'transform 0.15s ease-out',
                  transformStyle: 'preserve-3d',
                }}
                className={cn(
                  'relative overflow-hidden rounded-3xl border border-line/80 bg-paper/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl transition-all duration-300 hover:border-marigold/70',
                  chapter.dark && 'bg-ink/95 text-paper border-marigold/50 shadow-2xl'
                )}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Story Text Block */}
                  <div className={`space-y-4 lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex items-center gap-3">
                      <span className="mono text-xs font-bold text-marigold bg-marigold/15 rounded-md px-3 py-1">
                        Chapter {chapter.number}
                      </span>
                      <span
                        className={cn(
                          'mono text-[0.7rem] font-semibold rounded-full px-3 py-0.5',
                          chapter.dark ? 'bg-paper/10 text-paper/90' : 'bg-paper-3 text-ink-soft'
                        )}
                      >
                        {chapter.stage}
                      </span>
                    </div>

                    <h2
                      className={cn(
                        'font-display text-2xl sm:text-4xl font-bold tracking-tight',
                        chapter.dark ? 'text-paper' : 'text-ink'
                      )}
                    >
                      {chapter.title}
                    </h2>

                    <p
                      className={cn(
                        'mono text-xs font-semibold uppercase tracking-wider',
                        chapter.dark ? 'text-marigold' : 'text-marigold'
                      )}
                    >
                      {chapter.subtitle}
                    </p>

                    <p
                      className={cn(
                        'text-sm sm:text-base leading-relaxed',
                        chapter.dark ? 'text-paper/85' : 'text-ink-soft'
                      )}
                    >
                      {chapter.story}
                    </p>

                    <div
                      className={cn(
                        'p-3.5 rounded-xl border italic text-xs sm:text-sm font-serif leading-relaxed',
                        chapter.dark
                          ? 'bg-paper/5 border-marigold/30 text-paper/90'
                          : 'bg-marigold/5 border-marigold/30 text-ink'
                      )}
                    >
                      {chapter.impactQuote}
                    </div>

                    <div className="mono text-xs font-bold text-marigold pt-1 flex items-center gap-2">
                      <span>✦ Key Milestone:</span>
                      <span className="text-ink font-sans font-semibold">{chapter.highlight}</span>
                    </div>
                  </div>

                  {/* 3D Image Card */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div
                      style={{
                        transform: 'translateZ(30px)',
                      }}
                      className="overflow-hidden rounded-2xl border border-line shadow-2xl group transition-transform duration-300"
                    >
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="h-60 sm:h-76 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className={cn(
                          'p-3 border-t text-[0.72rem] mono text-center',
                          chapter.dark
                            ? 'bg-ink border-line/40 text-paper/80'
                            : 'bg-paper border-line text-ink-soft'
                        )}
                      >
                        {chapter.imageCaption}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Victory Celebration Interactive Trophy Stage */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8 mt-24">
        <div className="rounded-3xl border-2 border-gold bg-gradient-to-b from-paper via-paper-2 to-paper-3 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="mono text-xs font-bold text-marigold uppercase tracking-widest">
            🏆 The Victory Stage 🏆
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink max-w-2xl mx-auto">
            Will Your Team Be Next on the National Podium?
          </h2>

          <p className="lede text-base sm:text-lg text-ink-soft max-w-xl mx-auto text-center">
            Smart India Hackathon 2026 is calling for Nagarjuna College’s brightest minds.
            Celebrate the spark of innovation and step into history.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={triggerVictoryConfetti}
              className="mono inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              🎉 Trigger Victory Fireworks
            </button>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="mono inline-flex items-center gap-2 rounded-full border-2 border-indigo bg-paper px-6 py-3.5 text-sm font-bold text-indigo hover:bg-indigo hover:text-white transition-all hover:scale-105 cursor-pointer"
            >
              🧩 Assess Team Roles
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Call to Action Section */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8 mt-16">
        <div className="rounded-3xl border-2 border-marigold/60 bg-ink p-8 sm:p-14 text-center space-y-6 shadow-2xl text-paper">
          <div className="mono text-xs font-bold text-marigold uppercase tracking-widest">
            ✦ Your Story Begins Now ✦
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-paper max-w-2xl mx-auto">
            Every Great Innovation Journey Starts with One Registration
          </h2>

          <p className="text-base sm:text-lg text-paper/80 max-w-xl mx-auto text-center leading-relaxed">
            Don’t let your idea remain just a thought. Gather up to 6 members, choose a national ministry problem statement, and register your team at Nagarjuna College today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="mono inline-flex items-center rounded-full bg-marigold px-8 py-4 text-base font-bold text-paper shadow-xl shadow-marigold/40 transition-all hover:scale-105 hover:bg-marigold/90"
            >
              🚀 Register Your Team for SIH 2026
            </Link>
            <Link
              to="/why-join"
              className="mono inline-flex items-center rounded-full border-2 border-paper/60 bg-transparent px-7 py-4 text-base font-bold text-paper hover:border-marigold hover:text-marigold transition-all hover:scale-105"
            >
              Learn Why You Should Join →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
