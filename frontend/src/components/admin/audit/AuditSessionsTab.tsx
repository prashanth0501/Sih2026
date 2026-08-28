import React, { useState, useEffect } from 'react';
import { auditApi, type AuditSession } from '../../../api/audit';

interface Props {
  onSelectSession: (sessionId: string) => void;
}

export const AuditSessionsTab: React.FC<Props> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<AuditSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const limit = 25;
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');

  const fetchSessions = () => {
    setLoading(true);
    auditApi
      .getSessions({ page, limit, q: search })
      .then((res) => {
        setSessions(res.sessions);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, [page, limit, search]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono text-xs font-bold text-slate-500">SEARCH SESSIONS:</span>
          <input
            type="text"
            placeholder="Search by user, email, session ID, IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-3 py-1.5 text-xs font-mono bg-[#fcf8ef] border border-slate-300 rounded-md focus:outline-none focus:border-[var(--color-marigold)]"
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg border border-[var(--color-line)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Login Time</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Device / OS</th>
                <th className="py-3 px-4">Location & IP</th>
                <th className="py-3 px-4">Actions</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans text-xs text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="font-mono text-xs text-slate-500">Aggregating session metrics...</p>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center font-mono text-xs text-slate-500">
                    No active or historical user sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.session_id}
                    onClick={() => onSelectSession(s.session_id)}
                    className="hover:bg-[#fcf8ef] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-[var(--color-indigo)] whitespace-nowrap">
                      {s.session_id.slice(0, 14)}...
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.user_name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{s.user_email}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-xs uppercase">
                        {s.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(s.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(s.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                      {s.duration_text}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {s.browser} / {s.os}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {s.ip_address} ({s.country})
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-[var(--color-marigold)]">
                      {s.action_count}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#fcf8ef] border-t border-[var(--color-line)] flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-xs text-slate-600">
            Total Sessions: <span className="font-bold">{total.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              First
            </button>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-xs font-bold text-[var(--color-ink)]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
