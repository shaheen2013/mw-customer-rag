import { apiClient } from '@/lib/api-client';

export interface TenantEntitlements {
  monthly_query_limit?: number;
  max_pages?: number;
  max_documents?: number;
  storage_bytes?: number;
  max_assistants?: number;
  sync_frequency_hours?: number;
}

export interface TenantUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  is_active: boolean;
  created_at?: string | null;
}

export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'trial' | 'suspended' | string;
  plan_tier: 'starter' | 'growth' | 'business' | 'enterprise' | string;
  entitlements: TenantEntitlements;
  queries_count?: number;
  storage_bytes?: number;
  assistants_count?: number;
  users_count?: number;
  documents_count?: number;
  created_at: string | null;
  updated_at?: string | null;
}

export interface TenantStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
}

export interface TenantListResponse {
  data: TenantItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface TenantDetailResponse extends TenantItem {
  metrics?: {
    users_count: number;
    documents_count: number;
    queries_count: number;
    assistants_count: number;
  };
  users?: TenantUser[];
}

export interface CreateTenantPayload {
  name: string;
  admin_email?: string;
  plan_tier?: 'starter' | 'growth' | 'business' | 'enterprise' | string;
  status?: 'active' | 'trial' | 'suspended' | string;
  slug?: string;
  entitlements?: TenantEntitlements;
}

export interface UpdateTenantPayload {
  name?: string;
  slug?: string;
  plan_tier?: 'starter' | 'growth' | 'business' | 'enterprise' | string;
  status?: 'active' | 'trial' | 'suspended' | string;
  entitlements?: TenantEntitlements;
}

export const tenantsApi = {
  /**
   * Fetch aggregate tenant counts (total, active, trial, suspended) for top summary cards.
   */
  getStats: async (): Promise<TenantStats> => {
    return apiClient<TenantStats>('/api/v1/tenants/stats');
  },

  /**
   * Fetch paginated list of tenants with optional status and search filter.
   */
  getTenants: async (params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<TenantListResponse> => {
    return apiClient<TenantListResponse>('/api/v1/tenants', {
      params,
    });
  },

  /**
   * Fetch complete tenant detail by ID (including metrics and team users).
   */
  getTenant: async (tenantId: string): Promise<TenantDetailResponse> => {
    return apiClient<TenantDetailResponse>(`/api/v1/tenants/${tenantId}`);
  },

  /**
   * Create a new client tenant organization (and optionally provision tenant admin user).
   */
  createTenant: async (payload: CreateTenantPayload): Promise<TenantItem> => {
    return apiClient<TenantItem>('/api/v1/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update tenant general settings, plan, slug or entitlements.
   */
  updateTenant: async (
    tenantId: string,
    payload: UpdateTenantPayload
  ): Promise<TenantItem> => {
    return apiClient<TenantItem>(`/api/v1/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Quick status change (active, trial, suspended).
   */
  updateTenantStatus: async (
    tenantId: string,
    status: 'active' | 'trial' | 'suspended'
  ): Promise<{ status: string; tenant_id: string; new_status: string }> => {
    return apiClient<{ status: string; tenant_id: string; new_status: string }>(
      `/api/v1/tenants/${tenantId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  /**
   * Update resource entitlements (query limit, storage bytes, etc.).
   */
  updateTenantEntitlements: async (
    tenantId: string,
    entitlements: TenantEntitlements
  ): Promise<{ status: string; tenant_id: string; entitlements: TenantEntitlements }> => {
    return apiClient<{ status: string; tenant_id: string; entitlements: TenantEntitlements }>(
      `/api/v1/tenants/${tenantId}/entitlements`,
      {
        method: 'PUT',
        body: JSON.stringify(entitlements),
      }
    );
  },

  /**
   * Permanently delete a tenant and all related workspaces.
   */
  deleteTenant: async (
    tenantId: string
  ): Promise<{ status: string; tenant_id: string; message: string }> => {
    return apiClient<{ status: string; tenant_id: string; message: string }>(
      `/api/v1/tenants/${tenantId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
