import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDeletedTeams, restoreDeletedTeam, type ApiDeletedTeam } from '@/api/teams';
import { Button } from '@/components/ui/Button';

export function DeletedTeams() {
  const queryClient = useQueryClient();

  const { data: deletedTeams = [], isLoading } = useQuery({
    queryKey: ['deleted-teams'],
    queryFn: () => listDeletedTeams(),
    refetchInterval: 5000,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreDeletedTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-teams'] });
      queryClient.invalidateQueries({ queryKey: ['all-teams-registrations'] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Soft-Deleted Team Archive</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Archived team registrations. Data is preserved and can be restored at any time by an administrator.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-paper rounded-2xl shadow-xs">
        <table className="w-full min-w-[850px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] font-semibold text-ink-soft uppercase tracking-wider bg-paper-2">
              <th className="px-4 py-3.5">Team Name</th>
              <th className="px-4 py-3.5">Leader USN</th>
              <th className="px-4 py-3.5">Theme</th>
              <th className="px-4 py-3.5">Deleted By</th>
              <th className="px-4 py-3.5">Reason</th>
              <th className="px-4 py-3.5">Deleted Date</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {deletedTeams.map((dt: ApiDeletedTeam) => (
              <tr key={dt.id} className="border-b border-line last:border-0 hover:bg-paper-2/60">
                <td className="px-4 py-3.5 font-bold text-ink">{dt.name}</td>
                <td className="font-mono px-4 py-3.5 text-ink-soft text-[0.82rem]">{dt.leader_usn}</td>
                <td className="px-4 py-3.5 text-ink-soft">{dt.theme || 'Unassigned'}</td>
                <td className="px-4 py-3.5 text-ink-soft">{dt.deleted_by}</td>
                <td className="px-4 py-3.5 text-amber-900 font-medium">{dt.reason || 'No reason provided'}</td>
                <td className="px-4 py-3.5 text-ink-soft text-[0.8rem]">
                  {new Date(dt.deleted_at).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    variant="secondary"
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(dt.id)}
                  >
                    Restore Team ↺
                  </Button>
                </td>
              </tr>
            ))}
            {deletedTeams.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-soft">
                  {isLoading ? 'Loading soft-deleted teams...' : 'No teams in the soft-delete archive.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
