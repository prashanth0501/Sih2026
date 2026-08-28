import { api } from './client';

export interface AuditEvent {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  department: string | null;
  year: string | null;
  team_id: string | null;
  team_name: string | null;
  action: string;
  action_category: string;
  resource_type: string | null;
  resource_id: string | null;
  http_method: string | null;
  path: string | null;
  status_code: number;
  ip_address: string;
  country: string;
  state: string | null;
  city: string | null;
  isp: string | null;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: string;
  screen_resolution: string | null;
  timezone: string;
  language: string;
  user_agent: string;
  referer: string | null;
  duration_ms: number | null;
  details: Record<string, any>;
  created_at: string;
}

export interface AuditSession {
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  browser: string;
  os: string;
  device_type: string;
  ip_address: string;
  country: string;
  login_time: string;
  last_activity: string;
  duration_seconds: number;
  duration_text: string;
  action_count: number;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface SessionTimelineResponse {
  metadata: {
    session_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
    department: string | null;
    year: string | null;
    team_id: string | null;
    team_name: string | null;
    ip_address: string;
    country: string;
    state: string | null;
    city: string | null;
    isp: string | null;
    browser: string;
    browser_version: string;
    os: string;
    os_version: string;
    device_type: string;
    screen_resolution: string | null;
    timezone: string;
    language: string;
    user_agent: string;
    login_time: string;
    last_activity: string;
    duration_seconds: number;
    total_actions: number;
  };
  timeline: Array<{
    id: string;
    time: string;
    action: string;
    action_category: string;
    resource_type: string | null;
    resource_id: string | null;
    http_method: string | null;
    path: string | null;
    status_code: number;
    duration_ms: number | null;
    details: Record<string, any>;
  }>;
}

export interface AuditKpisResponse {
  kpis: {
    total_events: number;
    active_sessions: number;
    failed_logins_today: number;
    admin_actions_today: number;
    team_actions_today: number;
    security_alerts: number;
  };
  analytics: {
    top_users: Array<{ user_name: string; user_email: string; user_role: string; action_count: number }>;
    top_ips: Array<{ ip_address: string; country: string; count: number }>;
    top_browsers: Array<{ browser: string; count: number }>;
  };
}

export interface AuditFeedResponse {
  events: AuditEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    startRow: number;
    endRow: number;
  };
}

export interface AuditSessionsResponse {
  sessions: AuditSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditFilterParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  action?: string;
  role?: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  country?: string;
  status_code?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

export const auditApi = {
  getFeed: async (params?: AuditFilterParams): Promise<AuditFeedResponse> => {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data;
  },

  getKpis: async (): Promise<AuditKpisResponse> => {
    const { data } = await api.get('/admin/audit-logs/kpis');
    return data;
  },

  getSessions: async (params?: { page?: number; limit?: number; q?: string }): Promise<AuditSessionsResponse> => {
    const { data } = await api.get('/admin/audit-logs/sessions', { params });
    return data;
  },

  getSessionTimeline: async (sessionId: string): Promise<SessionTimelineResponse> => {
    const { data } = await api.get(`/admin/audit-logs/session/${encodeURIComponent(sessionId)}`);
    return data;
  },

  getEventById: async (id: string): Promise<AuditEvent> => {
    const { data } = await api.get(`/admin/audit-logs/${encodeURIComponent(id)}`);
    return data;
  },

  trackPageVisit: async (pageData: { path: string; referer?: string }) => {
    try {
      await api.post('/admin/audit-logs/track-page', {
        ...pageData,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      });
    } catch {
      // Non-blocking page tracking
    }
  },

  getExportUrl: (format: 'csv' | 'json', filters?: AuditFilterParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', format);
    if (filters?.category) searchParams.set('category', filters.category);
    if (filters?.action) searchParams.set('action', filters.action);
    if (filters?.role) searchParams.set('role', filters.role);
    
    const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
    return `${baseUrl}/admin/audit-logs/export?${searchParams.toString()}`;
  }
};
