import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { PROBLEM_THEMES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { createTeam } from '@/api/teams';

const DEPARTMENTS = ['CSE', 'ISE', 'AI & ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech'];
const STEPS = ['Your account', 'Your team'];

export function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: DEPARTMENTS[0],
    year: 2,
    teamName: '',
    theme: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        year: form.year,
      });
      await createTeam({ name: form.teamName, theme: form.theme });
      navigate('/dashboard', { replace: true });
    } catch {
      setError("Couldn't create your account — that email may already be registered, or the API server isn't running.");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Team leader registration</div>
        <h1 className="text-[clamp(1.9rem,4vw,2.6rem)]">Register your team.</h1>

        <div className="mt-8 flex gap-2.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={cn('h-1 rounded-full transition-colors', i <= step ? 'bg-spark' : 'bg-line')} />
              <div className="mono mt-2 text-[0.62rem] text-ink-soft">{label}</div>
            </div>
          ))}
        </div>

        <form
          className="mt-8 grid gap-4"
          onSubmit={(e) => {
            if (step === 0) {
              e.preventDefault();
              setStep(1);
              return;
            }
            handleSubmit(e);
          }}
        >
          {step === 0 ? (
            <>
              <label className="grid gap-1.5 text-[0.8rem]">
                Your full name
                <input
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>
              <label className="grid gap-1.5 text-[0.8rem]">
                College email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@nagarjuna.edu"
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>
              <label className="grid gap-1.5 text-[0.8rem]">
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1.5 text-[0.8rem]">
                  Department
                  <select
                    value={form.department}
                    onChange={(e) => update('department', e.target.value)}
                    className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-[0.8rem]">
                  Year
                  <select
                    value={form.year}
                    onChange={(e) => update('year', Number(e.target.value))}
                    className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Button type="submit" variant="primary" className="mt-2 justify-center">
                Continue →
              </Button>
            </>
          ) : (
            <>
              <label className="grid gap-1.5 text-[0.8rem]">
                Team name
                <input
                  required
                  value={form.teamName}
                  onChange={(e) => update('teamName', e.target.value)}
                  placeholder="e.g. Team Ignite"
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>
              <label className="grid gap-1.5 text-[0.8rem]">
                Problem theme <span className="text-ink-soft">(you can change this later)</span>
                <select
                  value={form.theme}
                  onChange={(e) => update('theme', e.target.value)}
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                >
                  <option value="">Not decided yet</option>
                  {PROBLEM_THEMES.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                </select>
              </label>
              <p className="text-[0.8rem] text-ink-soft">
                You can add your other 2–5 teammates from the dashboard once your team is created.
              </p>
              {error && <p className="text-[0.82rem] text-red-700">{error}</p>}
              <div className="mt-2 flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1 justify-center">
                  Create team →
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-[0.85rem] text-ink-soft">
          Already registered?{' '}
          <Link to="/login" className="text-marigold hover:underline">
            Log in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
