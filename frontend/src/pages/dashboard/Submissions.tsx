import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyTeam, submitLevel } from '@/api/teams';
import { Button } from '@/components/ui/Button';

export function Submissions() {
  const queryClient = useQueryClient();
  const { data: team, isLoading, error } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam, retry: false });
  const [url, setUrl] = useState('');

  const mutation = useMutation({
    mutationFn: (level: 1 | 2) => submitLevel(team!.id, level, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      setUrl('');
    },
  });

  if (isLoading) return null;

  if (error || !team) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-[1.6rem] font-bold">Submissions</h1>
        <p className="mt-3 text-ink-soft">You're not on a team yet.</p>
      </div>
    );
  }

  const canSubmitL1 = team.status === 'registered';
  const canSubmitL2 = team.status === 'l1_cleared';
  const openForSubmission = (canSubmitL1 || canSubmitL2) && team.viewer_is_leader && !team.is_locked;
  const level: 1 | 2 = canSubmitL1 ? 1 : 2;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[1.6rem] font-bold">Submissions</h1>
      <p className="mt-2 text-ink-soft">
        Upload goes to object storage first — this form just records the link against your team, matching{' '}
        <code className="mono rounded bg-paper-3 px-1.5 py-0.5 text-[0.78rem]">POST /teams/{'{id}'}/submissions</code> in the API.
      </p>

      <div className="mt-8 border border-line bg-paper p-6">
        {!team.viewer_is_leader ? (
          <p className="text-ink-soft">
            Only the team leader can submit work. Your team's current status is{' '}
            <strong className="text-ink">{team.status.replace(/_/g, ' ')}</strong>.
          </p>
        ) : team.is_locked ? (
          <p className="text-ink-soft">🔒 This team has been finalised — submissions are closed.</p>
        ) : !openForSubmission ? (
          <p className="text-ink-soft">
            Nothing is open for submission right now. Your team's current status is{' '}
            <strong className="text-ink">{team.status.replace(/_/g, ' ')}</strong>.
          </p>
        ) : mutation.isSuccess ? (
          <p className="text-ink-soft">
            Level {level} submission recorded. A coordinator will review it and leave feedback on your dashboard.
          </p>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(level);
            }}
          >
            <div className="mono text-[0.68rem] text-marigold">Level {level} submission</div>
            <label className="grid gap-1.5 text-[0.8rem]">
              Link to your document / deck / prototype
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="border border-line bg-paper-2 px-4 py-3 outline-none focus-visible:border-marigold"
              />
            </label>
            <Button type="submit" variant="primary" className="justify-self-start" disabled={mutation.isPending}>
              Submit Level {level} →
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
