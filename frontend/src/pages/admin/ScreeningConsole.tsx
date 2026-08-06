import { useMemo, useState } from 'react';
import { TEAMS, type TeamRow } from '@/lib/data';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ScreeningConsole() {
  const initial = useMemo(
    () => TEAMS.filter((t) => t.status === 'l1_under_review' || t.status === 'l2_under_review').slice(0, 40),
    []
  );
  const [queue, setQueue] = useState<TeamRow[]>(initial);
  const [scores, setScores] = useState<Record<string, string>>({});

  function decide(team: TeamRow, pass: boolean) {
    const nextStatus = team.status === 'l1_under_review' ? (pass ? 'l1_cleared' : 'l1_rejected') : pass ? 'selected' : 'l2_rejected';
    setQueue((q) => q.filter((t) => t.id !== team.id));
    // In the real build: POST /teams/{id}/screening/{level}/review — this
    // just demonstrates the decision removing the team from the queue.
    void nextStatus;
  }

  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Screening console</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Teams waiting on a Level 1 or Level 2 decision. Recording a score here drives the state machine —
        matches <code className="mono rounded bg-paper-3 px-1.5 py-0.5 text-[0.78rem]">POST /teams/{'{id}'}/screening/{'{level}'}/review</code>.
      </p>

      <div className="mt-8 grid gap-4">
        {queue.length === 0 && <p className="text-ink-soft">Nothing waiting for review right now.</p>}
        {queue.map((team) => (
          <div key={team.id} className="border border-line bg-paper p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold">{team.teamName}</div>
                <div className="text-[0.82rem] text-ink-soft">
                  {team.leader} · {team.theme}
                </div>
              </div>
              <StatusBadge status={team.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Score /100"
                value={scores[team.id] ?? ''}
                onChange={(e) => setScores((s) => ({ ...s, [team.id]: e.target.value }))}
                className="w-32 border border-line bg-paper-2 px-3 py-2 text-[0.85rem] outline-none focus-visible:border-marigold"
              />
              <button
                onClick={() => decide(team, true)}
                className="mono rounded-sm border border-line px-4 py-2 text-[0.7rem] hover:border-green-700 hover:text-green-700"
              >
                Clear ✓
              </button>
              <button
                onClick={() => decide(team, false)}
                className="mono rounded-sm border border-line px-4 py-2 text-[0.7rem] hover:border-red-700 hover:text-red-700"
              >
                Reject ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
