import { apiClient } from '@/lib/api-client';

export type LogSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AuditLogItem {
  id: string;
  tenant_id: string | null;
  tenant_name: string;
  tenant_slug: string;
  actor_id: string | null;
  actor_email: string;
  actor_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  severity: LogSeverity;
  description: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface AuditLogStats {
  total_events: number;
  security_events: number;
  warning_events: number;
  active_tenants_logged: number;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    stats: AuditLogStats;
    filters: {
      tenant_id: string | null;
      category: string | null;
      severity: string | null;
      search: string | null;
      date_range: string;
    };
  };
}

export interface GetLogsParams {
  tenant_id?: string;
  category?: string;
  severity?: string;
  search?: string;
  date_range?: string;
  limit?: number;
  offset?: number;
}

export const logsApi = {
  getLogs: async (params: GetLogsParams = {}): Promise<AuditLogsResponse> => {
    const queryParams: Record<string, string | number> = {};
    if (params.tenant_id) queryParams.tenant_id = params.tenant_id;
    if (params.category && params.category !== 'all') queryParams.category = params.category;
    if (params.severity && params.severity !== 'all') queryParams.severity = params.severity;
    if (params.search) queryParams.search = params.search;
    if (params.date_range) queryParams.date_range = params.date_range;
    if (params.limit) queryParams.limit = params.limit;
    if (params.offset !== undefined) queryParams.offset = params.offset;

    return apiClient<AuditLogsResponse>('/api/v1/admin/logs', { params: queryParams });
  },

  getStats: async (dateRange: string = '30'): Promise<{ data: AuditLogStats }> => {
    return apiClient<{ data: AuditLogStats }>('/api/v1/admin/logs/stats', {
      params: { date_range: dateRange },
    });
  },
};
