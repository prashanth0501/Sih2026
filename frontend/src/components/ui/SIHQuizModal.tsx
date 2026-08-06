import { useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';

type QuizOption = {
  text: string;
  role: 'lead' | 'ai' | 'hardware' | 'design' | 'domain';
};

type Question = {
  id: number;
  question: string;
  options: QuizOption[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'When faced with a complex real-world problem, what is your first instinct?',
    options: [
      { text: 'Organize the team, map the architecture, and divide tasks efficiently.', role: 'lead' },
      { text: 'Design an AI model or algorithm to process real-time data.', role: 'ai' },
      { text: 'Solder sensors, microcontroller boards, and assemble hardware components.', role: 'hardware' },
      { text: 'Draft wireframes, user journeys, and slick interactive dashboards.', role: 'design' },
      { text: 'Research the ministry guidelines, domain impact, and user feasibility.', role: 'domain' },
    ],
  },
  {
    id: 2,
    question: 'During a 36-hour non-stop hackathon sprint, where will your teammates find you at 3 AM?',
    options: [
      { text: 'Reviewing git commits, updating the pitch deck, and keeping morale high.', role: 'lead' },
      { text: 'Fine-tuning neural network hyper-parameters and fixing API endpoints.', role: 'ai' },
      { text: 'Debugging oscilloscope readings and testing IoT sensor signals.', role: 'hardware' },
      { text: 'Crafting responsive CSS animations and polishing typography details.', role: 'design' },
      { text: 'Drafting the final evaluation report and calculating ROI for judges.', role: 'domain' },
    ],
  },
  {
    id: 3,
    question: 'What excites you the most about winning Smart India Hackathon?',
    options: [
      { text: 'Leading an NCET student team to national glory and Principal recognition.', role: 'lead' },
      { text: 'Solving a complex technical bottleneck using cutting-edge tech.', role: 'ai' },
      { text: 'Building a tangible physical prototype that impacts millions of lives.', role: 'hardware' },
      { text: 'Watching judges be blown away by a stunning user experience.', role: 'design' },
      { text: 'Earning the ₹1.5 Lakh prize and launching our prototype into a real startup.', role: 'domain' },
    ],
  },
];

const PERSONAS = {
  lead: {
    title: 'The Visionary Team Lead 👑',
    desc: 'You are the orchestrator who brings 6 minds together. You turn chaotic ideas into strategic roadmaps and lead under pressure.',
    badge: 'SIH Command Officer',
    color: 'from-amber-500 to-orange-600',
  },
  ai: {
    title: 'The AI & Software Architect 🧠',
    desc: 'You eat algorithms for breakfast. Your code forms the backbone of smart automation, computer vision, and national AI solutions.',
    badge: 'AI Core Specialist',
    color: 'from-purple-500 to-indigo-600',
  },
  hardware: {
    title: 'The Hardware & IoT Wizard ⚡',
    desc: 'You turn microchips, sensors, and circuitry into real-world innovations. You bridge the gap between physical world and digital code.',
    badge: 'Hardware Pioneer',
    color: 'from-emerald-500 to-teal-600',
  },
  design: {
    title: 'The Product & Experience Craftsman 🎨',
    desc: 'You make technology beautiful, intuitive, and delightful. Your interfaces leave judges awe-struck within seconds.',
    badge: 'UX Innovation Strategist',
    color: 'from-pink-500 to-rose-600',
  },
  domain: {
    title: 'The National Domain Innovator 🚀',
    desc: 'You understand real-world impact, government ministry problem statements, and business viability better than anyone else.',
    badge: 'Impact Director',
    color: 'from-blue-500 to-cyan-600',
  },
};

interface SIHQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SIHQuizModal({ isOpen, onClose }: SIHQuizModalProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    lead: 0,
    ai: 0,
    hardware: 0,
    design: 0,
    domain: 0,
  });
  const [resultRole, setResultRole] = useState<keyof typeof PERSONAS | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (role: 'lead' | 'ai' | 'hardware' | 'design' | 'domain') => {
    const updatedScores = { ...scores, [role]: (scores[role] || 0) + 1 };
    setScores(updatedScores);

    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate winner
      let highestRole: keyof typeof PERSONAS = 'lead';
      let maxScore = -1;
      Object.entries(updatedScores).forEach(([r, score]) => {
        if (score > maxScore) {
          maxScore = score;
          highestRole = r as keyof typeof PERSONAS;
        }
      });

      setResultRole(highestRole);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScores({ lead: 0, ai: 0, hardware: 0, design: 0, domain: 0 });
    setResultRole(null);
  };

  const persona = resultRole ? PERSONAS[resultRole] : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-line bg-paper p-6 sm:p-8 shadow-2xl overflow-hidden text-ink">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-paper-3 text-ink-soft hover:bg-marigold hover:text-paper font-bold transition-all flex items-center justify-center cursor-pointer z-10"
        >
          ✕
        </button>

        {!persona ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold text-marigold bg-marigold/15 px-3 py-1 rounded-full">
                Question {currentQ + 1} of {QUESTIONS.length}
              </span>
              <span className="mono text-xs text-ink-soft">SIH Persona Assessment</span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
              {QUESTIONS[currentQ].question}
            </h3>

            <div className="space-y-3 pt-2">
              {QUESTIONS[currentQ].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option.role)}
                  className="w-full text-left p-4 rounded-2xl border border-line bg-paper-2 hover:bg-paper-3 hover:border-marigold/60 transition-all text-sm font-medium text-ink flex items-center justify-between group cursor-pointer"
                >
                  <span>{option.text}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-marigold font-bold mono">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
            <div className="inline-block rounded-full bg-gradient-to-r p-1 text-xs font-bold text-white shadow-lg">
              <div className={`rounded-full bg-gradient-to-r ${persona.color} px-4 py-1.5 uppercase tracking-wider mono`}>
                {persona.badge}
              </div>
            </div>

            <h3 className="font-display text-3xl font-bold text-ink">{persona.title}</h3>

            <p className="text-base text-ink-soft max-w-md mx-auto leading-relaxed">{persona.desc}</p>

            <div className="p-4 rounded-2xl bg-paper-2 border border-line text-xs mono text-ink-soft">
              💡 <b>Every SIH team needs 6 members</b> combining software, hardware, design, and domain leadership!
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/register"
                onClick={onClose}
                className="mono rounded-full bg-marigold px-6 py-3 text-sm font-bold text-paper shadow-md hover:bg-marigold/90 transition-all"
              >
                Register Team with this Persona →
              </Link>
              <button
                onClick={resetQuiz}
                className="mono rounded-full border border-line bg-paper px-5 py-3 text-sm font-bold text-ink hover:bg-paper-3 transition-all cursor-pointer"
              >
                Retake Quiz ↺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
