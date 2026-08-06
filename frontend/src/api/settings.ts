import { api } from './client';

export type SystemSettings = {
  registration_open: boolean;
  level1_open: boolean;
  level2_open: boolean;
};

export async function getSystemSettings() {
  const { data } = await api.get<SystemSettings>('/content/settings');
  return data;
}

export async function updateSystemSettings(updates: Partial<SystemSettings>) {
  const { data } = await api.patch<SystemSettings>('/content/settings', updates);
  return data;
}
