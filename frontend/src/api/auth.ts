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
  gender?: string | null;
  github_url?: string | null;
  email_verified?: boolean;
};

type TokenResponse = { access_token: string; token_type: string; user: ApiUser; email_verification_required?: boolean };

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
  gender?: string;
  github_url?: string;
}) {
  const { data } = await api.post<TokenResponse>('/auth/register', input);
  return data;
}

export async function apiMe() {
  const { data } = await api.get<ApiUser>('/auth/me');
  return data;
}

export async function apiForgotPassword(email: string) {
  const { data } = await api.post<{ detail: string }>('/auth/forgot-password', { email });
  return data;
}

export async function apiVerifyResetToken(token: string) {
  const { data } = await api.get<{ valid: boolean }>(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  return data;
}

export async function apiResetPassword(token: string, new_password: string) {
  const { data } = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
    token,
    new_password,
  });
  return data;
}

export async function apiResendVerification() {
  const { data } = await api.post<{ success: boolean; message: string }>('/auth/resend-verification');
  return data;
}

export async function apiVerifyEmail(token: string) {
  const { data } = await api.get<{ success: boolean; message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return data;
}
