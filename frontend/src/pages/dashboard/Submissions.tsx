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
  const l1OpenByAdmin = Boolean(settings?.level1_open);
  const isL1Rejected = team.status === 'l1_rejected' || team.level1?.status === 'rejected';
  const isL1Cleared = ['l1_cleared', 'l2_submitted', 'l2_under_review', 'selected', 'passed'].includes(team.status) || team.level1?.status === 'passed';
  const canSubmitL1 = (team.status === 'registered' || team.status === 'l1_submitted') && team.viewer_is_leader && l1OpenByAdmin && !isL1Rejected;

  // Level 2 logic
  const l2Submitted = Boolean(team.level2?.submission_url);
  const l2OpenByAdmin = Boolean(settings?.level2_open);
  const isL2Rejected = team.status === 'l2_rejected' || team.level2?.status === 'rejected';
  const isSelectedFinal = team.status === 'selected' || team.level2?.status === 'passed';
  const canSubmitL2 = isL1Cleared && (team.status === 'l1_cleared' || team.status === 'l2_submitted') && team.viewer_is_leader && l2OpenByAdmin && !isL2Rejected;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[1.6rem] font-bold">Team Submissions Console</h1>
      <p className="mt-2 text-ink-soft">
        Submit your Google Drive presentation deck for Level 1, and unlock Level 2 prototype submissions once cleared by the screening panel.
      </p>

      {/* Outcome Banner — Rejected */}
      {(isL1Rejected || isL2Rejected) && (
        <div className="mt-6 rounded border border-red-700/30 bg-red-950/20 p-5 text-red-500">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>⚠️ Screening Update</span>
          </div>
          <p className="mt-2 text-sm text-red-400 font-medium">
            Sorry, your team was not selected for the next round. Better luck next time!
          </p>
          {team.level1?.feedback && (
            <div className="mt-2 mono text-xs text-red-300">
              Evaluator Feedback: {team.level1.feedback}
            </div>
          )}
        </div>
      )}

      {/* Outcome Banner — Cleared Level 1 */}
      {isL1Cleared && !isSelectedFinal && (
        <div className="mt-6 rounded border border-green-700/30 bg-green-950/20 p-5 text-green-600">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>🎉 Level 1 Cleared!</span>
          </div>
          <p className="mt-2 text-sm text-green-700 font-medium">
            Congratulations! Your team has cleared Level 1 screening and is selected to progress to Level 2!
          </p>
        </div>
      )}

      {/* Outcome Banner — Final Winner / Selected */}
      {isSelectedFinal && (
        <div className="mt-6 rounded border border-marigold/40 bg-marigold/10 p-5 text-marigold">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>🏆 Final Winner Selected!</span>
          </div>
          <p className="mt-2 text-sm text-ink font-medium">
            Congratulations! Your team has cleared all screening levels and is officially selected for SIH 2026!
          </p>
        </div>
      )}

      {/* Level 1 PPT Submission Box */}
      <div className="mt-8 border border-line bg-paper p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-display text-[1.1rem] font-bold">Level 1: Concept PPT Submission</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Upload your PPT to Google Drive and provide the shared link below.</p>
          </div>
          <span className={`mono text-[0.7rem] px-2.5 py-1 rounded border ${
            l1Submitted
              ? 'bg-green-700/10 border-green-700/30 text-green-700 font-bold'
              : 'bg-marigold/10 border-marigold/30 text-marigold font-bold'
          }`}>
            {!l1OpenByAdmin ? 'Coming Soon' : l1Submitted ? '✓ PPT Submitted' : 'Pending PPT'}
          </span>
        </div>

        {/* Level 1 Closed / Coming Soon Card */}
        {!l1OpenByAdmin && (
          <div className="mt-5 rounded border border-line bg-paper-2 p-6 text-center text-ink-soft">
            <div className="text-2xl mb-2">⏳</div>
            <div className="font-bold text-[0.95rem] text-ink">Level 1 Submissions — Coming Soon</div>
            <p className="mt-2 text-[0.85rem] max-w-md mx-auto">
              Level 1 submission window is currently closed. Admin will announce when submissions open for all teams.
            </p>
          </div>
        )}

        {/* Submitted PPT URL Preview */}
        {l1OpenByAdmin && team.level1?.submission_url && (
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
                Score: {team.level1.score}/100 {team.level1.feedback && `— Feedback: ${team.level1.feedback}`}
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {l1OpenByAdmin && canSubmitL1 && (
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
            {mutation.isError && submittingLevel === 1 && (
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
              {mutation.isPending && submittingLevel === 1 ? 'Submitting...' : l1Submitted ? 'Update Level 1 PPT Link →' : 'Submit Level 1 PPT Link →'}
            </Button>
          </form>
        )}
      </div>

      {/* Level 2 Submission Box */}
      <div className="mt-8 border border-line bg-paper p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-display text-[1.1rem] font-bold">Level 2: Final Prototype & Video Submission</h2>
            <p className="text-[0.8rem] text-ink-soft mt-0.5">Prototype demonstration and repository submission for shortlisted teams.</p>
          </div>
          <span className={`mono text-[0.7rem] px-2.5 py-1 rounded border ${isL1Cleared ? 'bg-green-700/10 border-green-700/30 text-green-700 font-bold' : 'bg-paper-3 border-line text-ink-soft'}`}>
            {!isL1Cleared ? '🔒 Locked' : !l2OpenByAdmin ? 'Coming Soon' : l2Submitted ? '✓ Submitted' : 'Pending Demo'}
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
        ) : !l2OpenByAdmin ? (
          <div className="mt-5 rounded border border-line bg-paper-2 p-6 text-center text-ink-soft">
            <div className="text-2xl mb-2">⏳</div>
            <div className="font-bold text-[0.95rem] text-ink">Level 2 Submissions — Coming Soon</div>
            <p className="mt-2 text-[0.85rem] max-w-md mx-auto">
              Level 2 submission window will be opened by the admin panel after Level 1 screening completes.
            </p>
          </div>
        ) : (
          <div>
            {team.level2?.submission_url && (
              <div className="mt-4 p-3 bg-paper-2 border border-line text-[0.85rem]">
                <div className="mono text-[0.68rem] text-ink-soft">Current Submitted Level 2 Link:</div>
                <a
                  href={team.level2.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-marigold hover:underline font-mono text-[0.82rem] break-all"
                >
                  {team.level2.submission_url} ↗
                </a>
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
                  Prototype / Demo Video Link <span className="text-red-500 font-bold">*GitHub or YouTube Link</span>
                  <input
                    type="url"
                    required
                    value={l2Url}
                    onChange={(e) => setL2Url(e.target.value)}
                    placeholder="https://github.com/... or https://youtu.be/..."
                    className="border border-line bg-paper-2 px-4 py-3 outline-none focus-visible:border-marigold font-mono text-[0.85rem]"
                  />
                </label>
                {mutation.isError && submittingLevel === 2 && (
                  <p className="text-[0.82rem] text-red-600 font-medium">
                    {(mutation.error as any)?.response?.data?.detail || 'Failed to submit Level 2 link.'}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="justify-self-start"
                  disabled={mutation.isPending && submittingLevel === 2}
                >
                  {mutation.isPending && submittingLevel === 2 ? 'Submitting...' : l2Submitted ? 'Update Level 2 Link →' : 'Submit Level 2 Link →'}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
