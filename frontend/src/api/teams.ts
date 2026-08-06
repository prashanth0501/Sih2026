import { api } from './client';

export type ApiTeamMember = {
  name: string;
  email: string;
  department: string;
  year: number;
  role: string;
  github_url?: string;
};

export type ApiScreeningRound = {
  status: string;
  score: number | null;
  feedback: string | null;
  submission_url: string | null;
};

export type ApiTeam = {
  id: string;
  name: string;
  leader_id: string;
  theme: string | null;
  members: ApiTeamMember[];
  status: string;
  is_locked: boolean;
  viewer_is_leader: boolean;
  level1: ApiScreeningRound;
  level2: ApiScreeningRound;
};

export async function createTeam(input: { name: string; theme?: string; members?: ApiTeamMember[] }) {
  const { data } = await api.post<ApiTeam>('/teams', {
    name: input.name,
    theme: input.theme || null,
    members: input.members || [],
  });
  return data;
}

export async function getMyTeam() {
  const { data } = await api.get<ApiTeam>('/teams/mine');
  return data;
}

export async function addTeamMember(teamId: string, member: ApiTeamMember) {
  const { data } = await api.post<ApiTeam>(`/teams/${teamId}/members`, member);
  return data;
}

export async function removeTeamMember(teamId: string, email: string) {
  const { data } = await api.delete<ApiTeam>(`/teams/${teamId}/members/${encodeURIComponent(email)}`);
  return data;
}

export async function listAllTeams(params?: { status?: string; q?: string; page?: number; page_size?: number }) {
  const { data } = await api.get<ApiTeam[]>('/teams', { params });
  return data;
}

export async function setTeamLock(teamId: string, locked: boolean) {
  const { data } = await api.patch<ApiTeam>(`/teams/${teamId}/lock`, { locked });
  return data;
}

export async function submitLevel(teamId: string, level: 1 | 2, submission_url: string) {
  const { data } = await api.post<ApiTeam>(`/teams/${teamId}/submissions`, { level, submission_url });
  return data;
}

export async function reviewScreening(teamId: string, level: 1 | 2, input: { score: number; feedback?: string; pass: boolean }) {
  const { data } = await api.post<ApiTeam>(`/teams/${teamId}/screening/${level}/review`, {
    score: input.score,
    feedback: input.feedback || '',
    pass: input.pass,
  });
  return data;
}
