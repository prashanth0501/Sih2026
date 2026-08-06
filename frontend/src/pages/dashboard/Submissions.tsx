import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyTeam, submitLevel } from '@/api/teams';
import { getSystemSettings } from '@/api/settings';
import { Button } from '@/components/ui/Button';

export function Submissions() {
  const queryClient = useQueryClient();
  const { data: team, isLoading, error } = useQuery({ queryKey: ['my-team'], queryFn: getMyTeam, retry: false });
  const { data: settings } = useQuery({ queryKey: ['system-settings'], queryFn: getSystemSettings });

  const [l1Url, setL1Url] = useState('');
  const [l2Url, setL2Url] = useState('');
  const [submittingLevel, setSubmittingLevel] = useState<1 | 2>(1);

  const mutation = useMutation({
    mutationFn: (level: 1 | 2) => submitLevel(team!.id, level, level === 1 ? l1Url : l2Url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-team'] });
      setL1Url('');
      setL2Url('');
    },
  });

  if (isLoading) return null;

  if (error || !team) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-[1.6rem] font-bold">Submissions</h1>
        <p className="mt-3 text-ink-soft">You're not on a team yet. Register or join a team first.</p>
      </div>
    );
  }

  // Level 1 logic
  const l1Submitted = Boolean(team.level1?.submission_url);
  const l1OpenByAdmin = settings?.level1_open ?? true;
  const canSubmitL1 = (team.status === 'registered' || team.status === 'l1_submitted') && team.viewer_is_leader && !team.is_locked && l1OpenByAdmin;

  // Gated Progression for Level 2
  const isL1Cleared = ['l1_cleared', 'l2_submitted', 'l2_under_review', 'selected'].includes(team.status);
  const l2Submitted = Boolean(team.level2?.submission_url);
  const l2OpenByAdmin = settings?.level2_open ?? true;
  const canSubmitL2 = isL1Cleared && (team.status === 'l1_cleared' || team.status === 'l2_submitted') && team.viewer_is_leader && !team.is_locked && l2OpenByAdmin;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[1.6rem] font-bold">Team Submissions Console</h1>
      <p className="mt-2 text-ink-soft">
        Submit your Google Drive presentation deck for Level 1, and unlock Level 2 prototype submissions once cleared by the admin panel.
      </p>

      {/* Level 1 PPT Submission Box */}
      <div className="mt-8 border border-line bg-paper p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-display text-[1.1rem] font-bold">Level 1: Concept PPT Submission</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Upload your PPT to Google Drive and provide the shared link below.</p>
          </div>
          <span className={`mono text-[0.7rem] px-2.5 py-1 rounded border ${l1Submitted ? 'bg-green-700/10 border-green-700/30 text-green-700 font-bold' : 'bg-paper-3 border-line text-ink-soft'}`}>
            {l1Submitted ? '✓ PPT Submitted' : 'Pending PPT'}
          </span>
        </div>

        {!l1OpenByAdmin && (
          <div className="mt-4 rounded border border-red-700/30 bg-red-950/10 p-4 text-[0.85rem] text-red-600">
            🔒 Level 1 PPT submissions are currently closed by the admin.
          </div>
        )}

        {team.level1?.submission_url && (
          <div className="mt-4 p-3 bg-paper-2 border border-line text-[0.85rem]">
            <div className="mono text-[0.68rem] text-ink-soft">Current Submitted PPT Link:</div>
            <a
              href={team.level1.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-marigold hover:underline font-mono text-[0.82rem] break-all"
            >
              {team.level1.submission_url} ↗
            </a>
            {team.level1.score !== null && (
              <div className="mt-2 text-[0.8rem] font-bold text-green-700">
                Score: {team.level1.score}/100 — Feedback: {team.level1.feedback || 'Approved'}
              </div>
            )}
          </div>
        )}

        {canSubmitL1 && (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittingLevel(1);
              mutation.mutate(1);
            }}
          >
            <label className="grid gap-1.5 text-[0.8rem]">
              Google Drive PPT Link <span className="text-red-500 font-bold">*Must have Public/Anyone View access</span>
              <input
                type="url"
                required
                value={l1Url}
                onChange={(e) => setL1Url(e.target.value)}
                placeholder="https://docs.google.com/presentation/d/... or https://drive.google.com/file/d/..."
                className="border border-line bg-paper-2 px-4 py-3 outline-none focus-visible:border-marigold font-mono text-[0.85rem]"
              />
            </label>
            {mutation.isError && (
              <p className="text-[0.82rem] text-red-600 font-medium">
                {(mutation.error as any)?.response?.data?.detail || 'Failed to submit Level 1 link.'}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="justify-self-start"
              disabled={mutation.isPending && submittingLevel === 1}
            >
              {l1Submitted ? 'Update Level 1 PPT Link →' : 'Submit Level 1 PPT Link →'}
            </Button>
          </form>
        )}
      </div>

      {/* Level 2 Submission Box (STRICT GATED PROGRESSION) */}
      <div className="mt-8 border border-line bg-paper p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-display text-[1.1rem] font-bold">Level 2: Final Prototype & Video Submission</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Prototype demonstration and repository submission for shortlisted teams.</p>
          </div>
          <span className={`mono text-[0.7rem] px-2.5 py-1 rounded border ${isL1Cleared ? 'bg-green-700/10 border-green-700/30 text-green-700 font-bold' : 'bg-red-700/10 border-red-700/30 text-red-600 font-bold'}`}>
            {isL1Cleared ? '🔓 Unlocked' : '🔒 Locked'}
          </span>
        </div>

        {/* Gated Lock Screen */}
        {!isL1Cleared ? (
          <div className="mt-5 rounded border border-line bg-paper-2 p-6 text-center text-ink-soft">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-bold text-[0.95rem] text-ink">Level 2 is currently locked for your team</div>
            <p className="mt-2 text-[0.85rem] max-w-md mx-auto">
              If and only if your team's Level 1 PPT submission is selected and cleared by the screening panel, Level 2 details and submission options will unlock automatically here.
            </p>
          </div>
        ) : (
          <div>
            {!l2OpenByAdmin && (
              <div className="mt-4 rounded border border-red-700/30 bg-red-950/10 p-4 text-[0.85rem] text-red-600">
                🔒 Level 2 submissions are currently closed by the admin.
              </div>
            )}

            {team.level2?.submission_url && (
              <div className="mt-4 p-3 bg-paper-2 border border-line text-[0.85rem]">
                <div className="mono text-[0.68rem] text-ink-soft">Current Level 2 Submission Link:</div>
                <a
                  href={team.level2.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-marigold hover:underline font-mono text-[0.82rem] break-all"
                >
                  {team.level2.submission_url} ↗
                </a>
                {team.level2.score !== null && (
                  <div className="mt-2 text-[0.8rem] font-bold text-green-700">
                    Level 2 Score: {team.level2.score}/100 — Status: {team.status.toUpperCase()}
                  </div>
                )}
              </div>
            )}

            {canSubmitL2 && (
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmittingLevel(2);
                  mutation.mutate(2);
                }}
              >
                <label className="grid gap-1.5 text-[0.8rem]">
                  Level 2 Prototype / Video Demo Link
                  <input
                    type="url"
                    required
                    value={l2Url}
                    onChange={(e) => setL2Url(e.target.value)}
                    placeholder="https://github.com/username/project or https://youtu.be/..."
                    className="border border-line bg-paper-2 px-4 py-3 outline-none focus-visible:border-marigold font-mono text-[0.85rem]"
                  />
                </label>
                {mutation.isError && (
                  <p className="text-[0.82rem] text-red-600 font-medium">
                    {(mutation.error as any)?.response?.data?.detail || 'Failed to submit Level 2 link.'}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="justify-self-start bg-marigold border-marigold"
                  disabled={mutation.isPending && submittingLevel === 2}
                >
                  {l2Submitted ? 'Update Level 2 Link →' : 'Submit Level 2 Prototype Link →'}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
