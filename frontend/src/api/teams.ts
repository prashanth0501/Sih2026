import { api } from './client';

export type ApiTeamMember = {
  id?: string;
  name: string;
  email: string;
  usn: string;
  department: string;
  year: number;
  role: string;
  gender: string;
  github_url?: string;
  is_registered_user?: boolean;
  has_whitespace?: boolean;
};

export type ApiScreeningRound = {
  status: string;
  score: number | null;
  feedback: string | null;
  submission_url: string | null;
};

export type ApiDataIntegrity = {
  flags: string[];
  findings: string[];
  is_valid: boolean;
  registered_members_count: number;
  pending_members_count: number;
  has_duplicate_leader: boolean;
  is_test_record: boolean;
};

export type ApiTeam = {
  id: string;
  name: string;
  leader_id: string;
  leader_usn?: string;
  theme: string | null;
  problem_statement_id?: string | null;
  members: ApiTeamMember[];
  status: string;
  is_locked: boolean;
  viewer_is_leader: boolean;
  level1: ApiScreeningRound;
  level2: ApiScreeningRound;
  data_integrity?: ApiDataIntegrity;
  created_at?: string;
  updated_at?: string;
};

export type ApiDeletedTeam = {
  id: string;
  original_id: string;
  name: string;
  leader_usn: string;
  theme: string | null;
  deleted_by: string;
  deleted_at: string;
  reason: string | null;
  audit_reference: string | null;
  members: ApiTeamMember[];
};

export async function createTeam(input: {
  name: string;
  theme?: string;
  problem_statement_id?: string;
  leader_usn?: string;
  leader_github_url?: string;
  members?: ApiTeamMember[];
}) {
  const { data } = await api.post<ApiTeam>('/teams', {
    name: input.name,
    theme: input.theme || null,
    problem_statement_id: input.problem_statement_id || null,
    leader_usn: input.leader_usn || '',
    leader_github_url: input.leader_github_url || '',
    members: input.members || [],
  });
  return data;
}

export async function getMyTeam(): Promise<ApiTeam | null> {
  try {
    const { data } = await api.get<ApiTeam>('/teams/mine');
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function addTeamMember(teamId: string, member: ApiTeamMember) {
  const { data } = await api.post<ApiTeam>(`/teams/${teamId}/members`, member);
  return data;
}

export async function removeTeamMember(teamId: string, usn: string) {
  const { data } = await api.delete<ApiTeam>(`/teams/${teamId}/members/${encodeURIComponent(usn)}`);
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

export async function adminUpdateTeam(
  teamId: string,
  input: { name?: string; theme?: string; problem_statement_id?: string; status?: string; members?: ApiTeamMember[] }
) {
  const { data } = await api.patch<ApiTeam>(`/teams/${teamId}`, input);
  return data;
}

export async function softDeleteTeam(teamId: string, reason?: string) {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}`, {
    data: { reason: reason || 'Admin soft delete' },
  });
  return data;
}

export async function listDeletedTeams() {
  const { data } = await api.get<ApiDeletedTeam[]>('/teams/deleted');
  return data;
}

export async function restoreDeletedTeam(id: string) {
  const { data } = await api.post<{ success: boolean; message: string }>(`/teams/${id}/restore`);
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
