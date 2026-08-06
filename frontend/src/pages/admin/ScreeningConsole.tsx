import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllTeams, reviewScreening, type ApiTeam } from '@/api/teams';
import { getSystemSettings, updateSystemSettings } from '@/api/settings';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { type ScreeningStatus } from '@/lib/data';

export function ScreeningConsole() {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'cleared' | 'rejected'>('pending');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['screening-teams'],
    queryFn: () => listAllTeams({ page_size: 200 }),
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

  // Queues
  const pendingQueue = teams.filter((t) =>
    ['l1_submitted', 'l1_under_review', 'l2_submitted', 'l2_under_review'].includes(t.status)
  );

  const clearedTeams = teams.filter((t) =>
    ['l1_cleared', 'l2_submitted', 'l2_under_review', 'selected'].includes(t.status)
  );

  const rejectedTeams = teams.filter((t) =>
    ['l1_rejected', 'l2_rejected'].includes(t.status)
  );

  function handleDecision(team: ApiTeam, pass: boolean) {
    const level: 1 | 2 = team.status.startsWith('l2') ? 2 : 1;
    const score = scores[team.id] ?? 85;
    const feedback = feedbacks[team.id] || (pass ? 'PPT and proposal selected for next round.' : 'Not selected.');

    reviewMutation.mutate({
      teamId: team.id,
      level,
      score,
      feedback,
      pass,
    });
  }

  const displayedList =
    activeTab === 'pending'
      ? pendingQueue
      : activeTab === 'cleared'
      ? clearedTeams
      : rejectedTeams;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Screening & Evaluation Console</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Evaluate Google Drive PPT links, assign scores, and select teams for Level 2 in real-time.
          </p>
        </div>
        <span className="mono rounded bg-paper-3 px-3 py-1 text-[0.7rem] text-marigold border border-line">
          {isLoading ? 'Refreshing...' : '● Live Database'}
        </span>
      </div>

      {/* ADMIN CONTROL TOGGLES (Registration, Level 1, Level 2) */}
      <div className="mt-6 border border-marigold/40 bg-paper p-5">
        <div className="mono text-[0.72rem] text-marigold font-bold uppercase tracking-wider mb-3">
          ⚡ Admin Portal Control Toggles
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Registration Toggle */}
          <div className="flex items-center justify-between border border-line bg-paper-2 p-3">
            <div>
              <div className="font-bold text-[0.85rem]">Student Registration</div>
              <div className="text-[0.72rem] text-ink-soft">
                {settings?.registration_open ? 'Currently Accepting Teams' : 'Registration Paused'}
              </div>
            </div>
            <button
              onClick={() => toggleMutation.mutate({ registration_open: !settings?.registration_open })}
              disabled={toggleMutation.isPending}
              className={`mono rounded px-3 py-1.5 text-[0.72rem] font-bold transition-colors ${
                settings?.registration_open
                  ? 'bg-green-700 text-paper hover:bg-green-800'
                  : 'bg-red-700 text-paper hover:bg-red-800'
              }`}
            >
              {settings?.registration_open ? 'OPEN ✓' : 'CLOSED ✕'}
            </button>
          </div>

          {/* Level 1 PPT Submission Toggle */}
          <div className="flex items-center justify-between border border-line bg-paper-2 p-3">
            <div>
              <div className="font-bold text-[0.85rem]">Level 1 PPT Submission</div>
              <div className="text-[0.72rem] text-ink-soft">
                {settings?.level1_open ? 'Accepting PPT Decks' : 'L1 Submissions Closed'}
              </div>
            </div>
            <button
              onClick={() => toggleMutation.mutate({ level1_open: !settings?.level1_open })}
              disabled={toggleMutation.isPending}
              className={`mono rounded px-3 py-1.5 text-[0.72rem] font-bold transition-colors ${
                settings?.level1_open
                  ? 'bg-green-700 text-paper hover:bg-green-800'
                  : 'bg-red-700 text-paper hover:bg-red-800'
              }`}
            >
              {settings?.level1_open ? 'OPEN ✓' : 'CLOSED ✕'}
            </button>
          </div>

          {/* Level 2 Prototype Submission Toggle */}
          <div className="flex items-center justify-between border border-line bg-paper-2 p-3">
            <div>
              <div className="font-bold text-[0.85rem]">Level 2 Submission</div>
              <div className="text-[0.72rem] text-ink-soft">
                {settings?.level2_open ? 'Accepting Prototypes' : 'L2 Submissions Closed'}
              </div>
            </div>
            <button
              onClick={() => toggleMutation.mutate({ level2_open: !settings?.level2_open })}
              disabled={toggleMutation.isPending}
              className={`mono rounded px-3 py-1.5 text-[0.72rem] font-bold transition-colors ${
                settings?.level2_open
                  ? 'bg-green-700 text-paper hover:bg-green-800'
                  : 'bg-red-700 text-paper hover:bg-red-800'
              }`}
            >
              {settings?.level2_open ? 'OPEN ✓' : 'CLOSED ✕'}
            </button>
          </div>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-line pb-3 text-[0.82rem] mono">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'pending'
              ? 'bg-marigold text-paper font-bold'
              : 'bg-paper border border-line text-ink-soft hover:text-ink'
          }`}
        >
          Pending Evaluation ({pendingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('cleared')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'cleared'
              ? 'bg-green-700 text-paper font-bold'
              : 'bg-paper border border-line text-ink-soft hover:text-green-700'
          }`}
        >
          ✓ Selected / Cleared ({clearedTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded transition-colors ${
            activeTab === 'rejected'
              ? 'bg-red-700 text-paper font-bold'
              : 'bg-paper border border-line text-ink-soft hover:text-red-700'
          }`}
        >
          ✕ Not Selected ({rejectedTeams.length})
        </button>
      </div>

      {/* Team Cards Queue */}
      <div className="mt-6 grid gap-4">
        {displayedList.length === 0 && (
          <div className="border border-line bg-paper p-8 text-center text-ink-soft">
            No teams in this category right now.
          </div>
        )}

        {displayedList.map((team) => {
          const isPending = ['l1_submitted', 'l1_under_review', 'l2_submitted', 'l2_under_review'].includes(team.status);
          const level: 1 | 2 = team.status.startsWith('l2') ? 2 : 1;
          const roundData = level === 1 ? team.level1 : team.level2;
          const pptUrl = roundData?.submission_url;

          return (
            <div key={team.id} className="border border-line bg-paper p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl">{team.name}</span>
                    <StatusBadge status={team.status as ScreeningStatus} />
                  </div>
                  <div className="text-[0.82rem] text-ink-soft mt-1">
                    Theme: <strong className="text-ink">{team.theme || 'General'}</strong> · Members Count: {team.members?.length + 1}
                  </div>

                  {/* Team Members & GitHub Profile URLs */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[0.75rem] mono">
                    {team.members?.map((m, i) => (
                      <span key={i} className="rounded bg-paper-2 border border-line px-2 py-1">
                        {m.name} ({m.department})
                        {m.github_url && (
                          <a
                            href={m.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-marigold hover:underline"
                          >
                            [GitHub ↗]
                          </a>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PROMINENT EXTERNAL GOOGLE DRIVE PPT LINK BUTTON */}
                {pptUrl ? (
                  <a
                    href={pptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded bg-marigold px-4 py-2.5 font-mono text-[0.8rem] font-bold text-paper transition-transform hover:scale-105 shadow-md"
                  >
                    📂 Open PPT in Google Drive ↗
                  </a>
                ) : (
                  <span className="mono text-[0.75rem] text-ink-soft italic">No PPT link submitted</span>
                )}
              </div>

              {/* EVALUATION & SCORING CONTROLS */}
              {isPending && (
                <div className="mt-5 border-t border-line pt-4 bg-paper-2 p-4 rounded">
                  <div className="mono text-[0.72rem] text-marigold font-bold mb-3 uppercase">
                    Level {level} PPT Scoring & Selection Controls
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="mono text-[0.78rem]">Score (0-100):</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={scores[team.id] ?? 85}
                        onChange={(e) => setScores((s) => ({ ...s, [team.id]: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-line bg-paper px-3 py-1.5 text-[0.88rem] font-bold outline-none focus-visible:border-marigold"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Feedback notes for the team..."
                      value={feedbacks[team.id] ?? ''}
                      onChange={(e) => setFeedbacks((f) => ({ ...f, [team.id]: e.target.value }))}
                      className="flex-1 min-w-[220px] border border-line bg-paper px-3 py-1.5 text-[0.85rem] outline-none focus-visible:border-marigold"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        disabled={reviewMutation.isPending}
                        onClick={() => handleDecision(team, true)}
                        className="mono rounded bg-green-700 px-4 py-2 text-[0.78rem] font-bold text-paper hover:bg-green-800 transition-colors disabled:opacity-50"
                      >
                        SELECT / CLEAR LEVEL {level} ✓
                      </button>
                      <button
                        disabled={reviewMutation.isPending}
                        onClick={() => handleDecision(team, false)}
                        className="mono rounded bg-red-700 px-4 py-2 text-[0.78rem] font-bold text-paper hover:bg-red-800 transition-colors disabled:opacity-50"
                      >
                        REJECT ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
