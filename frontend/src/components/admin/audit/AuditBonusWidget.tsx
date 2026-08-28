import React from 'react';
import type { AuditKpisResponse } from '../../../api/audit';

interface Props {
  analytics?: AuditKpisResponse['analytics'];
  isLoading?: boolean;
}

export const AuditBonusWidget: React.FC<Props> = ({ analytics, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Top Active Users */}
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="font-mono text-xs font-bold text-slate-700 uppercase">
            Most Active Staff / Users
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-100 text-purple-700 rounded font-bold">
            TOP 5
          </span>
        </div>
        {isLoading ? (
          <div className="py-6 text-center text-xs font-mono text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-2.5">
            {analytics?.top_users?.map((u, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono text-xs">
                <div className="truncate max-w-[180px]">
                  <div className="font-bold text-slate-900 truncate">{u.user_name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{u.user_email}</div>
                </div>
                <span className="px-2 py-1 bg-[#fcf8ef] text-[var(--color-ink)] font-bold rounded border border-slate-200">
                  {u.action_count} acts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top IP Addresses */}
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="font-mono text-xs font-bold text-slate-700 uppercase">
            Top Request IP Addresses
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-700 rounded font-bold">
            NETWORK
          </span>
        </div>
        {isLoading ? (
          <div className="py-6 text-center text-xs font-mono text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-2.5">
            {analytics?.top_ips?.map((ip, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono text-xs">
                <div>
                  <div className="font-bold text-slate-900">{ip.ip_address}</div>
                  <div className="text-[10px] text-slate-400">Country: {ip.country}</div>
                </div>
                <span className="px-2 py-1 bg-[#fcf8ef] text-[var(--color-indigo)] font-bold rounded border border-slate-200">
                  {ip.count} reqs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Browsers */}
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="font-mono text-xs font-bold text-slate-700 uppercase">
            User Agent / Browsers
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-700 rounded font-bold">
            CLIENTS
          </span>
        </div>
        {isLoading ? (
          <div className="py-6 text-center text-xs font-mono text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-2.5">
            {analytics?.top_browsers?.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono text-xs">
                <div className="font-bold text-slate-900">{b.browser}</div>
                <span className="px-2 py-1 bg-[#fcf8ef] text-[var(--color-marigold)] font-bold rounded border border-slate-200">
                  {b.count} sessions
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
