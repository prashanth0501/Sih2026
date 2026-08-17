import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTeamMember, getMyTeam, removeTeamMember } from '@/api/teams';
import { Button } from '@/components/ui/Button';

const DEPARTMENTS = ['CSE', 'ISE', 'AI & ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech', 'BCA', 'MCA', 'MBA', 'Data Science'];
const MAX_MEMBERS = 6;

export function TeamMembers() {
  const queryClient = useQueryClient();
  const { data: team, isLoading, error } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam, retry: false });
  const [form, setForm] = useState({ name: '', email: '', usn: '', github_url: '', department: DEPARTMENTS[0], year: 2, role: 'member', gender: 'Male' });
  const [formError, setFormError] = useState('');

  const addMutation = useMutation({
    mutationFn: (input: typeof form) => addTeamMember(team!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      setForm({ name: '', email: '', usn: '', github_url: '', department: DEPARTMENTS[0], year: 2, role: 'member', gender: 'Male' });
    },
    onError: (e: any) => {
      const message = e?.response?.data?.detail || e?.message || 'Could not add that member.';
      setFormError(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (usn: string) => removeTeamMember(team!.id, usn),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-team'] }),
  });

  if (isLoading) return null;

  if (error || !team) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-[1.6rem] font-bold">Team members</h1>
        <p className="mt-3 text-ink-soft">
          You're not on a team yet. If you're meant to be a member, ask your team leader to add you — they'll
          need your name, USN, college email, department, and year. Otherwise, register a team of your own from
          the <a href="/register" className="text-marigold hover:underline">Register</a> page.
        </p>
      </div>
    );
  }

  const atCapacity = team.members.length >= MAX_MEMBERS;
  const canEdit = team.viewer_is_leader && !team.is_locked;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[1.6rem] font-bold">Team members</h1>
      <p className="mt-2 text-ink-soft">
        {team.viewer_is_leader
          ? `Only you, as team leader, can add or remove members. Up to 5 more — 6 total including you, per the official rule.`
          : "You're viewing this team as a member — the team leader is the only one who can add or remove people."}
      </p>

      {team.viewer_is_leader && team.is_locked && (
        <div className="mono mt-5 border border-dashed border-line bg-paper-2 p-4 text-[0.72rem] text-ink-soft">
          🔒 This team has been finalised by a coordinator — you have read-only access. No further changes can
          be made.
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {team.members.length === 0 && <p className="text-ink-soft">No teammates added yet.</p>}
        {team.members.map((m) => (
          <div key={m.email} className="flex items-center justify-between gap-4 border border-line bg-paper p-4">
            <div>
              <div className="font-medium">{m.name} <span className="mono text-[0.75rem] text-marigold font-bold">({m.usn || 'No USN'})</span></div>
              <div className="text-[0.8rem] text-ink-soft">
                {m.email} · {m.department} · Y{m.year}
              </div>
              {m.github_url && (
                <a href={m.github_url} target="_blank" rel="noopener noreferrer" className="mono text-[0.7rem] text-marigold hover:underline">
                  {m.github_url}
                </a>
              )}
            </div>
            {canEdit && (
              <button
                onClick={() => removeMutation.mutate(m.usn)}
                className="mono text-[0.68rem] text-red-700 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {!canEdit ? null : atCapacity ? (
        <p className="mono mt-6 text-[0.72rem] text-ink-soft">Team is at the maximum of 6 members.</p>
      ) : (
        <form
          className="mt-8 grid gap-4 border border-line bg-paper p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError('');
            if (!form.usn.trim()) {
              setFormError('Member USN is compulsory (e.g. 1NC22CS005).');
              return;
            }
            addMutation.mutate({ ...form, usn: form.usn.toUpperCase() });
          }}
        >
          <div className="mono text-[0.68rem] text-marigold">Add a teammate</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[0.8rem]">
              Full name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
              />
            </label>
            <label className="grid gap-1.5 text-[0.8rem]">
              College USN <span className="text-red-500 font-bold">*Compulsory</span>
              <input
                required
                value={form.usn}
                onChange={(e) => setForm((f) => ({ ...f, usn: e.target.value.toUpperCase() }))}
                placeholder="e.g. 1NC22CS005"
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold font-mono uppercase"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[0.8rem]">
              College email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
              />
            </label>
            <label className="grid gap-1.5 text-[0.8rem]">
              GitHub Profile URL *
              <input
                required
                type="url"
                value={form.github_url}
                onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold font-mono text-[0.85rem]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[0.8rem]">
              Department
              <select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
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
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
              >
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[0.8rem]">
              Gender
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          {formError && <p className="text-[0.82rem] text-red-700 font-medium">{formError}</p>}
          <Button type="submit" variant="primary" className="justify-self-start" disabled={addMutation.isPending}>
            Add teammate →
          </Button>
          <p className="text-[0.76rem] text-ink-soft">
            They can log in at <a href="/login" className="text-marigold hover:underline">/login</a> with this
            email and default password <code className="mono rounded bg-paper-3 px-1.5 py-0.5">tm@123</code>.
          </p>
        </form>
      )}
    </div>
  );
}
