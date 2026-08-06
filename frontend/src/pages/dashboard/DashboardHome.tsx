import { useQuery } from '@tanstack/react-query';
import { getMyTeam } from '@/api/teams';
import { STATUS_LABEL, STATUS_STAGE, type ScreeningStatus } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

const STAGES = ['Concept', 'Level 1', 'Level 2', 'Finale'];

export function DashboardHome() {
  const { data: team, isLoading, error } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam, retry: false });

  if (isLoading) return null;

  if (error || !team) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-[1.6rem] font-bold">Your team</h1>
        <p className="mt-3 text-ink-soft">
          You're not on a team yet. <a href="/register" className="text-marigold hover:underline">Register one</a>{' '}
          or ask your team leader to add you as a member.
        </p>
      </div>
    );
  }

  const status = team.status as ScreeningStatus;
  const currentStage = STATUS_STAGE[status];

  return (
    <div className="max-w-3xl">
      <div className="mono mb-2 flex items-center gap-2 text-[0.68rem] text-marigold">
        {team.viewer_is_leader ? 'Your team' : 'Your team · viewing as member (read-only)'}
      </div>
      <h1 className="font-display text-[1.8rem] font-bold">{team.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />
        {team.theme && <span className="text-[0.85rem] text-ink-soft">{team.theme}</span>}
        {team.is_locked && (
          <span className="mono rounded-full bg-red-700/10 px-3 py-1 text-[0.62rem] text-red-700">Finalised</span>
        )}
      </div>

      <div className="mt-10 grid grid-cols-4 gap-2">
        {STAGES.map((label, i) => (
          <div key={label}>
            <div className={cn('h-1.5 rounded-full', i <= currentStage ? 'bg-spark' : 'bg-line')} />
            <div className={cn('mono mt-2 text-[0.62rem]', i <= currentStage ? 'text-ink' : 'text-ink-soft/60')}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Level 1 score</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{team.level1.score ?? '—'}</div>
          {team.level1.feedback && <p className="mt-2 text-[0.82rem] text-ink-soft">{team.level1.feedback}</p>}
        </div>
        <div className="border border-line bg-paper p-5">
          <div className="mono text-[0.62rem] text-ink-soft">Level 2 score</div>
          <div className="mt-1.5 font-display text-2xl font-bold tabular-nums">{team.level2.score ?? '—'}</div>
          {team.level2.feedback && <p className="mt-2 text-[0.82rem] text-ink-soft">{team.level2.feedback}</p>}
        </div>
      </div>

      <div className="mt-10 border border-line bg-paper p-5">
        <div className="mono text-[0.62rem] text-ink-soft">Current status</div>
        <p className="mt-2 text-ink-soft">
          Your team is at <strong className="text-ink">{STATUS_LABEL[status]}</strong>. Check the Submissions
          tab for what's due next, or Announcements for anything coordinators have posted.
        </p>
      </div>
    </div>
  );
}
