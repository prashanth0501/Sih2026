import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, adminUpdateTeam, type ApiTeam, type ApiTeamMember } from '@/api/teams';
import { STATUS_LABEL, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 25;
const STATUS_OPTIONS: Array<ScreeningStatus | 'all'> = [
  'all', 'registered', 'l1_submitted', 'l1_cleared',
  'l1_rejected', 'l2_submitted', 'selected', 'l2_rejected',
];

export function Registrations() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScreeningStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editPsId, setEditPsId] = useState('');
  const [editStatus, setEditStatus] = useState<string>('registered');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['all-teams-registrations'],
    queryFn: () => listAllTeams({ page_size: 500 }),
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name: string; theme: string; problem_statement_id: string; status: string }) =>
      adminUpdateTeam(input.id, {
        name: input.name,
        theme: input.theme,
        problem_statement_id: input.problem_statement_id,
        status: input.status,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['all-teams-registrations'] });
      setSelectedTeam(updated);
      setIsEditing(false);
    },
  });

  // Calculate total metrics
  const totalTeamsCount = teams.length;
  const totalStudentsCount = teams.reduce((s, t) => s + (t.members?.length || 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      // Status dropdown filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Search text query
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.theme && t.theme.toLowerCase().includes(q)) ||
        (t.problem_statement_id && t.problem_statement_id.toLowerCase().includes(q)) ||
        t.members?.some((m) => m.name.toLowerCase().includes(q) || (m.email && m.email.toLowerCase().includes(q)))
      );
    });
  }, [teams, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page_ = Math.min(page, totalPages);
  const rows = filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE);

  const openTeamModal = (t: ApiTeam) => {
    setSelectedTeam(t);
    setEditName(t.name);
    setEditTheme(t.theme || '');
    setEditPsId(t.problem_statement_id || '');
    setEditStatus(t.status);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Team Registrations</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            {isLoading ? 'Loading dynamic database records...' : `${totalTeamsCount} teams registered · ${totalStudentsCount} students total`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search team name, PS ID, members…"
            className="w-64 border border-line bg-paper px-4 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ScreeningStatus | 'all');
              setPage(1);
            }}
            className="border border-line bg-paper px-3 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-6 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[850px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft uppercase">
              <th className="px-4 py-3 font-normal">Team Name</th>
              <th className="px-4 py-3 font-normal">Problem ID</th>
              <th className="px-4 py-3 font-normal">Members</th>
              <th className="px-4 py-3 font-normal">Theme</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: ApiTeam) => (
              <tr
                key={t.id}
                onClick={() => openTeamModal(t)}
                className="border-b border-line last:border-0 hover:bg-paper-2 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-bold text-ink">
                  {t.name}
                </td>
                <td className="mono px-4 py-3 text-marigold font-bold">
                  {t.problem_statement_id || '—'}
                </td>
                <td className="mono px-4 py-3 text-ink-soft">
                  {t.members?.length || 0} members
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-ink-soft">{t.theme || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status as ScreeningStatus} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTeamModal(t);
                    }}
                    className="mono rounded border border-line bg-paper-3 px-3 py-1 text-[0.72rem] font-bold text-ink hover:border-marigold"
                  >
                    View / Edit →
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-soft">
                  {isLoading ? 'Loading records from backend...' : 'No registered teams match your selected filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mono mt-4 flex items-center justify-between text-[0.72rem] text-ink-soft">
        <span>
          Page {page_} of {totalPages} · {filtered.length.toLocaleString()} dynamic results
        </span>
        <div className="flex gap-2">
          <button
            disabled={page_ <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-sm border border-line px-3 py-1.5 disabled:opacity-30"
          >
            ← Prev
          </button>
          <button
            disabled={page_ >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-sm border border-line px-3 py-1.5 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      {/* INTERACTIVE TEAM DETAILS & ADMIN EDIT MODAL */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-lg border border-line bg-paper p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="mono text-[0.65rem] font-bold text-marigold uppercase tracking-wider">
                  Team Registration Details &amp; Control
                </span>
                <h2 className="font-display text-2xl font-bold mt-1">{selectedTeam.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex h-8 w-8 items-center justify-center rounded border border-line text-ink hover:bg-paper-3 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-6 overflow-y-auto pr-2 flex-1">
              {/* Quick Status Bar */}
              <div className="flex items-center justify-between gap-3 rounded border border-line bg-paper-2 p-3">
                <div className="flex items-center gap-3">
                  <span className="mono text-[0.75rem] text-ink-soft">Status:</span>
                  <StatusBadge status={selectedTeam.status as ScreeningStatus} />
                </div>
              </div>

              {/* Admin Edit Toggle */}
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMutation.mutate({
                      id: selectedTeam.id,
                      name: editName,
                      theme: editTheme,
                      problem_statement_id: editPsId,
                      status: editStatus,
                    });
                  }}
                  className="space-y-4 border border-marigold/40 bg-marigold/5 p-4 rounded"
                >
                  <div className="mono text-[0.75rem] font-bold text-marigold uppercase">
                    Admin Edit Team Info
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mono text-[0.68rem] text-ink-soft uppercase block mb-1">Team Name</label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus-visible:border-marigold"
                      />
                    </div>
                    <div>
                      <label className="mono text-[0.68rem] text-ink-soft uppercase block mb-1">Problem Statement ID</label>
                      <input
                        value={editPsId}
                        onChange={(e) => setEditPsId(e.target.value)}
                        placeholder="e.g. SIH1450"
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus-visible:border-marigold"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mono text-[0.68rem] text-ink-soft uppercase block mb-1">Theme / Category</label>
                      <input
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        placeholder="e.g. Smart Automation"
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus-visible:border-marigold"
                      />
                    </div>
                    <div>
                      <label className="mono text-[0.68rem] text-ink-soft uppercase block mb-1">Screening Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus-visible:border-marigold"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s as ScreeningStatus]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes →'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3 border border-line bg-paper p-4 text-[0.85rem]">
                  <div>
                    <div className="mono text-[0.65rem] text-ink-soft uppercase">Problem Statement ID</div>
                    <div className="font-bold text-marigold mt-0.5">{selectedTeam.problem_statement_id || 'Not Selected'}</div>
                  </div>
                  <div>
                    <div className="mono text-[0.65rem] text-ink-soft uppercase">Theme / Category</div>
                    <div className="font-medium text-ink mt-0.5">{selectedTeam.theme || 'Unassigned'}</div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mono rounded border border-line bg-paper-3 px-3 py-1.5 text-[0.75rem] font-bold text-ink hover:border-marigold"
                    >
                      Edit Team Info ✎
                    </button>
                  </div>
                </div>
              )}

              {/* Submissions Section */}
              <div className="border border-line bg-paper p-4">
                <div className="mono text-[0.72rem] font-bold uppercase tracking-wider text-ink-soft mb-3">
                  Presentation Deck &amp; Demo Submissions
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-[0.82rem]">
                  <div className="border border-line bg-paper-2 p-3">
                    <div className="font-bold">Level 1 PPT Submission</div>
                    {selectedTeam.level1?.submission_url ? (
                      <a
                        href={selectedTeam.level1.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono mt-2 inline-block font-bold text-marigold hover:underline"
                      >
                        Open Level 1 PPT Link ↗
                      </a>
                    ) : (
                      <div className="mono mt-2 text-ink-soft">No PPT submitted yet.</div>
                    )}
                  </div>

                  <div className="border border-line bg-paper-2 p-3">
                    <div className="font-bold">Level 2 Prototype Submission</div>
                    {selectedTeam.level2?.submission_url ? (
                      <a
                        href={selectedTeam.level2.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono mt-2 inline-block font-bold text-marigold hover:underline"
                      >
                        Open Level 2 Demo Link ↗
                      </a>
                    ) : (
                      <div className="mono mt-2 text-ink-soft">No Level 2 demo submitted yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Roster Details */}
              <div className="border border-line bg-paper p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="mono text-[0.72rem] font-bold uppercase tracking-wider text-ink-soft">
                    Team Members Roster ({selectedTeam.members?.length || 0} Total)
                  </div>
                </div>

                <div className="overflow-x-auto border border-line bg-paper">
                  <table className="w-full min-w-[580px] border-collapse text-[0.82rem]">
                    <thead>
                      <tr className="mono border-b border-line text-left text-[0.6rem] text-ink-soft uppercase">
                        <th className="px-3 py-2 font-normal">Member Name</th>
                        <th className="px-3 py-2 font-normal">Email</th>
                        <th className="px-3 py-2 font-normal">Department &amp; Year</th>
                        <th className="px-3 py-2 font-normal">GitHub Profile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members?.map((m: ApiTeamMember, idx: number) => (
                        <tr key={idx} className="border-b border-line last:border-0 hover:bg-paper-2">
                          <td className="px-3 py-2 font-medium">
                            {m.name} {m.role === 'leader' && <span className="mono text-[0.65rem] text-marigold font-bold ml-1">(Leader)</span>}
                          </td>
                          <td className="mono px-3 py-2 text-ink-soft">{m.email || '—'}</td>
                          <td className="px-3 py-2 text-ink-soft">{m.department || 'CSE'} (Yr {m.year || 3})</td>
                          <td className="px-3 py-2">
                            {m.github_url ? (
                              <a
                                href={m.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mono text-marigold hover:underline font-bold"
                              >
                                GitHub ↗
                              </a>
                            ) : (
                              <span className="mono text-ink-soft">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 border-t border-line pt-4 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setSelectedTeam(null)}>
                Close Modal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
