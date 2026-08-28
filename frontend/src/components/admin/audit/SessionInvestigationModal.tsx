import React, { useEffect, useState } from 'react';
import { auditApi, type SessionTimelineResponse } from '../../../api/audit';

interface Props {
  sessionId: string | null;
  onClose: () => void;
}

export const SessionInvestigationModal: React.FC<Props> = ({ sessionId, onClose }) => {
  const [data, setData] = useState<SessionTimelineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    auditApi
      .getSessionTimeline(sessionId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load session timeline details');
        setLoading(false);
      });
  }, [sessionId]);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fcf8ef] border border-[var(--color-line)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[var(--color-line)] flex items-center justify-between">
          <div>
            <div className="eyebrow text-xs">INVESTIGATION CONSOLE</div>
            <h2 className="font-serif text-xl font-bold text-[var(--color-ink)]">
              Session Investigation
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-0.5">
              ID: <span className="text-[var(--color-indigo)] font-bold">{sessionId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-mono text-xs text-slate-600">Gathering session forensic data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-sans text-sm">
              {error}
            </div>
          )}

          {!loading && data && (
            <>
              {/* Grid 1: Metadata Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* User Info */}
                <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
                  <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    User Information
                  </div>
                  <div className="font-sans font-bold text-sm text-[var(--color-ink)]">
                    {data.metadata.user_name}
                  </div>
                  <div className="font-mono text-xs text-slate-600 truncate">{data.metadata.user_email}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-100 text-purple-700 rounded-xs uppercase">
                      {data.metadata.user_role}
                    </span>
                    {data.metadata.department && (
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded-xs">
                        {data.metadata.department}
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Metadata */}
                <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
                  <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Session Metadata
                  </div>
                  <div className="text-xs space-y-1 font-mono text-slate-700">
                    <div>
                      <span className="text-slate-400">Login: </span>
                      {new Date(data.metadata.login_time).toLocaleTimeString()}
                    </div>
                    <div>
                      <span className="text-slate-400">Last Act: </span>
                      {new Date(data.metadata.last_activity).toLocaleTimeString()}
                    </div>
                    <div>
                      <span className="text-slate-400">Duration: </span>
                      {data.metadata.duration_seconds}s
                    </div>
                    <div>
                      <span className="text-slate-400">Total Actions: </span>
                      <span className="font-bold text-[var(--color-marigold)]">
                        {data.metadata.total_actions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
                  <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Network Info
                  </div>
                  <div className="text-xs space-y-1 font-mono text-slate-700">
                    <div>
                      <span className="text-slate-400">IP: </span>
                      <span className="font-bold text-[var(--color-ink)]">{data.metadata.ip_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Country: </span>
                      {data.metadata.country}
                    </div>
                    {data.metadata.city && (
                      <div>
                        <span className="text-slate-400">City: </span>
                        {data.metadata.city}
                      </div>
                    )}
                    {data.metadata.isp && (
                      <div className="truncate">
                        <span className="text-slate-400">ISP: </span>
                        {data.metadata.isp}
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Info */}
                <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
                  <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Device Info
                  </div>
                  <div className="text-xs space-y-1 font-mono text-slate-700">
                    <div>
                      <span className="text-slate-400">Browser: </span>
                      {data.metadata.browser} {data.metadata.browser_version}
                    </div>
                    <div>
                      <span className="text-slate-400">OS: </span>
                      {data.metadata.os} {data.metadata.os_version}
                    </div>
                    <div>
                      <span className="text-slate-400">Device: </span>
                      {data.metadata.device_type}
                    </div>
                    {data.metadata.screen_resolution && (
                      <div>
                        <span className="text-slate-400">Screen: </span>
                        {data.metadata.screen_resolution}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="bg-white rounded-lg border border-[var(--color-line)] p-5 shadow-xs">
                <h3 className="font-mono text-xs font-bold uppercase text-[var(--color-ink)] tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Chronological Session Timeline ({data.timeline.length} Events)
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {data.timeline.map((item, idx) => {
                    const timeStr = new Date(item.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <div key={item.id || idx} className="relative flex items-start group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white bg-[var(--color-marigold)] shadow-xs group-hover:scale-125 transition-transform" />
                        <div className="w-full bg-[#fcf8ef] p-3 rounded-md border border-slate-200/80">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {timeStr}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded-xs uppercase">
                                {item.action}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-100 text-purple-700 rounded-xs">
                                {item.action_category}
                              </span>
                            </div>
                            {item.status_code && (
                              <span
                                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                                  item.status_code < 400
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                HTTP {item.status_code}
                              </span>
                            )}
                          </div>

                          {item.path && (
                            <div className="font-mono text-xs text-slate-600 mb-1">
                              <span className="font-bold text-slate-800">{item.http_method}</span>{' '}
                              {item.path}
                            </div>
                          )}

                          {item.details && Object.keys(item.details).length > 0 && (
                            <pre className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 overflow-x-auto">
                              {JSON.stringify(item.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-[var(--color-line)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-mono font-bold rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
