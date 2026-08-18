import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, reviewScreening, type ApiTeam } from '@/api/teams';
import { getSystemSettings, updateSystemSettings } from '@/api/settings';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { type ScreeningStatus } from '@/lib/data';
import { Button } from '@/components/ui/Button';

type SettingKey = 'registration_open' | 'level1_open' | 'level2_open';

const SETTING_LABELS: Record<SettingKey, { title: string; desc: string }> = {
  registration_open: {
    title: 'Student Registration',
    desc: 'Accepting new team registrations on portal',
  },
  level1_open: {
    title: 'Level 1 PPT Submission',
    desc: 'Accepting Level 1 presentation deck links',
  },
  level2_open: {
    title: 'Level 2 Prototype Submission',
    desc: 'Accepting Level 2 prototype demo links',
  },
};

export function ScreeningConsole() {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'cleared' | 'rejected'>('all');

  // Confirmation modal state
  const [confirmingSetting, setConfirmingSetting] = useState<{
    key: SettingKey;
    targetState: boolean;
  } | null>(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['screening-teams'],
    queryFn: () => listAllTeams({ page_size: 500 }),
    refetchInterval: 4000,
  });

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: getSystemSettings,
  });

  const toggleMutation = useMutation({
    mutationFn: (updates: { registration_open?: boolean; level1_open?: boolean; level2_open?: boolean }) =>
      updateSystemSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setConfirmingSetting(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ teamId, level, score, feedback, pass }: { teamId: string; level: 1 | 2; score: number; feedback: string; pass: boolean }) =>
      reviewScreening(teamId, level, { score, feedback, pass }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening-teams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-teams-registrations'] });
    },
  });

  // Filter Queues
  const pendingQueue = teams.filter((t) =>
    ['registered', 'l1_submitted', 'l1_under_review', 'l2_submitted', 'l2_under_review'].includes(t.status)
  );

  const clearedTeams = teams.filter((t) =>
    ['l1_cleared', 'l2_submitted', 'l2_under_review', 'selected'].includes(t.status)
  );

  const rejectedTeams = teams.filter((t) =>
    ['l1_rejected', 'l2_rejected'].includes(t.status)
  );

  const displayedList =
    activeTab === 'all'
      ? teams
      : activeTab === 'pending'
      ? pendingQueue
      : activeTab === 'cleared'
      ? clearedTeams
      : rejectedTeams;

  function handleDecision(team: ApiTeam, pass: boolean) {
    const level: 1 | 2 = team.status.startsWith('l2') ? 2 : 1;
    const score = scores[team.id] ?? 85;
    const feedback = feedbacks[team.id] || (pass ? 'Approved for next stage.' : 'Not selected.');

    reviewMutation.mutate({
      teamId: team.id,
      level,
      score,
      feedback,
      pass,
    });
  }

  const executeConfirmedToggle = () => {
    if (!confirmingSetting) return;
    const { key, targetState } = confirmingSetting;
    toggleMutation.mutate({ [key]: targetState });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Screening &amp; Evaluation Console</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Control portal submissions and evaluate Level 1 PPT decks and Level 2 prototypes in real-time.
          </p>
        </div>
        <span className="font-mono rounded-full bg-paper px-3 py-1 text-xs font-semibold text-marigold border border-line">
          {isLoading ? 'Refreshing...' : '● Live Database'}
        </span>
      </div>

      {/* PORTAL CONTROL TOGGLES (Minimalistic Card Grid) */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-4">
          Portal Stage &amp; Registration Control Toggles
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {(['registration_open', 'level1_open', 'level2_open'] as SettingKey[]).map((key) => {
            const isOpen = Boolean(settings?.[key]);
            const info = SETTING_LABELS[key];

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-2 p-4 transition-colors hover:border-marigold/40"
              >
                <div>
                  <div className="font-bold text-sm text-ink">{info.title}</div>
                  <div className="text-xs text-ink-soft mt-0.5">{isOpen ? info.desc : 'Submissions Closed'}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmingSetting({ key, targetState: !isOpen })}
                  className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    isOpen
                      ? 'bg-green-700 text-white hover:bg-green-800 shadow-xs'
                      : 'bg-red-700 text-white hover:bg-red-800 shadow-xs'
                  }`}
                >
                  {isOpen ? 'OPEN ✓' : 'CLOSED ✕'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-ink text-paper'
              : 'bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line'
          }`}
        >
          All Teams ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'bg-marigold text-paper font-bold'
              : 'bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line'
          }`}
        >
          Pending Review ({pendingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('cleared')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'cleared'
              ? 'bg-green-700 text-paper font-bold'
              : 'bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line'
          }`}
        >
          ✓ Cleared / Selected ({clearedTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'rejected'
              ? 'bg-red-700 text-paper font-bold'
              : 'bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line'
          }`}
        >
          ✕ Rejected ({rejectedTeams.length})
        </button>
      </div>

      {/* EVALUATION QUEUE & PPT SUBMISSIONS LIST */}
      <div className="space-y-4">
        {displayedList.length === 0 && (
          <div className="rounded-2xl border border-line bg-paper p-12 text-center text-sm text-ink-soft">
            No teams found in this category.
          </div>
        )}

        {displayedList.map((team) => {
          const level: 1 | 2 = team.status.startsWith('l2') ? 2 : 1;
          const roundData = level === 1 ? team.level1 : team.level2;
          const pptUrl = roundData?.submission_url || team.level1?.submission_url;
          const isPending = ['registered', 'l1_submitted', 'l1_under_review', 'l2_submitted', 'l2_under_review'].includes(team.status);

          return (
            <div
              key={team.id}
              className="rounded-2xl border border-line bg-paper p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-ink">{team.name}</h3>
                    <StatusBadge status={team.status as ScreeningStatus} />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
                    <span>
                      Problem ID: <strong className="font-mono text-marigold">{team.problem_statement_id || 'Not Selected'}</strong>
                    </span>
                    <span>
                      Theme: <strong className="text-ink">{team.theme || 'General'}</strong>
                    </span>
                    <span>
                      Members: <strong className="text-ink">{team.members?.length || 0}</strong>
                    </span>
                  </div>

                  {/* Team Members */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {team.members?.map((m, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper-2 px-2.5 py-1 text-xs text-ink-soft"
                      >
                        <span className="font-medium text-ink">{m.name}</span>
                        {m.role === 'leader' && <span className="text-[0.65rem] font-bold text-marigold">(Leader)</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PPT LINK BUTTON */}
                {pptUrl ? (
                  <a
                    href={pptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-marigold px-4 py-2.5 font-mono text-xs font-bold text-paper transition-transform hover:scale-105 shadow-xs"
                  >
                    📂 View Level 1 PPT Deck ↗
                  </a>
                ) : (
                  <span className="rounded-xl border border-line bg-paper-2 px-3 py-2 text-xs text-ink-soft italic">
                    No PPT deck submitted yet
                  </span>
                )}
              </div>

              {/* EVALUATION FORM */}
              {isPending && (
                <div className="mt-5 rounded-xl border border-line bg-paper-2 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-marigold mb-3">
                    Screening Decision &amp; Feedback
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-ink-soft">Score (0-100):</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={scores[team.id] ?? 85}
                        onChange={(e) => setScores((s) => ({ ...s, [team.id]: parseInt(e.target.value) || 0 }))}
                        className="w-20 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-marigold"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Optional feedback notes for team..."
                      value={feedbacks[team.id] ?? ''}
                      onChange={(e) => setFeedbacks((f) => ({ ...f, [team.id]: e.target.value }))}
                      className="flex-1 min-w-[200px] rounded-lg border border-line bg-paper px-3 py-1.5 text-xs text-ink outline-none focus:border-marigold"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => handleDecision(team, true)}
                        className="rounded-lg bg-green-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-800 transition-colors disabled:opacity-50"
                      >
                        Approve &amp; Pass Level {level} ✓
                      </button>
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => handleDecision(team, false)}
                        className="rounded-lg bg-red-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-800 transition-colors disabled:opacity-50"
                      >
                        Reject ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TWO-FACTOR CONFIRMATION MODAL FOR CONTROL TOGGLES */}
      {confirmingSetting && (
        <div
          onClick={() => setConfirmingSetting(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-ink">Confirm Setting Change</h3>
              <button
                onClick={() => setConfirmingSetting(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-xs font-bold text-ink hover:bg-paper-2"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-ink-soft">
              Are you sure you want to change{' '}
              <strong className="text-ink">{SETTING_LABELS[confirmingSetting.key].title}</strong> to{' '}
              <strong className={confirmingSetting.targetState ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                {confirmingSetting.targetState ? 'OPEN' : 'CLOSED'}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button type="button" variant="ghost" onClick={() => setConfirmingSetting(null)}>
                Cancel
              </Button>
              <button
                type="button"
                disabled={toggleMutation.isPending}
                onClick={executeConfirmedToggle}
                className={`rounded-xl px-4 py-2 font-mono text-xs font-bold text-white shadow-xs ${
                  confirmingSetting.targetState ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {toggleMutation.isPending ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
