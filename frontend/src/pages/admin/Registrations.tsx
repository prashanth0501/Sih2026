import { useMemo, useState } from 'react';
import { TEAMS, STATUS_LABEL, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';

const PAGE_SIZE = 25;
const STATUS_OPTIONS: Array<ScreeningStatus | 'all'> = [
  'all', 'registered', 'l1_submitted', 'l1_under_review', 'l1_cleared',
  'l1_rejected', 'l2_submitted', 'l2_under_review', 'selected', 'l2_rejected',
];

// Client-side filter/paginate is fine at this scale (~1,200 rows). Past a
// few thousand teams, swap this for server-side pagination against
// GET /teams?status=&q=&page= per ARCHITECTURE.md section 7.
export function Registrations() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ScreeningStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEAMS.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (!q) return true;
      return t.teamName.toLowerCase().includes(q) || t.leader.toLowerCase().includes(q) || t.theme.toLowerCase().includes(q);
    });
  }, [query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page_ = Math.min(page, totalPages);
  const rows = filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Registrations</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            {TEAMS.length.toLocaleString()} teams · {TEAMS.reduce((s, t) => s + t.members, 0).toLocaleString()} students
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search team, leader, theme…"
            className="w-64 border border-line bg-paper px-4 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ScreeningStatus | 'all');
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

      <div className="mt-6 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[820px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft">
              <th className="px-4 py-3 font-normal">Team</th>
              <th className="px-4 py-3 font-normal">Leader</th>
              <th className="px-4 py-3 font-normal">Dept / Year</th>
              <th className="px-4 py-3 font-normal">Theme</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">L1 / L2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 font-medium">{t.teamName}</td>
                <td className="px-4 py-3 text-ink-soft">{t.leader}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {t.department} · Y{t.year}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-ink-soft">{t.theme}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="mono px-4 py-3 text-right tabular-nums text-ink-soft">
                  {t.level1Score ?? '—'} / {t.level2Score ?? '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  No teams match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mono mt-4 flex items-center justify-between text-[0.72rem] text-ink-soft">
        <span>
          Page {page_} of {totalPages} · {filtered.length.toLocaleString()} results
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
