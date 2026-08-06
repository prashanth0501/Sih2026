import { Link } from 'react-router-dom';
import { ADMIN_STATS } from '@/lib/data';

const STAGE_LABELS = ['Registered', 'Cleared L1', 'Cleared L2', 'Selected'];

export function AdminHome() {
  const max = ADMIN_STATS.byStage[0] || 1;
  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Funnel overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Total teams</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{ADMIN_STATS.totalTeams.toLocaleString()}</div>
        </div>
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Total students</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{ADMIN_STATS.totalStudents.toLocaleString()}</div>
        </div>
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Selected for SIH</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{ADMIN_STATS.selected}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        {ADMIN_STATS.byStage.map((count, i) => (
          <div key={STAGE_LABELS[i]} className="flex items-center gap-4">
            <div className="w-28 shrink-0 text-[0.8rem] text-ink-soft">{STAGE_LABELS[i]}</div>
            <div className="h-8 flex-1 border border-line bg-paper">
              <div
                className="h-full bg-gradient-to-r from-marigold to-spark"
                style={{ width: `${Math.max((count / max) * 100, 3)}%` }}
              />
            </div>
            <div className="mono w-12 text-right tabular-nums">{count}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/registrations" className="mono rounded-sm border border-line px-4 py-2.5 text-[0.72rem] hover:border-marigold hover:text-marigold">
          View all registrations →
        </Link>
        <Link to="/admin/screening" className="mono rounded-sm border border-line px-4 py-2.5 text-[0.72rem] hover:border-marigold hover:text-marigold">
          Open screening console →
        </Link>
      </div>
    </div>
  );
}
