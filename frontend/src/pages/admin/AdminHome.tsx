import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats, downloadDatabaseBackup } from '@/api/stats';
import { listAllTeams, type ApiTeam, type ApiTeamMember } from '@/api/teams';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { type ScreeningStatus } from '@/lib/data';

type StatFilterCategory =
  | 'all'
  | 'roster_6'
  | 'roster_5'
  | 'roster_4'
  | 'roster_3'
  | 'roster_2'
  | 'roster_1'
  | 'no_female'
  | 'dept_cse'
  | 'dept_ds'
  | 'dept_aiml'
  | 'dept_civil'
  | 'dept_ece'
  | 'dept_bca'
  | 'dept_ise'
  | 'dept_mech'
  | 'year_1'
  | 'year_2'
  | 'year_3'
  | 'year_4'
  | 'gender_boys'
  | 'gender_girls'
  | `dept_year_${string}_${number}`;

const MAJOR_DEPTS = [
  { code: 'cse', name: 'CSE' },
  { code: 'ece', name: 'ECE' },
  { code: 'aiml', name: 'AIML' },
  { code: 'ds', name: 'Data Science' },
  { code: 'civil', name: 'Civil' },
  { code: 'bca', name: 'BCA' },
  { code: 'ise', name: 'ISE' },
  { code: 'mech', name: 'Mechanical' },
];

export function AdminHome() {
  const [activeFilter, setActiveFilter] = useState<StatFilterCategory>('all');
  const [selectedDeptTab, setSelectedDeptTab] = useState<string>('cse');
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 10000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['all-teams-overview'],
    queryFn: () => listAllTeams({ page_size: 1000 }),
    refetchInterval: 10000,
  });

  // Database Backup Handler
  async function handleBackupDatabase() {
    try {
      setIsBackingUp(true);
      setBackupMsg('Exporting database snapshot...');
      await downloadDatabaseBackup();
      setBackupMsg('✓ Database snapshot downloaded successfully!');
      setTimeout(() => setBackupMsg(''), 5000);
    } catch (err: any) {
      setBackupMsg(`⚠️ Backup failed: ${err?.message || 'Error downloading backup'}`);
    } finally {
      setIsBackingUp(false);
    }
  }

  // Dynamic KPI calculations
  const totalTeams = stats?.total_teams ?? teams.length;
  const allStudents = useMemo(() => {
    const list: Array<{ student: ApiTeamMember; teamName: string; teamId: string }> = [];
    teams.forEach((t) => {
      t.members?.forEach((m) => {
        list.push({ student: m, teamName: t.name, teamId: t.id });
      });
    });
    return list;
  }, [teams]);

  const totalStudents = stats?.total_students ?? allStudents.length;

  const includedTeams = teams.filter(
    (t) => t.status === 'l1_cleared' || t.status === 'l2_submitted' || t.status === 'l2_under_review' || t.status === 'selected'
  );

  const notIncludedTeams = teams.filter(
    (t) => t.status === 'registered' || t.status === 'l1_submitted' || t.status === 'l1_under_review' || t.status === 'l1_rejected' || t.status === 'l2_rejected'
  );

  // Helper matching functions (Mix team awareness)
  const isDeptMatch = (m: ApiTeamMember, target: string) => {
    const d = String(m.department || '').toLowerCase().trim();
    const t = target.toLowerCase();
    if (t === 'cse') return d.includes('cse') || d.includes('computer science');
    if (t === 'ds') return d.includes('ds') || d.includes('data science');
    if (t === 'aiml') return d.includes('ai') || d.includes('ml') || d.includes('aiml') || d.includes('artificial');
    if (t === 'civil') return d.includes('civil');
    if (t === 'ece') return d.includes('ece') || d.includes('electronics');
    if (t === 'bca') return d.includes('bca');
    if (t === 'ise') return d.includes('ise') || d.includes('information science');
    if (t === 'mech') return d.includes('mech') || d.includes('mechanical');
    return d === t;
  };

  // Stats Calculations
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

  // Department Stat Teams
  const countDeptCSE = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'cse'))).length, [teams]);
  const countDeptDS = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ds'))).length, [teams]);
  const countDeptAIML = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'aiml'))).length, [teams]);
  const countDeptCivil = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'civil'))).length, [teams]);
  const countDeptECE = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ece'))).length, [teams]);
  const countDeptBCA = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'bca'))).length, [teams]);
  const countDeptISE = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ise'))).length, [teams]);
  const countDeptMech = useMemo(() => teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'mech'))).length, [teams]);

  // Academic Year Stat Teams
  const countYear1 = useMemo(() => teams.filter((t) => t.members?.some((m) => Number(m.year) === 1)).length, [teams]);
  const countYear2 = useMemo(() => teams.filter((t) => t.members?.some((m) => Number(m.year) === 2)).length, [teams]);
  const countYear3 = useMemo(() => teams.filter((t) => t.members?.some((m) => Number(m.year) === 3)).length, [teams]);
  const countYear4 = useMemo(() => teams.filter((t) => t.members?.some((m) => Number(m.year) === 4)).length, [teams]);

  // Gender Demographics Stats
  const countBoysTeams = useMemo(() => teams.filter((t) => t.members?.some((m) => String(m.gender || '').toLowerCase() === 'male')).length, [teams]);
  const countGirlsTeams = useMemo(() => teams.filter((t) => t.members?.some((m) => String(m.gender || '').toLowerCase() === 'female')).length, [teams]);
  const totalBoysStudents = useMemo(() => allStudents.filter((s) => String(s.student.gender || '').toLowerCase() === 'male').length, [allStudents]);
  const totalGirlsStudents = useMemo(() => allStudents.filter((s) => String(s.student.gender || '').toLowerCase() === 'female').length, [allStudents]);

  // Specific Dept + Year Matrix helper functions
  const getDeptYearCount = (deptCode: string, yearNum: number) => {
    return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, deptCode) && Number(m.year) === yearNum)).length;
  };

  const getDeptYearStudentCount = (deptCode: string, yearNum: number) => {
    return allStudents.filter((s) => isDeptMatch(s.student, deptCode) && Number(s.student.year) === yearNum).length;
  };

  // Filtered Teams List based on Active Stat Card Filter
  const filteredTeams = useMemo(() => {
    if (activeFilter === 'all') return teams;
    if (activeFilter === 'roster_6') return teams.filter((t) => (t.members?.length || 0) === 6);
    if (activeFilter === 'roster_5') return teams.filter((t) => (t.members?.length || 0) === 5);
    if (activeFilter === 'roster_4') return teams.filter((t) => (t.members?.length || 0) === 4);
    if (activeFilter === 'roster_3') return teams.filter((t) => (t.members?.length || 0) === 3);
    if (activeFilter === 'roster_2') return teams.filter((t) => (t.members?.length || 0) === 2);
    if (activeFilter === 'roster_1') return teams.filter((t) => (t.members?.length || 0) === 1);
    if (activeFilter === 'no_female') return teams.filter((t) => !t.members?.some((m) => String(m.gender || '').toLowerCase() === 'female'));
    
    if (activeFilter === 'dept_cse') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'cse')));
    if (activeFilter === 'dept_ds') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ds')));
    if (activeFilter === 'dept_aiml') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'aiml')));
    if (activeFilter === 'dept_civil') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'civil')));
    if (activeFilter === 'dept_ece') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ece')));
    if (activeFilter === 'dept_bca') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'bca')));
    if (activeFilter === 'dept_ise') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'ise')));
    if (activeFilter === 'dept_mech') return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, 'mech')));

    if (activeFilter === 'year_1') return teams.filter((t) => t.members?.some((m) => Number(m.year) === 1));
    if (activeFilter === 'year_2') return teams.filter((t) => t.members?.some((m) => Number(m.year) === 2));
    if (activeFilter === 'year_3') return teams.filter((t) => t.members?.some((m) => Number(m.year) === 3));
    if (activeFilter === 'year_4') return teams.filter((t) => t.members?.some((m) => Number(m.year) === 4));

    if (activeFilter === 'gender_boys') return teams.filter((t) => t.members?.some((m) => String(m.gender || '').toLowerCase() === 'male'));
    if (activeFilter === 'gender_girls') return teams.filter((t) => t.members?.some((m) => String(m.gender || '').toLowerCase() === 'female'));

    if (activeFilter.startsWith('dept_year_')) {
      const parts = activeFilter.split('_');
      const deptCode = parts[2];
      const yearNum = Number(parts[3]);
      return teams.filter((t) => t.members?.some((m) => isDeptMatch(m, deptCode) && Number(m.year) === yearNum));
    }

    return teams;
  }, [teams, activeFilter]);

  // Filtered Individual Students List for Names Modal
  const filteredStudents = useMemo(() => {
    if (activeFilter === 'all') return allStudents;
    if (activeFilter === 'gender_boys') return allStudents.filter((s) => String(s.student.gender || '').toLowerCase() === 'male');
    if (activeFilter === 'gender_girls') return allStudents.filter((s) => String(s.student.gender || '').toLowerCase() === 'female');
    if (activeFilter === 'dept_cse') return allStudents.filter((s) => isDeptMatch(s.student, 'cse'));
    if (activeFilter === 'dept_ds') return allStudents.filter((s) => isDeptMatch(s.student, 'ds'));
    if (activeFilter === 'dept_aiml') return allStudents.filter((s) => isDeptMatch(s.student, 'aiml'));
    if (activeFilter === 'dept_civil') return allStudents.filter((s) => isDeptMatch(s.student, 'civil'));
    if (activeFilter === 'dept_ece') return allStudents.filter((s) => isDeptMatch(s.student, 'ece'));
    if (activeFilter === 'dept_bca') return allStudents.filter((s) => isDeptMatch(s.student, 'bca'));
    if (activeFilter === 'dept_ise') return allStudents.filter((s) => isDeptMatch(s.student, 'ise'));
    if (activeFilter === 'dept_mech') return allStudents.filter((s) => isDeptMatch(s.student, 'mech'));
    if (activeFilter === 'year_1') return allStudents.filter((s) => Number(s.student.year) === 1);
    if (activeFilter === 'year_2') return allStudents.filter((s) => Number(s.student.year) === 2);
    if (activeFilter === 'year_3') return allStudents.filter((s) => Number(s.student.year) === 3);
    if (activeFilter === 'year_4') return allStudents.filter((s) => Number(s.student.year) === 4);

    if (activeFilter.startsWith('dept_year_')) {
      const parts = activeFilter.split('_');
      const deptCode = parts[2];
      const yearNum = Number(parts[3]);
      return allStudents.filter((s) => isDeptMatch(s.student, deptCode) && Number(s.student.year) === yearNum);
    }

    const teamIds = new Set(filteredTeams.map((t) => t.id));
    return allStudents.filter((s) => teamIds.has(s.teamId));
  }, [allStudents, filteredTeams, activeFilter]);

  const filterLabels: Record<string, string> = {
    all: 'All Registered Teams',
    roster_6: 'Full 6-Member Teams (Completely 6 Done)',
    roster_5: 'Teams Needing 1 Member (5 Members)',
    roster_4: 'Teams Needing 2 Members (4 Members)',
    roster_3: 'Teams Needing 3 Members (3 Members)',
    roster_2: 'Teams Needing 4 Members (2 Members)',
    roster_1: 'Teams Needing 5 Members (1 Member)',
    no_female: 'Teams with 0 Female Members',
    dept_cse: 'Teams with CSE Members',
    dept_ds: 'Teams with Data Science Members',
    dept_aiml: 'Teams with AI & ML Members',
    dept_civil: 'Teams with Civil Engineering Members',
    dept_ece: 'Teams with ECE Members',
    dept_bca: 'Teams with BCA Members',
    dept_ise: 'Teams with ISE Members',
    dept_mech: 'Teams with Mechanical Members',
    year_1: 'Teams with 1st Year Students',
    year_2: 'Teams with 2nd Year Students',
    year_3: 'Teams with 3rd Year Students',
    year_4: 'Teams with 4th Year Students',
    gender_boys: 'Teams with Male Students (Boys)',
    gender_girls: 'Teams with Female Students (Girls)',
  };

  const getFilterLabel = (filterKey: string) => {
    if (filterLabels[filterKey]) return filterLabels[filterKey];
    if (filterKey.startsWith('dept_year_')) {
      const parts = filterKey.split('_');
      const dept = MAJOR_DEPTS.find((d) => d.code === parts[2])?.name || parts[2].toUpperCase();
      const yr = parts[3];
      const suffix = yr === '1' ? 'st' : yr === '2' ? 'nd' : yr === '3' ? 'rd' : 'th';
      return `${yr}${suffix} Year ${dept} Students & Teams`;
    }
    return filterKey;
  };

  const stageCounts = [
    { label: 'Registered', count: stats?.by_stage?.registered ?? totalTeams },
    { label: 'Level 1 Processed', count: stats?.by_stage?.level1 ?? 0 },
    { label: 'Level 2 Processed', count: stats?.by_stage?.level2 ?? 0 },
    { label: 'Selected for SIH', count: stats?.selected ?? 0 },
  ];

  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      {/* Top Header Banner with Backup Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Super Admin Dashboard</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Real-time analytics across Departments, Year-by-Year (1st, 2nd, 3rd, 4th Year), Demographics, &amp; Rosters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBackupDatabase}
            disabled={isBackingUp}
            className="rounded-xl border border-emerald-600/40 bg-emerald-500/10 px-4 py-2 text-[0.8rem] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>💾</span>
            <span>{isBackingUp ? 'Exporting...' : 'Backup Database (JSON)'}</span>
          </button>
        </div>
      </div>

      {backupMsg && (
        <div className={`p-3 rounded-xl text-[0.82rem] font-medium border ${backupMsg.includes('✓') ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
          {backupMsg}
        </div>
      )}

      {/* Main KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="border border-line bg-paper p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Teams</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalTeams}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Registered teams</div>
        </div>

        <div className="border border-line bg-paper p-5 rounded-xl">
          <div className="mono text-[0.62rem] text-ink-soft uppercase tracking-wider">Total Students</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{totalStudents}</div>
          <div className="mt-1 text-[0.72rem] text-ink-soft">Leaders &amp; team members</div>
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

      {/* NEW SECTION: DEPARTMENT + YEAR DETAILED MATRIX BREAKDOWN (1st Year ECE, 2nd Year ECE, 3rd Year ECE, etc.) */}
      <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
        <div>
          <h2 className="font-display text-[1.15rem] font-bold text-ink">Department &amp; Academic Year Breakdown (1st, 2nd, 3rd, 4th Year)</h2>
          <p className="text-[0.8rem] text-ink-soft mt-0.5">
            Click any Year card under a department (e.g. 1st Year ECE, 3rd Year CSE, 2nd Year AIML) to filter teams and list student names.
          </p>
        </div>

        {/* Department Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-line pb-3">
          {MAJOR_DEPTS.map((d) => {
            const isSelected = selectedDeptTab === d.code;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => setSelectedDeptTab(d.code)}
                className={`px-3 py-1.5 text-[0.78rem] font-bold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-marigold bg-marigold text-slate-950 shadow-xs'
                    : 'border-line bg-paper-2 text-ink hover:border-marigold/50'
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>

        {/* 4 Academic Year Cards for the Selected Department */}
        {(() => {
          const currentDeptObj = MAJOR_DEPTS.find((d) => d.code === selectedDeptTab) || MAJOR_DEPTS[0];
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.82rem] font-bold text-marigold">
                  Showing Year Breakdown for: {currentDeptObj.name} Department
                </span>
                <span className="text-[0.72rem] text-ink-soft">
                  Mixed teams included under all matching years &amp; departments
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((yearNum) => {
                  const filterKey = `dept_year_${currentDeptObj.code}_${yearNum}` as const;
                  const isSelected = activeFilter === filterKey;
                  const teamCount = getDeptYearCount(currentDeptObj.code, yearNum);
                  const studentCount = getDeptYearStudentCount(currentDeptObj.code, yearNum);
                  const yrSuffix = yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th';

                  return (
                    <button
                      key={yearNum}
                      type="button"
                      onClick={() => setActiveFilter(isSelected ? 'all' : filterKey)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                        isSelected
                          ? 'border-marigold ring-2 ring-marigold/30 bg-paper-2'
                          : 'border-line hover:border-marigold/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="inline-block border border-marigold/40 bg-marigold/10 text-marigold px-2 py-0.5 text-[0.65rem] font-bold rounded uppercase">
                          {yrSuffix} Year {currentDeptObj.name}
                        </span>
                      </div>
                      <div className="font-display text-2xl font-bold tabular-nums text-ink">{studentCount} Students</div>
                      <div className="text-[0.72rem] font-medium text-ink-soft mt-1">Found in {teamCount} Teams</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* SECTION 1: OVERALL DEPARTMENT DISTRIBUTION */}
      <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
        <div>
          <h2 className="font-display text-[1.15rem] font-bold text-ink">Department Totals Overview</h2>
          <p className="text-[0.8rem] text-ink-soft mt-0.5">Click any department card to view all teams with members in that department</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: 'dept_cse' as const, label: 'CSE', full: 'Computer Science', count: countDeptCSE, color: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400' },
            { key: 'dept_ds' as const, label: 'Data Science', full: 'Data Science (DS)', count: countDeptDS, color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400' },
            { key: 'dept_aiml' as const, label: 'AIML', full: 'AI & Machine Learning', count: countDeptAIML, color: 'border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400' },
            { key: 'dept_civil' as const, label: 'Civil', full: 'Civil Engineering', count: countDeptCivil, color: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' },
            { key: 'dept_ece' as const, label: 'ECE', full: 'Electronics & Comm.', count: countDeptECE, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
            { key: 'dept_bca' as const, label: 'BCA', full: 'Bachelor of Comp. Appl.', count: countDeptBCA, color: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400' },
            { key: 'dept_ise' as const, label: 'ISE', full: 'Information Science', count: countDeptISE, color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' },
            { key: 'dept_mech' as const, label: 'Mechanical', full: 'Mechanical Engineering', count: countDeptMech, color: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400' },
          ].map((card) => {
            const isSelected = activeFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveFilter(isSelected ? 'all' : card.key)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                  isSelected ? 'border-marigold ring-2 ring-marigold/30 bg-paper-2' : 'border-line hover:border-marigold/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-block border px-2 py-0.5 text-[0.65rem] font-bold rounded uppercase tracking-wide ${card.color}`}>
                    {card.label}
                  </span>
                </div>
                <div className="font-display text-2xl font-bold tabular-nums text-ink">{card.count}</div>
                <div className="text-[0.7rem] text-ink-soft mt-1">{card.full} teams</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACADEMIC YEAR & GENDER DEMOGRAPHICS STATS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Year Stats */}
        <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
          <div>
            <h2 className="font-display text-[1.15rem] font-bold text-ink">Overall Academic Year Distribution</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Click any year to view matching teams</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'year_1' as const, label: '1st Year', subtitle: '1st year students present', count: countYear1, color: 'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-400' },
              { key: 'year_2' as const, label: '2nd Year', subtitle: '2nd year students present', count: countYear2, color: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400' },
              { key: 'year_3' as const, label: '3rd Year', subtitle: '3rd year students present', count: countYear3, color: 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400' },
              { key: 'year_4' as const, label: '4th Year', subtitle: '4th year students present', count: countYear4, color: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400' },
            ].map((card) => {
              const isSelected = activeFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveFilter(isSelected ? 'all' : card.key)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                    isSelected ? 'border-marigold ring-2 ring-marigold/30 bg-paper-2' : 'border-line hover:border-marigold/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-block border px-2 py-0.5 text-[0.65rem] font-bold rounded uppercase tracking-wide ${card.color}`}>
                      {card.label}
                    </span>
                  </div>
                  <div className="font-display text-2xl font-bold tabular-nums text-ink">{card.count}</div>
                  <div className="text-[0.7rem] text-ink-soft mt-1">{card.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gender Demographics Stats (Boys & Girls) */}
        <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
          <div>
            <h2 className="font-display text-[1.15rem] font-bold text-ink">Gender Demographics (Boys &amp; Girls)</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Click Boys or Girls to filter teams and display student names</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                key: 'gender_boys' as const,
                label: '👦 Boys / Male Members',
                countTeams: countBoysTeams,
                countStudents: totalBoysStudents,
                color: 'border-blue-600/40 bg-blue-500/10 text-blue-800 dark:text-blue-300',
              },
              {
                key: 'gender_girls' as const,
                label: '👧 Girls / Female Members',
                countTeams: countGirlsTeams,
                countStudents: totalGirlsStudents,
                color: 'border-pink-600/40 bg-pink-500/10 text-pink-800 dark:text-pink-300',
              },
            ].map((card) => {
              const isSelected = activeFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveFilter(isSelected ? 'all' : card.key)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                    isSelected ? 'border-marigold ring-2 ring-marigold/30 bg-paper-2' : 'border-line hover:border-marigold/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-block border px-2 py-0.5 text-[0.68rem] font-bold rounded uppercase ${card.color}`}>
                      {card.label}
                    </span>
                  </div>
                  <div className="font-display text-2xl font-bold tabular-nums text-ink">{card.countStudents} Students</div>
                  <div className="text-[0.72rem] font-medium text-ink-soft mt-1">Found in {card.countTeams} teams</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: ROSTER COMPLETENESS STATS */}
      <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.15rem] font-bold text-ink">Team Roster Completeness &amp; Female Compliance</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Filter by team member headcount and female quota compliance</p>
          </div>

          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="rounded-lg border border-marigold/40 bg-marigold/10 px-3.5 py-1.5 text-[0.78rem] font-semibold text-marigold hover:bg-marigold/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Showing: {getFilterLabel(activeFilter)} ({filteredTeams.length} Teams)</span>
              <span className="font-bold text-sm">✕ Clear Filter</span>
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {[
            { key: 'roster_6' as const, label: 'Completely 6 Done', subtitle: 'Full 6 roster', count: count6Done, color: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700' },
            { key: 'roster_5' as const, label: 'Needs 1 Member', subtitle: '5 members', count: count5Members, color: 'border-blue-600/30 bg-blue-500/10 text-blue-700' },
            { key: 'roster_4' as const, label: 'Needs 2 Members', subtitle: '4 members', count: count4Members, color: 'border-amber-600/30 bg-amber-500/10 text-amber-700' },
            { key: 'roster_3' as const, label: 'Needs 3 Members', subtitle: '3 members', count: count3Members, color: 'border-orange-600/30 bg-orange-500/10 text-orange-700' },
            { key: 'roster_2' as const, label: 'Needs 4 Members', subtitle: '2 members', count: count2Members, color: 'border-rose-600/30 bg-rose-500/10 text-rose-700' },
            { key: 'roster_1' as const, label: 'Needs 5 Members', subtitle: '1 member', count: count1Member, color: 'border-purple-600/30 bg-purple-500/10 text-purple-700' },
            { key: 'no_female' as const, label: 'No Female Member', subtitle: '0 female members', count: countNoFemale, color: 'border-red-600/30 bg-red-500/10 text-red-700' },
          ].map((card) => {
            const isSelected = activeFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveFilter(isSelected ? 'all' : card.key)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer bg-paper hover:shadow-md ${
                  isSelected ? 'border-marigold ring-2 ring-marigold/30 bg-paper-2' : 'border-line hover:border-marigold/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-block border px-1.5 py-0.5 text-[0.6rem] font-bold rounded uppercase ${card.color}`}>
                    {card.label}
                  </span>
                </div>
                <div className="font-display text-2xl font-bold tabular-nums text-ink">{card.count}</div>
                <div className="text-[0.68rem] text-ink-soft mt-1">{card.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERED TEAMS TABLE & STUDENT NAMES DISCOVERY */}
      <div className="border border-line bg-paper p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[1rem] text-ink flex items-center gap-2">
              <span>{getFilterLabel(activeFilter)}</span>
              <span className="rounded-full bg-paper-3 px-3 py-0.5 text-[0.75rem] font-mono text-marigold border border-line font-bold">
                {filteredTeams.length} teams · {filteredStudents.length} students
              </span>
            </h3>
            <p className="text-[0.78rem] text-ink-soft mt-0.5">
              Click any team row to inspect full roster details or view all student names directly.
            </p>
          </div>

          <button
            onClick={() => setShowStudentListModal(true)}
            className="rounded-xl border border-line bg-paper-3 px-4 py-2 text-[0.8rem] font-bold text-ink hover:border-marigold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>👁️</span>
            <span>View All Student Names ({filteredStudents.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-line bg-paper rounded-xl">
          <table className="w-full min-w-[850px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
                <th className="px-4 py-3">Team Name</th>
                <th className="px-4 py-3">Leader USN</th>
                <th className="px-4 py-3">Department Mix</th>
                <th className="px-4 py-3">Year Mix</th>
                <th className="px-4 py-3">Roster &amp; Gender</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((t: ApiTeam) => {
                const members = t.members || [];
                const femalesCount = members.filter((m) => String(m.gender || '').toLowerCase() === 'female').length;
                const malesCount = members.filter((m) => String(m.gender || '').toLowerCase() === 'male').length;

                // Dept breakdown for team tag
                const deptsMap = new Map<string, number>();
                members.forEach((m) => {
                  const d = m.department || 'Other';
                  deptsMap.set(d, (deptsMap.get(d) || 0) + 1);
                });
                const deptTags = Array.from(deptsMap.entries()).map(([d, c]) => `${d}: ${c}`);

                // Year breakdown for team tag
                const yearsMap = new Map<number, number>();
                members.forEach((m) => {
                  const y = Number(m.year) || 1;
                  yearsMap.set(y, (yearsMap.get(y) || 0) + 1);
                });
                const yearTags = Array.from(yearsMap.entries()).map(([y, c]) => `Yr ${y}: ${c}`);

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTeam(t)}
                    className="border-b border-line last:border-0 hover:bg-paper-2/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-ink text-[0.88rem]">{t.name}</div>
                      <div className="text-[0.7rem] text-ink-soft">{t.theme || 'No theme selected'}</div>
                    </td>
                    <td className="font-mono px-4 py-3 text-ink-soft text-[0.8rem]">{t.leader_usn}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {deptTags.map((dt, idx) => (
                          <span key={idx} className="mono border border-line bg-paper-3 px-1.5 py-0.5 text-[0.62rem] rounded font-medium text-ink">
                            {dt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {yearTags.map((yt, idx) => (
                          <span key={idx} className="mono border border-line bg-paper-3 px-1.5 py-0.5 text-[0.62rem] rounded font-medium text-ink-soft">
                            {yt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[0.75rem] font-bold text-ink">{members.length} / 6 members</div>
                      <div className="text-[0.68rem] text-ink-soft">
                        👦 {malesCount} Male · 👧 {femalesCount} Female
                      </div>
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
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                    No teams match the selected filter category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Breakdown Funnel Bars */}
      <div className="border border-line bg-paper p-6 rounded-xl">
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

      {/* MODAL 1: STUDENT NAMES LIST MODAL */}
      {showStudentListModal && (
        <div
          onClick={() => setShowStudentListModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper-2">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Student Roster Names</h2>
                <p className="text-[0.8rem] text-ink-soft">
                  Category: <strong className="text-marigold">{getFilterLabel(activeFilter)}</strong> · {filteredStudents.length} Students Listed
                </p>
              </div>
              <button
                onClick={() => setShowStudentListModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-paper-3 transition-colors font-medium text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-[0.82rem]">
              <div className="overflow-x-auto rounded-xl border border-line bg-paper">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-line text-left text-[0.68rem] font-semibold text-ink-soft uppercase bg-paper-2">
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">USN</th>
                      <th className="px-4 py-2.5">Team Name</th>
                      <th className="px-4 py-2.5">Gender</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Year</th>
                      <th className="px-4 py-2.5">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((item, idx) => (
                      <tr key={idx} className="border-b border-line last:border-0 hover:bg-paper-2/60">
                        <td className="px-4 py-2.5 font-bold text-ink">{item.student.name}</td>
                        <td className="font-mono px-4 py-2.5 text-marigold font-bold text-[0.8rem]">{item.student.usn}</td>
                        <td className="px-4 py-2.5 font-medium text-ink-soft">{item.teamName}</td>
                        <td className="px-4 py-2.5 font-medium">{item.student.gender}</td>
                        <td className="px-4 py-2.5">{item.student.department}</td>
                        <td className="px-4 py-2.5">Yr {item.student.year}</td>
                        <td className="px-4 py-2.5 font-semibold text-ink">{item.student.role}</td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                          No student names found matching this category filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-line px-6 py-3.5 bg-paper-2 flex justify-between items-center">
              <span className="text-[0.75rem] text-ink-soft">Showing {filteredStudents.length} student entries</span>
              <button
                onClick={() => setShowStudentListModal(false)}
                className="rounded-lg border border-line bg-paper px-4 py-1.5 text-[0.8rem] font-semibold text-ink hover:bg-paper-3"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT TEAM ROSTER MODAL */}
      {selectedTeam && (
        <div
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4"
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
