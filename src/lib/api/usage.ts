import { apiClient } from '@/lib/api-client';

export interface UsageSummary {
  total_queries: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  queries_change_pct: number;
  cost_change_pct: number;
  embedding_events: number;
  embedding_tokens: number;
  crawler_pages: number;
  storage_bytes: number;
  est_monthly_revenue_usd: number;
  est_gross_margin_pct: number;
}

export interface UsageTimelinePoint {
  date: string;
  queries: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface TenantUsageItem {
  tenant_id: string;
  name: string;
  slug: string;
  plan_tier: string;
  status: string;
  query_limit: number;
  queries_used: number;
  queries_percent: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  storage_percent: number;
}

export interface ModelUsageItem {
  model: string;
  provider: string;
  queries: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  percentage_of_cost: number;
}

export interface OperationUsageItem {
  event_type: string;
  name: string;
  count: number;
  quantity: number;
  cost_usd: number;
  percentage: number;
}

export interface ModelRateItem {
  model: string;
  provider: string;
  prompt_per_1m: number;
  completion_per_1m: number;
  display_name: string;
}

export interface PricingRatesData {
  models: ModelRateItem[];
  operations: Record<string, number>;
}

export interface UsageResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const usageApi = {
  getSummary: async (tenantId?: string, dateRange: string = '30'): Promise<UsageResponse<UsageSummary>> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (tenantId) params.tenant_id = tenantId;
    return apiClient<UsageResponse<UsageSummary>>('/api/v1/admin/usage/summary', { params });
  },

  getTimeline: async (tenantId?: string, dateRange: string = '30'): Promise<UsageResponse<UsageTimelinePoint[]>> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (tenantId) params.tenant_id = tenantId;
    return apiClient<UsageResponse<UsageTimelinePoint[]>>('/api/v1/admin/usage/timeline', { params });
  },

  getTenants: async (dateRange: string = '30'): Promise<UsageResponse<TenantUsageItem[]>> => {
    return apiClient<UsageResponse<TenantUsageItem[]>>('/api/v1/admin/usage/tenants', {
      params: { date_range: dateRange },
    });
  },

  getModels: async (tenantId?: string, dateRange: string = '30'): Promise<UsageResponse<ModelUsageItem[]>> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (tenantId) params.tenant_id = tenantId;
    return apiClient<UsageResponse<ModelUsageItem[]>>('/api/v1/admin/usage/models', { params });
  },

  getOperations: async (tenantId?: string, dateRange: string = '30'): Promise<UsageResponse<OperationUsageItem[]>> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (tenantId) params.tenant_id = tenantId;
    return apiClient<UsageResponse<OperationUsageItem[]>>('/api/v1/admin/usage/operations', { params });
  },

  getPricingRates: async (): Promise<UsageResponse<PricingRatesData>> => {
    return apiClient<UsageResponse<PricingRatesData>>('/api/v1/admin/usage/pricing-rates');
  },

  updateModelRate: async (
    model: string,
    prompt_per_1m: number,
    completion_per_1m: number
  ): Promise<{ status: string; data: ModelRateItem }> => {
    return apiClient<{ status: string; data: ModelRateItem }>(`/api/v1/admin/usage/pricing-rates/${encodeURIComponent(model)}`, {
      method: 'PUT',
      body: JSON.stringify({ prompt_per_1m, completion_per_1m }),
    });
  },
};
