import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, adminUpdateTeam, softDeleteTeam, type ApiTeam, type ApiTeamMember } from '@/api/teams';
import { STATUS_LABEL, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { generateTeamsPdfReport } from '@/utils/pdfExport';
import { useAuth, isSuperAdmin } from '@/lib/auth';

const PAGE_SIZE = 25;
const STATUS_OPTIONS: Array<ScreeningStatus | 'all'> = [
  'all', 'registered', 'l1_submitted', 'l1_cleared',
  'l1_rejected', 'l2_submitted', 'selected', 'l2_rejected',
];

export function Registrations() {
  const { user } = useAuth();
  const superAdmin = isSuperAdmin(user);

  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScreeningStatus | 'all'>('all');
  const [integrityFilter, setIntegrityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSoftDeleting, setIsSoftDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editPsId, setEditPsId] = useState('');
  const [editStatus, setEditStatus] = useState<string>('registered');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['all-teams-registrations'],
    queryFn: () => listAllTeams({ page_size: 1000 }),
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

  const deleteMutation = useMutation({
    mutationFn: (input: { id: string; reason: string }) => softDeleteTeam(input.id, input.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-teams-registrations'] });
      setSelectedTeam(null);
      setIsSoftDeleting(false);
      setDeleteReason('');
    },
  });

  // Calculate member registration counts
  const totalTeamsCount = teams.length;
  const totalStudentsCount = teams.reduce((s, t) => s + (t.members?.length || 0), 0);
  const registeredStudentsCount = teams.reduce((s, t) => s + (t.data_integrity?.registered_members_count || 0), 0);
  const pendingStudentsCount = teams.reduce((s, t) => s + (t.data_integrity?.pending_members_count || 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      if (integrityFilter !== 'all') {
        const flags = t.data_integrity?.flags || ['VALID'];
        if (integrityFilter === 'valid' && !t.data_integrity?.is_valid) return false;
        if (integrityFilter === 'issues' && t.data_integrity?.is_valid) return false;
        if (integrityFilter === 'duplicate' && !flags.includes('DUPLICATE')) return false;
        if (integrityFilter === 'pending' && (t.data_integrity?.pending_members_count || 0) === 0) return false;
        if (integrityFilter === 'test' && !flags.includes('TEST RECORD')) return false;
      }

      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.theme && t.theme.toLowerCase().includes(q)) ||
        (t.problem_statement_id && t.problem_statement_id.toLowerCase().includes(q)) ||
        t.leader_usn?.toLowerCase().includes(q) ||
        t.members?.some((m) => m.name.toLowerCase().includes(q) || (m.email && m.email.toLowerCase().includes(q)) || m.usn.toLowerCase().includes(q))
      );
    });
  }, [teams, query, statusFilter, integrityFilter]);

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
    setIsSoftDeleting(false);
  };

  const handleExportPdf = (mode: 'all' | 'filtered') => {
    const listToExport = mode === 'filtered' ? filtered : teams;
    const filterName = mode === 'filtered' ? `Filtered (${filtered.length} Teams)` : 'All Records (Everything Included)';
    generateTeamsPdfReport(listToExport, {
      title: `SIH 2026 Portal — Teams PDF Export (${mode})`,
      filterName,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Team Registrations &amp; Roster</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            {isLoading
              ? 'Loading dynamic database records...'
              : `${totalTeamsCount} teams registered · ${totalStudentsCount} total students (${registeredStudentsCount} registered accounts, ${pendingStudentsCount} pending registration)`}
          </p>
        </div>

        {/* PDF Export Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExportPdf('all')}>
            📄 Export All PDF ({teams.length})
          </Button>
          <Button variant="primary" onClick={() => handleExportPdf('filtered')}>
            📊 Export Filtered PDF ({filtered.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-5 flex flex-wrap gap-2.5 items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search team name, leader USN, PS ID, member USN…"
          className="w-72 border border-line bg-paper px-4 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ScreeningStatus | 'all');
            setPage(1);
          }}
          className="border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          value={integrityFilter}
          onChange={(e) => {
            setIntegrityFilter(e.target.value);
            setPage(1);
          }}
          className="border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-xl outline-none focus-visible:border-marigold font-medium"
        >
          <option value="all">All Integrity Statuses</option>
          <option value="valid">Valid Teams Only</option>
          <option value="issues">Has Integrity Flags</option>
          <option value="duplicate">Duplicates Only</option>
          <option value="pending">Has Pending Registrations</option>
          <option value="test">Test Records Only</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="mt-5 overflow-x-auto border border-line bg-paper rounded-2xl shadow-xs">
        <table className="w-full min-w-[950px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
              <th className="px-4 py-3.5">Team Name</th>
              <th className="px-4 py-3.5">Leader USN</th>
              <th className="px-4 py-3.5">Problem ID</th>
              <th className="px-4 py-3.5">Members</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Data Integrity Flags</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: ApiTeam) => {
              const flags = t.data_integrity?.flags || ['VALID'];
              return (
                <tr
                  key={t.id}
                  onClick={() => openTeamModal(t)}
                  className="border-b border-line last:border-0 hover:bg-paper-2 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-ink">
                    {t.name}
                  </td>
                  <td className="font-mono px-4 py-3.5 text-ink-soft text-[0.82rem]">
                    {t.leader_usn}
                  </td>
                  <td className="font-mono px-4 py-3.5 text-marigold font-bold text-[0.82rem]">
                    {t.problem_statement_id || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft font-medium">
                    {t.members?.length || 0} members
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={t.status as ScreeningStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {flags.map((f, fIdx) => {
                        let badgeStyle = 'border-emerald-600/30 bg-emerald-50 text-emerald-800';
                        if (f === 'DUPLICATE') badgeStyle = 'border-amber-600/30 bg-amber-50 text-amber-900';
                        if (f === 'TEST RECORD') badgeStyle = 'border-purple-600/30 bg-purple-50 text-purple-900';
                        if (f === 'INCOMPLETE' || f === 'NO FEMALE MEMBER') badgeStyle = 'border-red-600/30 bg-red-50 text-red-900';
                        if (f === 'SPACED USN') badgeStyle = 'border-yellow-600/30 bg-yellow-50 text-yellow-900';

                        return (
                          <span key={fIdx} className={`inline-block border px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase tracking-wide ${badgeStyle}`}>
                            {f}
                          </span>
                        );
                      })}
                    </div>
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
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-soft">
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

      {/* TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
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
              {/* DATA INTEGRITY FINDINGS BANNER */}
              <div className="rounded-xl border border-line bg-paper-2 p-4 text-[0.82rem]">
                <div className="text-[0.7rem] font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Data Integrity Classification &amp; Member Status</span>
                  <div className="flex gap-1">
                    {(selectedTeam.data_integrity?.flags || ['VALID']).map((f, idx) => (
                      <span key={idx} className="inline-block border border-ink/30 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase bg-paper text-ink">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-2 text-[0.8rem] font-medium text-ink">
                  Roster Breakdown: <strong>{selectedTeam.data_integrity?.registered_members_count || 0}</strong> registered accounts · <strong>{selectedTeam.data_integrity?.pending_members_count || 0}</strong> pending registration
                </div>

                {selectedTeam.data_integrity?.findings && selectedTeam.data_integrity.findings.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-ink text-[0.8rem]">
                    {selectedTeam.data_integrity.findings.map((finding, idx) => (
                      <li key={idx} className="text-amber-900 font-medium">{finding}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-800 font-medium">✓ No data integrity issues found. All team rules are valid.</p>
                )}
              </div>

              {/* Admin Edit Mode Form (Super Admin Only) */}
              {isEditing && superAdmin ? (
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
                    Edit Team Attributes (Super Admin Only)
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
                        className="w-full border border-line bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-marigold font-mono"
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
              ) : isSoftDeleting && superAdmin ? (
                <div className="space-y-4 rounded-xl border border-red-300 bg-red-50 p-4">
                  <div className="text-[0.75rem] font-bold text-red-800 uppercase tracking-wider">
                    Soft Delete Team (Super Admin Only — Preserves Data)
                  </div>
                  <p className="text-[0.8rem] text-red-700">
                    This will move team <strong>{selectedTeam.name}</strong> to the soft-delete archive. Data is fully preserved and can be restored anytime by a Super Administrator.
                  </p>
                  <div>
                    <label className="text-[0.72rem] font-medium text-red-900 block mb-1">Reason for Soft Delete</label>
                    <input
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="e.g. Duplicate team registration created by mistake"
                      className="w-full border border-red-300 bg-paper px-3 py-2 text-[0.85rem] rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsSoftDeleting(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      className="bg-red-700 hover:bg-red-800 text-white"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ id: selectedTeam.id, reason: deleteReason })}
                    >
                      {deleteMutation.isPending ? 'Archiving...' : 'Confirm Soft Delete'}
                    </Button>
                  </div>
                </div>
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
                  {superAdmin && (
                    <div className="sm:text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg border border-line bg-paper px-3 py-1.5 text-[0.75rem] font-semibold text-ink hover:border-marigold transition-colors"
                      >
                        Edit Info ✏️
                      </button>
                      <button
                        onClick={() => setIsSoftDeleting(true)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[0.75rem] font-semibold text-red-800 hover:bg-red-100 transition-colors"
                      >
                        Soft Delete 🗑️
                      </button>
                    </div>
                  )}
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
                  <table className="w-full min-w-[600px] border-collapse text-[0.82rem]">
                    <thead>
                      <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
                        <th className="px-3.5 py-2.5">Name</th>
                        <th className="px-3.5 py-2.5">USN</th>
                        <th className="px-3.5 py-2.5">Email</th>
                        <th className="px-3.5 py-2.5">Dept &amp; Year</th>
                        <th className="px-3.5 py-2.5">Portal Registration Status</th>
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
                          <td className="font-mono px-3.5 py-2.5 text-ink text-[0.8rem]">
                            {m.usn}
                          </td>
                          <td className="font-mono px-3.5 py-2.5 text-ink-soft text-[0.8rem] lowercase">
                            {m.email || '—'}
                          </td>
                          <td className="px-3.5 py-2.5 text-ink-soft">
                            {m.department || 'CSE'} (Yr {m.year || 3})
                          </td>
                          <td className="px-3.5 py-2.5">
                            {m.is_registered_user ? (
                              <span className="inline-block border border-emerald-600/30 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                                REGISTERED USER
                              </span>
                            ) : (
                              <span className="inline-block border border-amber-600/30 bg-amber-50 text-amber-800 px-1.5 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                                PENDING REGISTRATION
                              </span>
                            )}
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
