import React from 'react';
import { auditApi, type AuditFilterParams } from '../../../api/audit';

interface Props {
  filters: AuditFilterParams;
}

export const AuditExportControls: React.FC<Props> = ({ filters }) => {
  const handleExport = (format: 'csv' | 'json') => {
    const url = auditApi.getExportUrl(format, filters);
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('csv')}
        className="px-3 py-1.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        <span>⬇ CSV Export</span>
      </button>

      <button
        onClick={() => handleExport('json')}
        className="px-3 py-1.5 bg-white text-slate-800 border border-slate-300 font-mono text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        <span>{'{ }'} JSON Export</span>
      </button>
    </div>
  );
};
