import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/api/stats';
import { listAllTeams, type ApiTeam, type ApiTeamMember } from '@/api/teams';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { type ScreeningStatus } from '@/lib/data';

export function AdminHome() {
  const [selectedRosterFilter, setSelectedRosterFilter] = useState<number | 'no_female' | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 5000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['all-teams-overview'],
    queryFn: () => listAllTeams({ page_size: 1000 }),
    refetchInterval: 5000,
  });

  // Dynamic KPI calculations
  const totalTeams = stats?.total_teams ?? teams.length;
  const totalStudents = stats?.total_students ?? teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  const includedTeams = teams.filter(
    (t) => t.status === 'l1_cleared' || t.status === 'l2_submitted' || t.status === 'l2_under_review' || t.status === 'selected'
  );

  const notIncludedTeams = teams.filter(
    (t) => t.status === 'registered' || t.status === 'l1_submitted' || t.status === 'l1_under_review' || t.status === 'l1_rejected' || t.status === 'l2_rejected'
  );

  // Calculate roster completeness & female requirement counts
  const count6Done = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 6).length, [teams]);
  const count5Members = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 5).length, [teams]);
  const count4Members = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 4).length, [teams]);
  const count3Members = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 3).length, [teams]);
  const count2Members = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 2).length, [teams]);
  const count1Member = useMemo(() => teams.filter((t) => (t.members?.length || 0) === 1).length, [teams]);
  const countNoFemale = useMemo(
    () => teams.filter((t) => !t.members?.some((m) => String(m.gender || '').toLowerCase() === 'female')).length,
    [teams]
  );

  // Filter teams based on clicked roster stat card
  const filteredRosterTeams = useMemo(() => {
    if (selectedRosterFilter === 'all') return teams;
    if (selectedRosterFilter === 'no_female') {
      return teams.filter((t) => !t.members?.some((m) => String(m.gender || '').toLowerCase() === 'female'));
    }
    return teams.filter((t) => (t.members?.length || 0) === selectedRosterFilter);
  }, [teams, selectedRosterFilter]);

  const rosterCards: Array<{
    countKey: number | 'no_female';
    label: string;
    subtitle: string;
    count: number;
    badgeStyle: string;
    activeBorder: string;
  }> = [
    {
      countKey: 6,
      label: 'Completely 6 Done',
      subtitle: 'Full 6-member roster',
      count: count6Done,
      badgeStyle: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-600/20',
    },
    {
      countKey: 5,
      label: 'Needs 1 Member',
      subtitle: '5 members registered',
      count: count5Members,
      badgeStyle: 'border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
      activeBorder: 'border-blue-600 ring-2 ring-blue-600/20',
    },
    {
      countKey: 4,
      label: 'Needs 2 Members',
      subtitle: '4 members registered',
      count: count4Members,
      badgeStyle: 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      activeBorder: 'border-amber-600 ring-2 ring-amber-600/20',
    },
    {
      countKey: 3,
      label: 'Needs 3 Members',
      subtitle: '3 members registered',
      count: count3Members,
      badgeStyle: 'border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      activeBorder: 'border-orange-600 ring-2 ring-orange-600/20',
    },
    {
      countKey: 2,
      label: 'Needs 4 Members',
      subtitle: '2 members registered',
      count: count2Members,
      badgeStyle: 'border-rose-600/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
      activeBorder: 'border-rose-600 ring-2 ring-rose-600/20',
    },
    {
      countKey: 1,
      label: 'Needs 5 Members',
      subtitle: 'Only 1 member',
      count: count1Member,
      badgeStyle: 'border-purple-600/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
      activeBorder: 'border-purple-600 ring-2 ring-purple-600/20',
    },
    {
      countKey: 'no_female',
      label: 'No Female Member',
      subtitle: 'Zero female members',
      count: countNoFemale,
      badgeStyle: 'border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400',
      activeBorder: 'border-red-600 ring-2 ring-red-600/20',
    },
  ];

  const stageCounts = [
    { label: 'Registered', count: stats?.by_stage?.registered ?? totalTeams },
    { label: 'Level 1 Processed', count: stats?.by_stage?.level1 ?? 0 },
    { label: 'Level 2 Processed', count: stats?.by_stage?.level2 ?? 0 },
    { label: 'Selected for SIH', count: stats?.selected ?? 0 },
  ];

  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <div>
      <div>
        <h1 className="font-display text-[1.6rem] font-bold">Dashboard</h1>
        <p className="mt-1 text-[0.85rem] text-ink-soft">Real-time team statistics and registration overview</p>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="border border-line bg-paper p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Teams</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalTeams}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Registered teams</div>
        </div>

        <div className="border border-line bg-paper p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Students</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalStudents}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Leaders &amp; members</div>
        </div>

        <div className="border border-green-800/30 bg-green-950/10 p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-green-600 font-bold uppercase tracking-wider">Included / Cleared</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums text-green-700">{includedTeams.length}</div>
          <div className="mt-1 text-[0.72rem] text-green-600/80">Passed screening rounds</div>
        </div>

        <div className="border border-red-800/30 bg-red-950/10 p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-red-600 font-bold uppercase tracking-wider">Not Included / Pending</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums text-red-700">{notIncludedTeams.length}</div>
          <div className="mt-1 text-[0.72rem] text-red-600/80">Pending or rejected</div>
        </div>
      </div>

      {/* ROSTER COMPLETENESS & GENDER COMPLIANCE STATISTICS SECTION */}
      <div className="mt-8 border border-line bg-paper p-6 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-[1.15rem] font-bold">Team Roster &amp; Gender Compliance Statistics</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">
              Click on any card to filter teams by member count or female member requirement
            </p>
          </div>

          {selectedRosterFilter !== 'all' && (
            <button
              onClick={() => setSelectedRosterFilter('all')}
              className="rounded-lg border border-marigold/40 bg-marigold/10 px-3 py-1.5 text-[0.75rem] font-semibold text-marigold hover:bg-marigold/20 transition-colors flex items-center gap-1.5"
            >
              <span>Showing Filtered Teams ({filteredRosterTeams.length})</span>
              <span className="font-bold text-sm">✕ Clear Filter</span>
            </button>
          )}
        </div>

        {/* 7 Interactive Stat Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {rosterCards.map((card) => {
            const isSelected = selectedRosterFilter === card.countKey;
            return (
              <button
                key={String(card.countKey)}
                type="button"
                onClick={() => {
                  if (selectedRosterFilter === card.countKey) {
                    setSelectedRosterFilter('all');
                  } else {
                    setSelectedRosterFilter(card.countKey);
                  }
                }}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                  isSelected ? card.activeBorder : 'border-line hover:border-marigold/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-block border px-1.5 py-0.5 text-[0.6rem] font-bold rounded uppercase tracking-wide ${card.badgeStyle}`}>
                    {card.label}
                  </span>
                </div>
                <div className="font-display text-2xl font-bold tabular-nums text-ink">{card.count}</div>
                <div className="text-[0.68rem] text-ink-soft mt-1">{card.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* FILTERED TEAM LIST TABLE */}
        {selectedRosterFilter !== 'all' && (
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[0.9rem] text-ink flex items-center gap-2">
                <span>
                  Filtered Results:{' '}
                  {selectedRosterFilter === 'no_female'
                    ? 'Teams with No Female Members (0 Female Members)'
                    : `Teams with ${selectedRosterFilter} Member(s)`}
                </span>
                <span className="rounded-full bg-paper-3 px-2.5 py-0.5 text-[0.72rem] font-mono text-marigold border border-line">
                  {filteredRosterTeams.length} teams found
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto border border-line bg-paper rounded-xl">
              <table className="w-full min-w-[750px] border-collapse text-[0.82rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">Leader USN</th>
                    <th className="px-4 py-3">Problem ID</th>
                    <th className="px-4 py-3">Roster Size</th>
                    <th className="px-4 py-3">Female Members</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRosterTeams.map((t: ApiTeam) => {
                    const femalesCount = t.members?.filter((m) => String(m.gender || '').toLowerCase() === 'female').length || 0;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTeam(t)}
                        className="border-b border-line last:border-0 hover:bg-paper-2 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-ink">{t.name}</td>
                        <td className="font-mono px-4 py-3 text-ink-soft text-[0.8rem]">{t.leader_usn}</td>
                        <td className="font-mono px-4 py-3 text-marigold font-bold text-[0.8rem]">
                          {t.problem_statement_id || '—'}
                        </td>
                        <td className="px-4 py-3 text-ink font-medium">
                          {t.members?.length || 0} / 6 members
                        </td>
                        <td className="px-4 py-3">
                          {femalesCount > 0 ? (
                            <span className="inline-block border border-emerald-600/30 bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[0.68rem] font-bold rounded">
                              ✓ {femalesCount} Female Member(s)
                            </span>
                          ) : (
                            <span className="inline-block border border-red-600/30 bg-red-50 text-red-900 px-2 py-0.5 text-[0.68rem] font-bold rounded">
                              ⚠️ 0 Female Members
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status as ScreeningStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeam(t);
                            }}
                            className="rounded-lg border border-line bg-paper-3 px-3 py-1 text-[0.75rem] font-semibold text-ink hover:border-marigold transition-colors"
                          >
                            Inspect Roster →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRosterTeams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                        No teams match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stage Breakdown Funnel Bars */}
      <div className="mt-8 border border-line bg-paper p-6 rounded-xl">
        <h2 className="font-display text-[1.15rem] font-bold mb-4">Stage Progress Funnel</h2>
        <div className="grid gap-4">
          {stageCounts.map((stage) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="w-36 shrink-0 text-[0.8rem] font-medium text-ink-soft">{stage.label}</div>
              <div className="h-8 flex-1 border border-line bg-paper-2 overflow-hidden rounded-[4px]">
                <div
                  className="h-full bg-gradient-to-r from-marigold to-spark transition-all duration-500 rounded-[4px]"
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
          className="mono rounded-xl border border-line bg-paper px-4 py-2.5 text-[0.75rem] hover:border-marigold hover:text-marigold transition-colors"
        >
          View all registrations ({totalTeams}) →
        </Link>
        <Link
          to="/admin/screening"
          className="mono rounded-xl border border-line bg-paper px-4 py-2.5 text-[0.75rem] hover:border-marigold hover:text-marigold transition-colors"
        >
          Open screening console →
        </Link>
      </div>

      {/* INSPECT TEAM ROSTER MODAL */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper-2">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{selectedTeam.name}</h2>
                <p className="text-[0.8rem] text-ink-soft">
                  Leader USN: <code className="font-mono text-marigold font-bold">{selectedTeam.leader_usn}</code> · {selectedTeam.members?.length || 0}/6 Members Registered
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-paper-3 transition-colors font-medium text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-[0.85rem]">
              <div className="rounded-xl border border-line bg-paper-2 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[0.7rem] font-semibold text-ink-soft uppercase block">Problem Statement ID</span>
                  <span className="font-mono text-base font-bold text-marigold">{selectedTeam.problem_statement_id || 'Not Selected'}</span>
                </div>
                <div>
                  <span className="text-[0.7rem] font-semibold text-ink-soft uppercase block">Current Status</span>
                  <StatusBadge status={selectedTeam.status as ScreeningStatus} />
                </div>
              </div>

              <div>
                <h3 className="text-[0.75rem] font-bold text-ink-soft uppercase tracking-wider mb-2.5">
                  Current Roster ({selectedTeam.members?.length || 0} / 6)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-line bg-paper">
                  <table className="w-full border-collapse text-[0.82rem]">
                    <thead>
                      <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase bg-paper-2">
                        <th className="px-3.5 py-2">Name</th>
                        <th className="px-3.5 py-2">USN</th>
                        <th className="px-3.5 py-2">Email</th>
                        <th className="px-3.5 py-2">Gender</th>
                        <th className="px-3.5 py-2">Dept / Year</th>
                        <th className="px-3.5 py-2">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members?.map((m: ApiTeamMember, idx: number) => (
                        <tr key={idx} className="border-b border-line last:border-0 hover:bg-paper-2/60">
                          <td className="px-3.5 py-2 font-medium text-ink">{m.name}</td>
                          <td className="font-mono px-3.5 py-2 text-ink text-[0.8rem]">{m.usn}</td>
                          <td className="font-mono px-3.5 py-2 text-ink-soft text-[0.8rem]">{m.email || '—'}</td>
                          <td className="px-3.5 py-2 text-ink font-medium">{m.gender}</td>
                          <td className="px-3.5 py-2 text-ink-soft">{m.department} (Yr {m.year})</td>
                          <td className="px-3.5 py-2 font-bold text-ink">{m.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-line px-6 py-3.5 bg-paper-2 flex justify-between items-center">
              <Link
                to="/admin/registrations"
                className="text-[0.8rem] font-semibold text-marigold hover:underline"
              >
                Go to Full Registrations Roster →
              </Link>
              <button
                onClick={() => setSelectedTeam(null)}
                className="rounded-lg border border-line bg-paper px-4 py-1.5 text-[0.8rem] font-semibold text-ink hover:bg-paper-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
