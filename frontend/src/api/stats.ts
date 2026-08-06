import { api } from './client';

export type PublicStats = {
  teams_registered: number;
  ideas_submitted: number;
  problem_statements: number;
  days_to_deadline: number;
};

export async function getPublicStats() {
  const { data } = await api.get<PublicStats>('/stats/public');
  return data;
}
