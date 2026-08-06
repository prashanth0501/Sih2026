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
const STEPS = ['Step 1: Leader & Account Details', 'Step 2: Team Roster & Challenge Theme'];

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
      setError('Member Name, Email, USN, and GitHub profile URL are required.');
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
      setError('USN is required (e.g. 1NC22CS005).');
      return;
    }

    if (!form.leaderGithub || !form.leaderGithub.toLowerCase().includes('github.com')) {
      setError('Leader GitHub profile URL is required (e.g. https://github.com/your-username).');
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
      const msg = err.response?.data?.detail || "Couldn't create your account. Please check your details or contact admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (settings && !settings.registration_open) {
    return (
      <div className="mx-auto max-w-lg px-5 py-32 text-center sm:px-8">
        <Reveal>
          <div className="rounded-3xl border border-red-700/30 bg-red-950/20 p-8 text-paper">
            <h1 className="font-display text-2xl font-bold text-red-400">Registrations Are Closed</h1>
            <p className="mt-3 text-sm text-paper/80">
              The SIH 2026 portal registration has been paused or closed by the admin. Please contact your campus SPOC or coordinators for support.
            </p>
            <Link to="/" className="mono mt-6 inline-block text-xs font-bold text-marigold hover:underline">
              ← Return to homepage
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-8 pt-6 sm:pt-8 pb-20">
      <Reveal>
        
        {/* Header Block */}
        <div className="text-center flex flex-col items-center justify-center mx-auto space-y-3 mb-8">
          <div className="eyebrow">SIH 2026 Registration</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
            Register Your Team
          </h1>
          <p className="lede text-center mx-auto text-base text-ink-soft max-w-lg">
            Complete the 2-step registration to submit your team details for the internal NCET screening.
          </p>
        </div>

        {/* 2-Step Progress Indicator Bar */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 space-y-2">
              <div className={cn('h-2 rounded-full transition-all duration-300', i <= step ? 'bg-marigold' : 'bg-line')} />
              <div className={cn('mono text-xs font-bold text-center', i <= step ? 'text-marigold' : 'text-ink-soft')}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Main High-Contrast Card Form */}
        <div className="rounded-3xl border-2 border-line bg-paper-2 p-6 sm:p-10 shadow-2xl space-y-6">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              if (step === 0) {
                e.preventDefault();
                if (!form.name || !form.email || !form.usn || !form.password || !form.leaderGithub) {
                  setError('Leader Full Name, Email, USN, Password, and GitHub URL are required.');
                  return;
                }
                if (!form.leaderGithub.toLowerCase().includes('github.com')) {
                  setError('Please enter a valid GitHub profile URL (e.g. https://github.com/your-username).');
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
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                    Your Full Name (Team Leader) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                  />
                </div>

                {/* USN & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                      USN <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      required
                      value={form.usn}
                      onChange={(e) => update('usn', e.target.value)}
                      placeholder="e.g. 1NC22CS005"
                      className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink uppercase tracking-wider placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                      Email <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="leader@example.com"
                      className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Leader GitHub Profile */}
                <div className="space-y-1.5">
                  <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                    Leader GitHub Profile URL <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.leaderGithub}
                    onChange={(e) => update('leaderGithub', e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs mono"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                    Account Password <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Department & Year Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                      Department <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                      className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="text-ink font-semibold">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                      Year of Study <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={form.year}
                      onChange={(e) => update('year', Number(e.target.value))}
                      className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y} className="text-ink font-semibold">
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}

                <Button type="submit" variant="primary" className="w-full rounded-full py-4 text-base font-bold mono justify-center shadow-lg shadow-marigold/30">
                  Continue to Step 2 →
                </Button>
              </>
            ) : (
              <>
                {/* Team Name */}
                <div className="space-y-1.5">
                  <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                    Team Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    required
                    value={form.teamName}
                    onChange={(e) => update('teamName', e.target.value)}
                    placeholder="e.g. CyberShields"
                    className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Problem Theme */}
                <div className="space-y-1.5">
                  <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                    Problem Theme <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={form.theme}
                    onChange={(e) => update('theme', e.target.value)}
                    className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                  >
                    <option value="" className="text-ink-soft">Select problem theme</option>
                    {PROBLEM_THEMES.map((t) => (
                      <option key={t.name} value={t.name} className="text-ink font-semibold">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teammates Roster Container */}
                <div className="rounded-2xl border border-line bg-paper p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-line/50 pb-2">
                    <div className="mono text-xs font-bold text-ink uppercase tracking-wider">
                      Additional Team Members ({members.length} added)
                    </div>
                    <div className="mono text-xs text-marigold font-bold">
                      Up to 5 additional members
                    </div>
                  </div>

                  {members.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-line bg-paper-2 p-3 text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <div className="font-bold text-ink">{m.name} <span className="mono text-xs text-ink-soft">({m.usn} · {m.department})</span></div>
                        <div className="mono text-xs text-marigold font-semibold">{m.github_url}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="mono text-xs font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {members.length < 5 && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          placeholder="Member Full Name"
                          value={newMember.name}
                          onChange={(e) => setNewMember((nm) => ({ ...nm, name: e.target.value }))}
                          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold"
                        />
                        <input
                          placeholder="Member USN (e.g. 1NC23CS002)"
                          value={newMember.usn}
                          onChange={(e) => setNewMember((nm) => ({ ...nm, usn: e.target.value.toUpperCase() }))}
                          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft/60 uppercase outline-none focus:border-marigold mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          placeholder="Member Email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember((nm) => ({ ...nm, email: e.target.value }))}
                          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold"
                        />
                        <input
                          placeholder="Member GitHub URL"
                          type="url"
                          value={newMember.github_url}
                          onChange={(e) => setNewMember((nm) => ({ ...nm, github_url: e.target.value }))}
                          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="mono w-full rounded-xl bg-paper-3 px-4 py-2.5 text-xs font-bold text-ink border border-line hover:border-marigold hover:text-marigold transition-all cursor-pointer"
                      >
                        + Add Team Member to Roster
                      </button>
                    </div>
                  )}
                </div>

                {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(0)} className="rounded-full px-6 text-xs font-bold mono">
                    ← Back to Step 1
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading} className="flex-1 rounded-full py-4 text-base font-bold mono justify-center shadow-lg shadow-marigold/30">
                    {loading ? 'Creating Team...' : 'Create Team & Complete Registration →'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-ink-soft">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-marigold hover:underline">
            Log in to your account
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
