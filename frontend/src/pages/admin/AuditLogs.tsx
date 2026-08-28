import React, { useState, useEffect } from 'react';
import { auditApi, type AuditEvent, type AuditFilterParams, type AuditKpisResponse } from '../../api/audit';
import { AuditKpiStrip } from '../../components/admin/audit/AuditKpiStrip';
import { AuditActivityFeedTab } from '../../components/admin/audit/AuditActivityFeedTab';
import { AuditSessionsTab } from '../../components/admin/audit/AuditSessionsTab';
import { AuditSpecializedTab } from '../../components/admin/audit/AuditSpecializedTab';
import { SessionInvestigationModal } from '../../components/admin/audit/SessionInvestigationModal';
import { AuditExportControls } from '../../components/admin/audit/AuditExportControls';
import { AuditBonusWidget } from '../../components/admin/audit/AuditBonusWidget';

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('activity');
  const [kpisData, setKpisData] = useState<AuditKpisResponse | undefined>(undefined);
  const [isKpiLoading, setIsKpiLoading] = useState<boolean>(true);

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
    startRow: 0,
    endRow: 0,
  });
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<AuditFilterParams>({
    page: 1,
    limit: 25,
    q: '',
    category: '',
    role: '',
  });

  const [investigatingSessionId, setInvestigatingSessionId] = useState<string | null>(null);

  // Track page visit on mount
  useEffect(() => {
    auditApi.trackPageVisit({ path: '/admin/audit-logs' });
  }, []);

  // Fetch KPI statistics
  useEffect(() => {
    setIsKpiLoading(true);
    auditApi
      .getKpis()
      .then((res) => {
        setKpisData(res);
        setIsKpiLoading(false);
      })
      .catch(() => setIsKpiLoading(false));
  }, []);

  // Fetch audit feed based on current filters and active tab category mapping
  const fetchFeed = () => {
    setIsFeedLoading(true);

    const activeFilters: AuditFilterParams = { ...filters };
    if (activeTab === 'authentication') activeFilters.category = 'AUTHENTICATION';
    else if (activeTab === 'administrative') activeFilters.category = 'ADMINISTRATIVE';
    else if (activeTab === 'team_operations') activeFilters.category = 'TEAM_OPERATIONS';
    else if (activeTab === 'system_changes') activeFilters.category = 'SYSTEM_CHANGES';
    else if (activeTab === 'security_events') activeFilters.category = 'SECURITY_EVENTS';

    auditApi
      .getFeed(activeFilters)
      .then((res) => {
        setEvents(res.events);
        setPagination(res.pagination);
        setIsFeedLoading(false);
      })
      .catch(() => setIsFeedLoading(false));
  };

  useEffect(() => {
    if (activeTab !== 'sessions') {
      fetchFeed();
    }
  }, [filters, activeTab]);

  const handleFilterChange = (newFilters: Partial<AuditFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const tabs = [
    { id: 'activity', label: '1. Activity Feed' },
    { id: 'sessions', label: '2. Sessions' },
    { id: 'authentication', label: '3. Authentication' },
    { id: 'administrative', label: '4. Administrative Actions' },
    { id: 'team_operations', label: '5. Team Operations' },
    { id: 'system_changes', label: '6. System Changes' },
    { id: 'security_events', label: '7. Security Events' },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8ef] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header matching Ignite Eyebrow & Lede Pattern */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-line)] pb-6">
          <div>
            <div className="eyebrow">SECURITY CENTER</div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--color-ink)] mt-1">
              Audit Logs
            </h1>
            <p className="lede mt-2 max-w-2xl">
              Complete visibility into portal activity, sessions, authentication events and administrator actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AuditExportControls filters={filters} />
          </div>
        </div>

        {/* Top KPI Indicator Strip */}
        <AuditKpiStrip kpis={kpisData?.kpis} isLoading={isKpiLoading} />

        {/* 7 Tab Navigation Bar */}
        <div className="border-b border-[var(--color-line)] bg-white rounded-lg p-1.5 shadow-xs overflow-x-auto">
          <nav className="flex space-x-1 min-w-max" aria-label="Audit Center Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3.5 py-2 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-marigold)] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab 1: Activity Feed */}
        {activeTab === 'activity' && (
          <AuditActivityFeedTab
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 2: Sessions */}
        {activeTab === 'sessions' && (
          <AuditSessionsTab
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 3: Authentication */}
        {activeTab === 'authentication' && (
          <AuditSpecializedTab
            category="AUTHENTICATION"
            title="Authentication & Session Security Audit"
            subtitle="Successful logins, failed login attempts, password reset requests, and email verifications."
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 4: Administrative Actions */}
        {activeTab === 'administrative' && (
          <AuditSpecializedTab
            category="ADMINISTRATIVE"
            title="Administrative & Staff Action Audit"
            subtitle="Role changes, user account enable/disable, admin password resets, and policy modifications."
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 5: Team Operations */}
        {activeTab === 'team_operations' && (
          <AuditSpecializedTab
            category="TEAM_OPERATIONS"
            title="Team & Student Roster Audit"
            subtitle="Team creations, roster modifications, Level 1/Level 2 submission uploads, and screening reviews."
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 6: System Changes */}
        {activeTab === 'system_changes' && (
          <AuditSpecializedTab
            category="SYSTEM_CHANGES"
            title="System & Portal Configuration Audit"
            subtitle="Registration stage toggles, Level 1/2 screening toggles, announcement broadcasts, and promo posts."
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Tab 7: Security Events */}
        {activeTab === 'security_events' && (
          <AuditSpecializedTab
            category="SECURITY_EVENTS"
            title="Security Events & Threat Alerts"
            subtitle="Failed login spikes, account lockouts, privilege escalation alerts, and suspicious IP access."
            events={events}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isFeedLoading}
            onSelectSession={(sid) => setInvestigatingSessionId(sid)}
          />
        )}

        {/* Analytics Widgets (Most Active Users, IPs, Browsers) */}
        <AuditBonusWidget
          analytics={kpisData?.analytics}
          isLoading={isKpiLoading}
        />

        {/* Session Investigation Modal */}
        <SessionInvestigationModal
          sessionId={investigatingSessionId}
          onClose={() => setInvestigatingSessionId(null)}
        />
      </div>
    </div>
  );
};
