import { api } from './client';
import type { Role } from '@/lib/auth';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
  year?: number | null;
  usn?: string | null;
  github_url?: string | null;
};

type TokenResponse = { access_token: string; token_type: string; user: ApiUser };

export async function apiLogin(email: string, password: string) {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
  return data;
}

export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
  department: string;
  year: number;
  usn?: string;
  github_url?: string;
}) {
  const { data } = await api.post<TokenResponse>('/auth/register', input);
  return data;
}

export async function apiMe() {
  const { data } = await api.get<ApiUser>('/auth/me');
  return data;
}
