import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyTeam, createTeam, type ApiTeamMember } from '@/api/teams';
import { STATUS_LABEL, STATUS_STAGE, PROBLEM_THEMES, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const STAGES = ['Concept', 'Level 1', 'Level 2', 'Finale'];
const DEPARTMENTS = ['CSE', 'ISE', 'AI & ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech', 'BCA', 'MCA', 'MBA', 'Data Science'];

export function DashboardHome() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    retry: false,
  });

  // Standalone Team Creation Form state for users without a team
  const [teamName, setTeamName] = useState('');
  const [theme, setTheme] = useState('');
  const [leaderUsn, setLeaderUsn] = useState(user?.usn || '');
  const [leaderGithub, setLeaderGithub] = useState(user?.github_url || '');
  const [formError, setFormError] = useState('');
  const [members, setMembers] = useState<ApiTeamMember[]>([]);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    usn: '',
    department: DEPARTMENTS[0],
    year: 3,
    gender: 'Male',
    github_url: '',
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createTeam({
        name: teamName.trim(),
        theme,
        leader_usn: leaderUsn.trim().toUpperCase(),
        leader_github_url: leaderGithub.trim(),
        members,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create team. Please try again.';
      setFormError(msg);
    },
  });

  function handleAddMember() {
    if (!newMember.name || !newMember.usn) {
      setFormError('Member Name and USN are required.');
      return;
    }
    setFormError('');
    setMembers((m) => [...m, { ...newMember, role: 'member', usn: newMember.usn.trim().toUpperCase() }]);
    setNewMember({
      name: '',
      email: '',
      usn: '',
      department: DEPARTMENTS[0],
      year: 3,
      gender: 'Male',
      github_url: '',
    });
  }

  if (isLoading) return null;

  // Embedded Team Creation Form for Orphaned Accounts / Users without a team
  if (error || !team) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-[1.6rem] font-bold">Welcome to Your Portal Dashboard</h1>
        <p className="mt-2 text-ink-soft text-[0.9rem]">
          Your user account is active, but your team setup is incomplete. Complete the form below to register your team and unlock your submission dashboard.
        </p>

        <form
          className="mt-6 border-2 border-line bg-paper p-6 sm:p-8 rounded-2xl space-y-6 shadow-md"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError('');
            if (!teamName.trim()) {
              setFormError('Team name is required.');
              return;
            }
            if (!theme) {
              setFormError('Please select a problem theme.');
              return;
            }
            if (!leaderUsn.trim()) {
              setFormError('Leader USN is required.');
              return;
            }
            createMutation.mutate();
          }}
        >
          <div className="border-b border-line pb-3">
            <h2 className="font-display text-lg font-bold text-ink">Register Your Team Details</h2>
            <p className="text-[0.75rem] text-ink-soft">Leader: {user?.name} ({user?.email})</p>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-[0.8rem] text-red-800 font-medium">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[0.75rem] font-semibold text-ink-soft block mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Quantum Coders"
                className="w-full border border-line bg-paper-2 px-3.5 py-2.5 text-[0.85rem] rounded-xl outline-none focus:border-marigold"
              />
            </div>

            <div>
              <label className="text-[0.75rem] font-semibold text-ink-soft block mb-1">
                Problem Theme <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full border border-line bg-paper-2 px-3.5 py-2.5 text-[0.85rem] rounded-xl outline-none focus:border-marigold"
              >
                <option value="">Select a theme...</option>
                {PROBLEM_THEMES.map((t: any) => {
                  const themeName = typeof t === 'string' ? t : t.name;
                  return (
                    <option key={themeName} value={themeName}>
                      {themeName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[0.75rem] font-semibold text-ink-soft block mb-1">
                Leader USN <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={leaderUsn}
                onChange={(e) => setLeaderUsn(e.target.value.toUpperCase())}
                placeholder="e.g. 1NC24CS099"
                className="w-full border border-line bg-paper-2 px-3.5 py-2.5 text-[0.85rem] rounded-xl outline-none focus:border-marigold font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-[0.75rem] font-semibold text-ink-soft block mb-1">Leader GitHub URL</label>
              <input
                value={leaderGithub}
                onChange={(e) => setLeaderGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full border border-line bg-paper-2 px-3.5 py-2.5 text-[0.85rem] rounded-xl outline-none focus:border-marigold font-mono text-[0.8rem]"
              />
            </div>
          </div>

          {/* Members addition block */}
          <div className="border-t border-line pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] font-bold text-ink-soft uppercase tracking-wider">
                Additional Team Members ({members.length} added)
              </span>
              <span className="text-[0.7rem] text-ink-soft">Up to 5 additional members</span>
            </div>

            {members.length > 0 && (
              <div className="space-y-2">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-line bg-paper-2 p-2.5 rounded-lg text-[0.8rem]">
                    <div>
                      <span className="font-bold">{m.name}</span> <code className="font-mono text-marigold font-bold ml-1">({m.usn})</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMembers((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-700 font-bold text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {members.length < 5 && (
              <div className="grid gap-3 sm:grid-cols-3 border border-line bg-paper-2 p-3 rounded-xl">
                <input
                  value={newMember.name}
                  onChange={(e) => setNewMember((nm) => ({ ...nm, name: e.target.value }))}
                  placeholder="Member Name"
                  className="border border-line bg-paper px-2.5 py-1.5 text-[0.8rem] rounded-lg outline-none focus:border-marigold"
                />
                <input
                  value={newMember.usn}
                  onChange={(e) => setNewMember((nm) => ({ ...nm, usn: e.target.value.toUpperCase() }))}
                  placeholder="USN (e.g. 1NC24CS102)"
                  className="border border-line bg-paper px-2.5 py-1.5 text-[0.8rem] rounded-lg outline-none focus:border-marigold font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="rounded-lg border border-marigold/40 bg-marigold/10 text-marigold px-3 py-1.5 text-[0.78rem] font-bold hover:bg-marigold/20"
                >
                  + Add Member
                </button>
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" disabled={createMutation.isPending} className="w-full py-3">
            {createMutation.isPending ? 'Creating Team...' : 'Create Team & Finish Registration →'}
          </Button>
        </form>
      </div>
    );
  }

  const status = team.status as ScreeningStatus;
  const currentStage = STATUS_STAGE[status];

  return (
    <div className="max-w-3xl">
      <div className="mono mb-2 flex items-center gap-2 text-[0.68rem] text-marigold">
        {team.viewer_is_leader ? 'Your team' : 'Your team · viewing as member (read-only)'}
      </div>
      <h1 className="font-display text-[1.8rem] font-bold">{team.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />
        {team.theme && <span className="text-[0.85rem] text-ink-soft">{team.theme}</span>}
        {team.is_locked && (
          <span className="mono rounded-full bg-red-700/10 px-3 py-1 text-[0.62rem] text-red-700">Finalised</span>
        )}
      </div>

      <div className="mt-10 grid grid-cols-4 gap-2">
        {STAGES.map((label, i) => (
          <div key={label}>
            <div className={cn('h-1.5 rounded-full', i <= currentStage ? 'bg-spark' : 'bg-line')} />
            <div className={cn('mono mt-2 text-[0.62rem]', i <= currentStage ? 'text-ink' : 'text-ink-soft/60')}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Level 1 score</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{team.level1.score ?? '—'}</div>
          {team.level1.feedback && <p className="mt-2 text-[0.82rem] text-ink-soft">{team.level1.feedback}</p>}
        </div>
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Level 2 score</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{team.level2.score ?? '—'}</div>
          {team.level2.feedback && <p className="mt-2 text-[0.82rem] text-ink-soft">{team.level2.feedback}</p>}
        </div>
      </div>

      <div className="mt-10 border border-line bg-paper p-5">
        <div className="mono text-[0.62rem] text-ink-soft">Current status</div>
        <p className="mt-2 text-ink-soft">
          Your team is at <strong className="text-ink">{STATUS_LABEL[status]}</strong>. Check the Submissions
          tab for what's due next, or Announcements for anything coordinators have posted.
        </p>
      </div>
    </div>
  );
}
