import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAllTeams, type ApiTeam } from '@/api/teams';
import { STATUS_LABEL, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';

const PAGE_SIZE = 25;
const STATUS_OPTIONS: Array<ScreeningStatus | 'all'> = [
  'all', 'registered', 'l1_submitted', 'l1_under_review', 'l1_cleared',
  'l1_rejected', 'l2_submitted', 'l2_under_review', 'selected', 'l2_rejected',
];

export function Registrations() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScreeningStatus | 'all'>('all');
  const [includedFilter, setIncludedFilter] = useState<'all' | 'included' | 'not_included'>('all');
  const [page, setPage] = useState(1);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['all-teams-registrations'],
    queryFn: () => listAllTeams({ page_size: 200 }),
    refetchInterval: 5000,
  });

  // Calculate dynamic metrics
  const totalTeamsCount = teams.length;
  const totalStudentsCount = teams.reduce((s, t) => s + (t.members?.length || 0) + 1, 0);

  const includedTeamsCount = teams.filter(
    (t) => t.status === 'l1_cleared' || t.status === 'l2_submitted' || t.status === 'l2_under_review' || t.status === 'selected'
  ).length;

  const notIncludedTeamsCount = teams.filter(
    (t) => t.status === 'registered' || t.status === 'l1_submitted' || t.status === 'l1_under_review' || t.status === 'l1_rejected' || t.status === 'l2_rejected'
  ).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      // Status dropdown filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Included vs Not Included tab filter
      const isIncluded = ['l1_cleared', 'l2_submitted', 'l2_under_review', 'selected'].includes(t.status);
      if (includedFilter === 'included' && !isIncluded) return false;
      if (includedFilter === 'not_included' && isIncluded) return false;

      // Search text query
      if (!q) return true;
      const leaderName = t.members?.[0]?.name || '';
      return (
        t.name.toLowerCase().includes(q) ||
        (t.theme && t.theme.toLowerCase().includes(q)) ||
        leaderName.toLowerCase().includes(q)
      );
    });
  }, [teams, query, statusFilter, includedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page_ = Math.min(page, totalPages);
  const rows = filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Team Registrations</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            {isLoading ? 'Loading dynamic database records...' : `${totalTeamsCount} teams · ${totalStudentsCount} students total`}
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
            placeholder="Search team name, theme…"
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

      {/* Dynamic Included vs Not Included Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-line pb-3 text-[0.82rem] mono">
        <button
          onClick={() => { setIncludedFilter('all'); setPage(1); }}
          className={`px-3 py-1.5 rounded transition-colors ${includedFilter === 'all' ? 'bg-paper-3 font-bold border border-line text-ink' : 'text-ink-soft hover:text-ink'}`}
        >
          All Registrations ({totalTeamsCount})
        </button>
        <button
          onClick={() => { setIncludedFilter('included'); setPage(1); }}
          className={`px-3 py-1.5 rounded transition-colors ${includedFilter === 'included' ? 'bg-green-700/20 text-green-700 font-bold border border-green-700/40' : 'text-ink-soft hover:text-green-700'}`}
        >
          ✓ Included / Cleared ({includedTeamsCount})
        </button>
        <button
          onClick={() => { setIncludedFilter('not_included'); setPage(1); }}
          className={`px-3 py-1.5 rounded transition-colors ${includedFilter === 'not_included' ? 'bg-red-700/20 text-red-700 font-bold border border-red-700/40' : 'text-ink-soft hover:text-red-700'}`}
        >
          ✕ Not Included / Pending ({notIncludedTeamsCount})
        </button>
      </div>

      {/* Data Table */}
      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[820px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft">
              <th className="px-4 py-3 font-normal">Team Name</th>
              <th className="px-4 py-3 font-normal">Members</th>
              <th className="px-4 py-3 font-normal">Theme</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">L1 Score / L2 Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: ApiTeam) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="mono px-4 py-3 text-ink-soft">
                  {(t.members?.length || 0) + 1} members
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-ink-soft">{t.theme || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status as ScreeningStatus} />
                </td>
                <td className="mono px-4 py-3 text-right tabular-nums text-ink-soft">
                  {t.level1?.score ?? '—'} / {t.level2?.score ?? '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  {isLoading ? 'Loading records from backend...' : 'No teams match your selected filters.'}
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
    </div>
  );
}
