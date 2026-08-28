import React from 'react';
import type { AuditKpisResponse } from '../../../api/audit';

interface Props {
  kpis?: AuditKpisResponse['kpis'];
  isLoading?: boolean;
}

export const AuditKpiStrip: React.FC<Props> = ({ kpis, isLoading }) => {
  const cards = [
    {
      label: 'TOTAL EVENTS',
      value: kpis?.total_events ?? 0,
      subtext: 'Recorded portal actions',
      accent: 'border-l-4 border-[var(--color-indigo)]',
    },
    {
      label: 'ACTIVE SESSIONS',
      value: kpis?.active_sessions ?? 0,
      subtext: 'Unique active (last 24h)',
      accent: 'border-l-4 border-[var(--color-marigold)]',
    },
    {
      label: 'FAILED LOGINS TODAY',
      value: kpis?.failed_logins_today ?? 0,
      subtext: 'Auth failure count',
      accent: kpis?.failed_logins_today && kpis.failed_logins_today > 0 ? 'border-l-4 border-amber-500 bg-amber-50/50' : 'border-l-4 border-slate-300',
    },
    {
      label: 'ADMIN ACTIONS TODAY',
      value: kpis?.admin_actions_today ?? 0,
      subtext: 'Staff & settings edits',
      accent: 'border-l-4 border-purple-500',
    },
    {
      label: 'TEAM ACTIONS TODAY',
      value: kpis?.team_actions_today ?? 0,
      subtext: 'Submissions & roster edits',
      accent: 'border-l-4 border-emerald-500',
    },
    {
      label: 'SECURITY ALERTS',
      value: kpis?.security_alerts ?? 0,
      subtext: 'Lockouts & threat alerts',
      accent: kpis?.security_alerts && kpis.security_alerts > 0 ? 'border-l-4 border-rose-600 bg-rose-50/50' : 'border-l-4 border-slate-300',
      badge: kpis?.security_alerts && kpis.security_alerts > 0 ? 'HIGH' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-lg p-3.5 border border-[var(--color-line)] shadow-xs transition-all hover:shadow-md ${card.accent}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {card.label}
            </span>
            {card.badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-rose-100 text-rose-700 rounded-xs">
                {card.badge}
              </span>
            )}
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--color-ink)]">
            {isLoading ? (
              <span className="inline-block w-12 h-6 bg-slate-200 animate-pulse rounded-xs" />
            ) : (
              card.value.toLocaleString()
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
};
