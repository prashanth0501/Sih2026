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
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
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
            className="w-64 border border-line bg-paper px-4 py-2.5 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ScreeningStatus | 'all');
              setPage(1);
            }}
            className="border border-line bg-paper px-3 py-2.5 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
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
      <div className="mt-6 overflow-x-auto border border-line bg-paper rounded-2xl shadow-xs">
        <table className="w-full min-w-[850px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider">
              <th className="px-4 py-3.5">Team Name</th>
              <th className="px-4 py-3.5">Problem ID</th>
              <th className="px-4 py-3.5">Members</th>
              <th className="px-4 py-3.5">Theme</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: ApiTeam) => (
              <tr
                key={t.id}
                onClick={() => openTeamModal(t)}
                className="border-b border-line last:border-0 hover:bg-paper-2 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-bold text-ink">
                  {t.name}
                </td>
                <td className="font-mono px-4 py-3.5 text-marigold font-bold text-[0.82rem]">
                  {t.problem_statement_id || '—'}
                </td>
                <td className="px-4 py-3.5 text-ink-soft font-medium">
                  {t.members?.length || 0} members
                </td>
                <td className="max-w-[200px] truncate px-4 py-3.5 text-ink-soft">{t.theme || 'Unassigned'}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={t.status as ScreeningStatus} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTeamModal(t);
                    }}
                    className="rounded-lg border border-line bg-paper-3 px-3 py-1.5 text-[0.75rem] font-semibold text-ink hover:border-marigold transition-colors"
                  >
                    View Details →
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
      <div className="mt-4 flex items-center justify-between text-[0.78rem] text-ink-soft">
        <span>
          Page {page_} of {totalPages} · {filtered.length.toLocaleString()} team records
        </span>
        <div className="flex gap-2">
          <button
            disabled={page_ <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-30 hover:border-marigold"
          >
            ← Prev
          </button>
          <button
            disabled={page_ >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-30 hover:border-marigold"
          >
            Next →
          </button>
        </div>
      </div>

      {/* MINIMALISTIC, PROFESSIONAL TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper-2">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold text-ink">{selectedTeam.name}</h2>
                <StatusBadge status={selectedTeam.status as ScreeningStatus} />
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-paper-3 transition-colors font-medium text-sm"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Admin Edit Mode Form */}
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
                  className="space-y-4 rounded-xl border border-marigold/40 bg-marigold/5 p-4"
                >
                  <div className="text-[0.75rem] font-bold text-marigold uppercase tracking-wider">
                    Edit Team Attributes
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[0.72rem] font-medium text-ink-soft block mb-1">Team Name</label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-marigold"
                      />
                    </div>
                    <div>
                      <label className="text-[0.72rem] font-medium text-ink-soft block mb-1">Problem Statement ID</label>
                      <input
                        value={editPsId}
                        onChange={(e) => setEditPsId(e.target.value)}
                        placeholder="e.g. SIH1450"
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-marigold"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[0.72rem] font-medium text-ink-soft block mb-1">Theme / Category</label>
                      <input
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        placeholder="e.g. Smart Automation"
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-marigold"
                      />
                    </div>
                    <div>
                      <label className="text-[0.72rem] font-medium text-ink-soft block mb-1">Screening Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-marigold"
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
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Overview Grid */
                <div className="rounded-xl border border-line bg-paper-2 p-4 grid gap-4 sm:grid-cols-3 text-[0.85rem]">
                  <div>
                    <span className="text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider block">Problem Statement ID</span>
                    <span className="font-mono text-base font-bold text-marigold mt-0.5 block">{selectedTeam.problem_statement_id || 'Not Selected'}</span>
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider block">Theme / Category</span>
                    <span className="font-medium text-ink mt-0.5 block">{selectedTeam.theme || 'Unassigned'}</span>
                  </div>
                  <div className="sm:text-right flex items-center justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-lg border border-line bg-paper px-3 py-1.5 text-[0.75rem] font-semibold text-ink hover:border-marigold transition-colors"
                    >
                      Edit Info ✏️
                    </button>
                  </div>
                </div>
              )}

              {/* Submissions Section */}
              <div>
                <h3 className="text-[0.75rem] font-bold text-ink-soft uppercase tracking-wider mb-3">Submissions &amp; Deliverables</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-[0.85rem]">
                  <div className="rounded-xl border border-line bg-paper p-4">
                    <div className="font-semibold text-ink">Level 1 PPT Submission</div>
                    {selectedTeam.level1?.submission_url ? (
                      <a
                        href={selectedTeam.level1.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1 font-semibold text-marigold hover:underline text-[0.8rem]"
                      >
                        View Presentation Deck ↗
                      </a>
                    ) : (
                      <span className="mt-2 block text-[0.8rem] text-ink-soft">No Level 1 PPT submitted yet</span>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-paper p-4">
                    <div className="font-semibold text-ink">Level 2 Prototype Submission</div>
                    {selectedTeam.level2?.submission_url ? (
                      <a
                        href={selectedTeam.level2.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1 font-semibold text-marigold hover:underline text-[0.8rem]"
                      >
                        View Prototype Demo ↗
                      </a>
                    ) : (
                      <span className="mt-2 block text-[0.8rem] text-ink-soft">No Level 2 demo submitted yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Members Roster */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[0.75rem] font-bold text-ink-soft uppercase tracking-wider">
                    Team Members Roster ({selectedTeam.members?.length || 0})
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-line bg-paper">
                  <table className="w-full min-w-[550px] border-collapse text-[0.82rem]">
                    <thead>
                      <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
                        <th className="px-3.5 py-2.5">Name</th>
                        <th className="px-3.5 py-2.5">Email</th>
                        <th className="px-3.5 py-2.5">Dept &amp; Year</th>
                        <th className="px-3.5 py-2.5 text-right">GitHub</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members?.map((m: ApiTeamMember, idx: number) => (
                        <tr key={idx} className="border-b border-line last:border-0 hover:bg-paper-2/60">
                          <td className="px-3.5 py-2.5 font-medium text-ink">
                            {m.name}{' '}
                            {m.role === 'leader' && (
                              <span className="inline-block rounded bg-marigold/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-marigold ml-1">
                                Leader
                              </span>
                            )}
                          </td>
                          <td className="font-mono px-3.5 py-2.5 text-ink-soft text-[0.8rem] lowercase">
                            {m.email || '—'}
                          </td>
                          <td className="px-3.5 py-2.5 text-ink-soft">
                            {m.department || 'CSE'} (Yr {m.year || 3})
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            {m.github_url ? (
                              <a
                                href={m.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-marigold hover:underline text-[0.78rem]"
                              >
                                GitHub ↗
                              </a>
                            ) : (
                              <span className="text-ink-soft">—</span>
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
            <div className="border-t border-line px-6 py-3.5 bg-paper-2 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setSelectedTeam(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
