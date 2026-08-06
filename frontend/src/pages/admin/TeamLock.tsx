import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, setTeamLock, type ApiTeam } from '@/api/teams';
import { cn } from '@/lib/utils';

function LockToggle({ team }: { team: ApiTeam }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (locked: boolean) => setTeamLock(team.id, locked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-teams'] }),
  });

  return (
    <button
      onClick={() => mutation.mutate(!team.is_locked)}
      disabled={mutation.isPending}
      className={cn(
        'mono flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.64rem] transition-colors',
        team.is_locked ? 'border-red-700/30 bg-red-700/10 text-red-700' : 'border-line text-ink-soft hover:border-marigold hover:text-marigold'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', team.is_locked ? 'bg-red-700' : 'bg-green-600')} />
      {team.is_locked ? 'Finalised — read-only' : 'Editable'}
    </button>
  );
}

export function TeamLock() {
  const { data: teams, isLoading } = useQuery({ queryKey: ['all-teams'], queryFn: () => listAllTeams({ page_size: 200 }) });

  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Finalise teams</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        The team leader can add/remove members and submit work until you finalise a team here. Once
        finalised, the leader gets read-only access — no more member changes, no more submissions. This is
        independent of screening status; use it once a team's roster shouldn't change anymore (e.g. after
        nomination).
      </p>

      <div className="mt-6 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[640px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft">
              <th className="px-4 py-3 font-normal">Team</th>
              <th className="px-4 py-3 font-normal">Members</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Lock state</th>
            </tr>
          </thead>
          <tbody>
            {teams?.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="mono px-4 py-3 text-ink-soft">{t.members.length + 1} / 6</td>
                <td className="px-4 py-3 text-ink-soft">{t.status.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <LockToggle team={t} />
                </td>
              </tr>
            ))}
            {!isLoading && (!teams || teams.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-soft">
                  No teams have registered on the real backend yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
