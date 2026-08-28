import React, { useState } from 'react';
import type { AuditEvent, AuditFilterParams } from '../../../api/audit';

interface Props {
  events: AuditEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    startRow: number;
    endRow: number;
  };
  filters: AuditFilterParams;
  onFilterChange: (newFilters: Partial<AuditFilterParams>) => void;
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
}

export const AuditActivityFeedTab: React.FC<Props> = ({
  events,
  pagination,
  filters,
  onFilterChange,
  isLoading,
  onSelectSession,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  return (
    <div className="space-y-4">
      {/* Controls Strip: Search & Filter Inputs */}
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="font-mono text-xs font-bold text-slate-500">SEARCH:</span>
          <input
            type="text"
            placeholder="Search by user, email, action, IP, path..."
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ q: e.target.value, page: 1 })}
            className="w-full px-3 py-1.5 text-xs font-mono bg-[#fcf8ef] border border-slate-300 rounded-md focus:outline-none focus:border-[var(--color-marigold)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[var(--color-marigold)]"
          >
            <option value="">All Categories</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="ADMINISTRATIVE">Administrative</option>
            <option value="TEAM_OPERATIONS">Team Operations</option>
            <option value="SYSTEM_CHANGES">System Changes</option>
            <option value="SECURITY_EVENTS">Security Events</option>
            <option value="PAGE_VISITS">Page Visits</option>
            <option value="API_CALLS">API Calls</option>
          </select>

          {/* Role Filter */}
          <select
            value={filters.role || ''}
            onChange={(e) => onFilterChange({ role: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[var(--color-marigold)]"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="spoc">SPOC</option>
            <option value="coordinator">Coordinator</option>
            <option value="participant">Participant</option>
          </select>

          {/* Page Limit */}
          <select
            value={filters.limit || 25}
            onChange={(e) => onFilterChange({ limit: Number(e.target.value), page: 1 })}
            className="px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[var(--color-marigold)]"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={250}>250 per page</option>
          </select>
        </div>
      </div>

      {/* Audit Feed Table */}
      <div className="bg-white rounded-lg border border-[var(--color-line)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Time (UTC)</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource / Path</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans text-xs text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="font-mono text-xs text-slate-500">Loading audit feed data...</p>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center font-mono text-xs text-slate-500">
                    No matching audit log records found.
                  </td>
                </tr>
              ) : (
                events.map((e) => {
                  const formattedTime = new Date(e.created_at).toLocaleString([], {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className="hover:bg-[#fcf8ef] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {formattedTime}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{e.user_name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{e.user_email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-xs uppercase">
                          {e.user_role}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-[var(--color-indigo)]">
                          {e.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-[200px] truncate">
                        {e.path || e.resource_id || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {e.ip_address} ({e.country})
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                            e.status_code < 400
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {e.status_code || 200}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {e.session_id ? (
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              onSelectSession(e.session_id);
                            }}
                            className="font-mono text-[10px] font-bold text-[var(--color-marigold)] hover:underline cursor-pointer"
                          >
                            {e.session_id.slice(0, 12)}...
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination Footer */}
        <div className="px-4 py-3 bg-[#fcf8ef] border-t border-[var(--color-line)] flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-xs text-slate-600">
            Showing <span className="font-bold">{pagination.startRow}</span>–
            <span className="font-bold">{pagination.endRow}</span> of{' '}
            <span className="font-bold">{pagination.total.toLocaleString()}</span> events
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onFilterChange({ page: 1 })}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              First
            </button>
            <button
              disabled={pagination.page <= 1}
              onClick={() => onFilterChange({ page: pagination.page - 1 })}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-xs font-bold text-[var(--color-ink)]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onFilterChange({ page: pagination.page + 1 })}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onFilterChange({ page: pagination.totalPages })}
              className="px-2.5 py-1 font-mono text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Row Detail Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl border border-[var(--color-line)] p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[var(--color-marigold)]">
                  EVENT FORENSIC DETAIL
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {selectedEvent.action}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-700">
              <div>
                <span className="text-slate-400">User:</span> {selectedEvent.user_name}
              </div>
              <div>
                <span className="text-slate-400">Role:</span> {selectedEvent.user_role}
              </div>
              <div>
                <span className="text-slate-400">IP:</span> {selectedEvent.ip_address}
              </div>
              <div>
                <span className="text-slate-400">Country:</span> {selectedEvent.country}
              </div>
              <div>
                <span className="text-slate-400">Browser:</span> {selectedEvent.browser}
              </div>
              <div>
                <span className="text-slate-400">OS:</span> {selectedEvent.os}
              </div>
            </div>

            <div>
              <span className="font-mono text-xs text-slate-400">Sanitized Event Details:</span>
              <pre className="mt-1 text-xs font-mono bg-[#fcf8ef] p-3 rounded border border-slate-200 text-slate-800 overflow-x-auto max-h-48">
                {JSON.stringify(selectedEvent.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-mono font-bold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
