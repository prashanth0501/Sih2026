import { api } from './client';

export type PublicStats = {
  teams_registered: number;
  ideas_submitted: number;
  problem_statements: number;
  days_to_deadline: number;
};

export type AdminStats = {
  total_teams: number;
  total_students: number;
  by_stage: {
    registered: number;
    level1: number;
    level2: number;
    selected: number;
  };
  selected: number;
};

export async function getPublicStats() {
  const { data } = await api.get<PublicStats>('/stats/public');
  return data;
}

export async function getAdminStats() {
  const { data } = await api.get<AdminStats>('/stats/admin');
  return data;
}

export async function downloadDatabaseBackup() {
  const { data } = await api.get('/admin/backup-database');
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SIH_2026_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return data;
}
