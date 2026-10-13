import { apiClient } from '@/lib/api-client';

export interface PlanEntitlements {
  monthly_query_limit: number;
  max_pages: number;
  max_documents: number;
  storage_bytes: number;
  max_assistants: number;
  sync_frequency_hours: number;
}

export interface PlanDisplay {
  queries: string;
  storage: string;
  assistants: string;
  pages: string;
  documents: string;
}

export interface PlanItem {
  tier: string;
  display_name: string;
  tagline: string;
  price_monthly_usd: number | null;
  price_label: string;
  is_custom_price: boolean;
  entitlements: PlanEntitlements;
  display: PlanDisplay;
  features: string[];
  tenant_count: number;
  mrr_usd: number | null;
  mrr_label: string;
}

export interface PlansListResponse {
  data: PlanItem[];
}

export interface PlanEntitlementUpdatePayload {
  monthly_query_limit?: number;
  max_pages?: number;
  max_documents?: number;
  storage_bytes?: number;
  max_assistants?: number;
  sync_frequency_hours?: number;
}

export interface PlanEntitlementUpdateResponse {
  tier: string;
  entitlements: PlanEntitlements;
  note: string;
}

export interface ApplyPlanToTenantsResponse {
  tier: string;
  updated_tenant_count: number;
  applied_entitlements: PlanEntitlements;
}

export const plansApi = {
  /**
   * Fetch all plan tiers with live DB stats (tenant count, MRR).
   */
  getPlans: async (): Promise<PlansListResponse> => {
    return apiClient<PlansListResponse>('/api/v1/plans');
  },

  /**
   * Fetch a single plan tier with live stats.
   */
  getPlan: async (tier: string): Promise<PlanItem> => {
    return apiClient<PlanItem>(`/api/v1/plans/${tier}`);
  },

  /**
   * Update default entitlements for a plan tier (in-memory; persisting
   * across restarts requires editing plans_config.py on the backend).
   */
  updatePlanEntitlements: async (
    tier: string,
    payload: PlanEntitlementUpdatePayload
  ): Promise<PlanEntitlementUpdateResponse> => {
    return apiClient<PlanEntitlementUpdateResponse>(
      `/api/v1/plans/${tier}/entitlements`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Push this tier's current entitlements to every existing tenant on it.
   */
  applyPlanToTenants: async (
    tier: string
  ): Promise<ApplyPlanToTenantsResponse> => {
    return apiClient<ApplyPlanToTenantsResponse>(
      `/api/v1/plans/${tier}/apply-to-tenants`,
      {
        method: 'POST',
      }
    );
  },
};
