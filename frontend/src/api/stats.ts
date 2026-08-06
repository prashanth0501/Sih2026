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
