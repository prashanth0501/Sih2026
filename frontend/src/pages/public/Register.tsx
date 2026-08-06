import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { PROBLEM_THEMES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { createTeam, type ApiTeamMember } from '@/api/teams';
import { getSystemSettings } from '@/api/settings';

const DEPARTMENTS = ['CSE', 'ISE', 'AI & ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech'];
const STEPS = ['Leader details & USN', 'Team roster & GitHub'];

export function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: getSystemSettings,
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    usn: '',
    password: '',
    department: DEPARTMENTS[0],
    year: 2,
    leaderGithub: '',
    teamName: '',
    theme: '',
  });

  // Additional team members added during registration
  const [members, setMembers] = useState<ApiTeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    usn: '',
    department: DEPARTMENTS[0],
    year: 2,
    github_url: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAddMember() {
    if (!newMember.name || !newMember.email || !newMember.usn || !newMember.github_url) {
      setError('Member name, email, compulsory USN, and GitHub profile URL are required.');
      return;
    }
    if (!newMember.github_url.toLowerCase().includes('github.com')) {
      setError('Please enter a valid GitHub profile URL (e.g. https://github.com/username).');
      return;
    }
    setError('');
    setMembers((m) => [...m, { ...newMember, role: 'member' }]);
    setNewMember({
      name: '',
      email: '',
      usn: '',
      department: DEPARTMENTS[0],
      year: 2,
      github_url: '',
    });
  }

  function handleRemoveMember(idx: number) {
    setMembers((m) => m.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.usn.trim()) {
      setError('Leader USN is compulsory (e.g. 1NC22CS005).');
      return;
    }

    if (!form.leaderGithub || !form.leaderGithub.toLowerCase().includes('github.com')) {
      setError('Leader GitHub profile URL is compulsory (e.g. https://github.com/your-username).');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        usn: form.usn.toUpperCase(),
        password: form.password,
        department: form.department,
        year: form.year,
      });

      await createTeam({
        name: form.teamName,
        theme: form.theme,
        leader_usn: form.usn.toUpperCase(),
        leader_github_url: form.leaderGithub,
        members,
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Couldn't create your account. Check your details or contact admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (settings && !settings.registration_open) {
    return (
      <div className="mx-auto max-w-lg px-5 py-32 text-center sm:px-8">
        <Reveal>
          <div className="rounded border border-red-700/30 bg-red-950/20 p-8 text-paper">
            <h1 className="font-display text-2xl font-bold text-red-400">Registrations Are Closed</h1>
            <p className="mt-3 text-[0.9rem] text-paper/80">
              The SIH 2026 portal registration has been paused or closed by the admin. Please contact your campus SPOC or coordinators for support.
            </p>
            <Link to="/" className="mono mt-6 inline-block text-[0.8rem] text-marigold hover:underline">
              ← Return to homepage
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-28 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-4">Team Registration &amp; USN Verification</div>
        <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] font-bold">Register your SIH team.</h1>

        <div className="mt-6 flex gap-2.5">
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
              if (!form.name || !form.email || !form.usn || !form.password || !form.leaderGithub) {
                setError('Leader full name, email, compulsory USN, and GitHub URL are required.');
                return;
              }
              if (!form.leaderGithub.toLowerCase().includes('github.com')) {
                setError('Please provide a valid GitHub profile URL.');
                return;
              }
              setError('');
              setStep(1);
              return;
            }
            handleSubmit(e);
          }}
        >
          {step === 0 ? (
            <>
              <label className="grid gap-1.5 text-[0.8rem]">
                Your full name (Team Leader)
                <input
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Leader full name"
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1.5 text-[0.8rem]">
                  College USN <span className="text-red-500 font-bold">*Compulsory Unique</span>
                  <input
                    required
                    value={form.usn}
                    onChange={(e) => update('usn', e.target.value)}
                    placeholder="e.g. 1NC22CS005"
                    className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold font-mono text-[0.85rem] uppercase"
                  />
                </label>
                <label className="grid gap-1.5 text-[0.8rem]">
                  College email
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="leader@nagarjuna.edu"
                    className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                  />
                </label>
              </div>

              {/* Compulsory GitHub URL */}
              <label className="grid gap-1.5 text-[0.8rem]">
                Leader GitHub Profile URL <span className="text-red-500 font-bold">*Compulsory</span>
                <input
                  type="url"
                  required
                  value={form.leaderGithub}
                  onChange={(e) => update('leaderGithub', e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold font-mono text-[0.85rem]"
                />
              </label>

              <label className="grid gap-1.5 text-[0.8rem]">
                Account password
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="At least 8 characters"
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

              {error && <p className="text-[0.82rem] text-red-600 font-medium">{error}</p>}
              <Button type="submit" variant="primary" className="mt-2 justify-center">
                Continue to Team Roster →
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
                  placeholder="e.g. CyberShields"
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                />
              </label>
              <label className="grid gap-1.5 text-[0.8rem]">
                Problem theme
                <select
                  value={form.theme}
                  onChange={(e) => update('theme', e.target.value)}
                  className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
                >
                  <option value="">Select problem theme</option>
                  {PROBLEM_THEMES.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                </select>
              </label>

              {/* Teammates Section with mandatory USN & GitHub URL */}
              <div className="border border-line bg-paper-2 p-4 mt-2">
                <div className="font-bold text-[0.85rem] mb-2">Team Members ({members.length} added)</div>
                <p className="text-[0.75rem] text-ink-soft mb-3">
                  Each member must provide their USN and GitHub profile link.
                </p>

                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-line py-2 text-[0.8rem]">
                    <div>
                      <span className="font-medium">{m.name}</span> ({m.usn} · {m.department})
                      <div className="mono text-[0.7rem] text-marigold">{m.github_url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-red-600 hover:underline text-[0.75rem]"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {members.length < 5 && (
                  <div className="mt-3 grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Member Name"
                        value={newMember.name}
                        onChange={(e) => setNewMember((nm) => ({ ...nm, name: e.target.value }))}
                        className="border border-line bg-paper px-3 py-2 text-[0.8rem]"
                      />
                      <input
                        placeholder="Member USN *"
                        value={newMember.usn}
                        onChange={(e) => setNewMember((nm) => ({ ...nm, usn: e.target.value.toUpperCase() }))}
                        className="border border-line bg-paper px-3 py-2 text-[0.8rem] font-mono uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Member Email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember((nm) => ({ ...nm, email: e.target.value }))}
                        className="border border-line bg-paper px-3 py-2 text-[0.8rem]"
                      />
                      <input
                        placeholder="Member GitHub URL *"
                        type="url"
                        value={newMember.github_url}
                        onChange={(e) => setNewMember((nm) => ({ ...nm, github_url: e.target.value }))}
                        className="border border-line bg-paper px-3 py-2 text-[0.8rem] font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="mono rounded bg-paper-3 px-3 py-1.5 text-[0.72rem] text-ink border border-line hover:border-marigold"
                    >
                      + Add Member
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="text-[0.82rem] text-red-600 font-medium">{error}</p>}
              <div className="mt-2 flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1 justify-center">
                  {loading ? 'Creating Team...' : 'Create Team & Register →'}
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
