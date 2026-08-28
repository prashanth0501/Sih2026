import React from 'react';
import type { AuditEvent, AuditFilterParams } from '../../../api/audit';
import { AuditActivityFeedTab } from './AuditActivityFeedTab';

interface Props {
  category: string;
  title: string;
  subtitle: string;
  events: AuditEvent[];
  pagination: any;
  filters: AuditFilterParams;
  onFilterChange: (newFilters: Partial<AuditFilterParams>) => void;
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
}

export const AuditSpecializedTab: React.FC<Props> = ({
  category,
  title,
  subtitle,
  events,
  pagination,
  filters,
  onFilterChange,
  isLoading,
  onSelectSession,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-[var(--color-line)] shadow-xs">
        <div className="eyebrow text-[10px]">{category} AUDIT TRAIL</div>
        <h3 className="font-serif text-lg font-bold text-[var(--color-ink)]">{title}</h3>
        <p className="font-sans text-xs text-slate-500">{subtitle}</p>
      </div>

      <AuditActivityFeedTab
        events={events}
        pagination={pagination}
        filters={{ ...filters, category }}
        onFilterChange={onFilterChange}
        isLoading={isLoading}
        onSelectSession={onSelectSession}
      />
    </div>
  );
};
