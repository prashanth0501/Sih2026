import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, setTeamLock, type ApiTeam } from '@/api/teams';
import { cn } from '@/lib/utils';

function LockToggle({ team }: { team: ApiTeam }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (locked: boolean) => setTeamLock(team.id, locked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-teams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate(!team.is_locked)}
      disabled={mutation.isPending}
      className={cn(
        'mono flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.64rem] transition-colors',
        team.is_locked ? 'border-red-700/30 bg-red-700/10 text-red-700 font-bold' : 'border-line text-ink-soft hover:border-marigold hover:text-marigold'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', team.is_locked ? 'bg-red-700' : 'bg-green-600')} />
      {team.is_locked ? 'Finalised — read-only' : 'Editable'}
    </button>
  );
}

export function TeamLock() {
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => listAllTeams({ page_size: 200 }),
    refetchInterval: 5000,
  });

  const finalisedCount = teams.filter((t) => t.is_locked).length;
  const editableCount = teams.filter((t) => !t.is_locked).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Finalise Teams & Lock Roster</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Manage read-only lock status across registered teams in real-time.
          </p>
        </div>
        <div className="mono flex items-center gap-3 text-[0.75rem]">
          <span className="rounded bg-red-700/10 border border-red-700/30 px-3 py-1 text-red-700 font-bold">
            Finalised: {finalisedCount}
          </span>
          <span className="rounded bg-green-600/10 border border-green-600/30 px-3 py-1 text-green-700 font-bold">
            Editable: {editableCount}
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[640px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft">
              <th className="px-4 py-3 font-normal">Team Name</th>
              <th className="px-4 py-3 font-normal">Members</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Lock State</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="mono px-4 py-3 text-ink-soft">{(t.members?.length || 0) + 1} / 6</td>
                <td className="px-4 py-3 text-ink-soft">{t.status.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <LockToggle team={t} />
                </td>
              </tr>
            ))}
            {!isLoading && teams.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-soft">
                  No teams registered in the database yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
