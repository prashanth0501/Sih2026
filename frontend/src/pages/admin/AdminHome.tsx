import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/api/stats';
import { listAllTeams } from '@/api/teams';

export function AdminHome() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 5000,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['all-teams-overview'],
    queryFn: () => listAllTeams({ page_size: 200 }),
    refetchInterval: 5000,
  });

  const isLoading = statsLoading || teamsLoading;

  // Dynamic calculations for Included vs Not Included
  const totalTeams = stats?.total_teams ?? teams?.length ?? 0;
  const totalStudents = stats?.total_students ?? teams?.reduce((acc, t) => acc + (t.members?.length || 0) + 1, 0) ?? 0;

  const includedTeams = teams?.filter(
    (t) => t.status === 'l1_cleared' || t.status === 'l2_submitted' || t.status === 'l2_under_review' || t.status === 'selected'
  ) || [];

  const notIncludedTeams = teams?.filter(
    (t) => t.status === 'registered' || t.status === 'l1_submitted' || t.status === 'l1_under_review' || t.status === 'l1_rejected' || t.status === 'l2_rejected'
  ) || [];

  const stageCounts = [
    { label: 'Registered', count: stats?.by_stage?.registered ?? 0 },
    { label: 'Level 1 Processed', count: stats?.by_stage?.level1 ?? 0 },
    { label: 'Level 2 Processed', count: stats?.by_stage?.level2 ?? 0 },
    { label: 'Selected for SIH', count: stats?.selected ?? 0 },
  ];

  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Funnel & Dynamic Status Overview</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">Live real-time team statistics from MongoDB Atlas</p>
        </div>
        <span className="mono rounded bg-paper-3 px-3 py-1 text-[0.7rem] text-marigold border border-line">
          {isLoading ? 'Refreshing...' : '● Live Database'}
        </span>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Teams</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalTeams}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Registered teams</div>
        </div>

        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Students</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalStudents}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Leaders & members</div>
        </div>

        <div className="border border-green-800/30 bg-green-950/10 p-5">
          <div className="mono text-[0.62rem] text-green-600 font-bold uppercase tracking-wider">Included / Cleared</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums text-green-700">{includedTeams.length}</div>
          <div className="mt-1 text-[0.72rem] text-green-600/80">Passed screening rounds</div>
        </div>

        <div className="border border-red-800/30 bg-red-950/10 p-5">
          <div className="mono text-[0.62rem] text-red-600 font-bold uppercase tracking-wider">Not Included / Pending</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums text-red-700">{notIncludedTeams.length}</div>
          <div className="mt-1 text-[0.72rem] text-red-600/80">Pending or rejected</div>
        </div>
      </div>

      {/* Stage Breakdown Funnel Bars */}
      <div className="mt-8 border border-line bg-paper p-6">
        <h2 className="font-display text-[1.15rem] font-bold mb-4">Stage Progress Funnel</h2>
        <div className="grid gap-4">
          {stageCounts.map((stage) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="w-36 shrink-0 text-[0.8rem] font-medium text-ink-soft">{stage.label}</div>
              <div className="h-8 flex-1 border border-line bg-paper-2 overflow-hidden rounded-[2px]">
                <div
                  className="h-full bg-gradient-to-r from-marigold to-spark transition-all duration-500"
                  style={{ width: `${Math.max((stage.count / maxStageCount) * 100, stage.count > 0 ? 5 : 0)}%` }}
                />
              </div>
              <div className="mono w-14 text-right font-bold tabular-nums text-ink">{stage.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/registrations"
          className="mono rounded-sm border border-line bg-paper px-4 py-2.5 text-[0.75rem] hover:border-marigold hover:text-marigold transition-colors"
        >
          View all registrations ({totalTeams}) →
        </Link>
        <Link
          to="/admin/screening"
          className="mono rounded-sm border border-line bg-paper px-4 py-2.5 text-[0.75rem] hover:border-marigold hover:text-marigold transition-colors"
        >
          Open screening console →
        </Link>
        <Link
          to="/admin/teams"
          className="mono rounded-sm border border-line bg-paper px-4 py-2.5 text-[0.75rem] hover:border-marigold hover:text-marigold transition-colors"
        >
          Finalise teams lock →
        </Link>
      </div>
    </div>
  );
}
