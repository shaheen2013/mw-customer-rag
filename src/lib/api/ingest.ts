import { apiClient } from '@/lib/api-client';

export interface IngestionRunRequest {
  source?: string;
  force_reindex?: boolean;
  categories?: string[];
  exclude_categories?: string[];
  max_pages?: number;
}

export interface IngestionRunResponse {
  status: string;
  message: string;
  data: {
    run_id: string;
    tenant_id: string;
    source: string;
    output_dir: string;
  };
}

export interface WebSourceItem {
  id: string;
  url: string;
  domain: string;
  pages: number;
  frequency: string;
  last_sync: string | null;
  index: string;
  errors: number;
  status: 'Active' | 'Crawling' | 'Failed';
  created_at?: string;
  error_message?: string;
}

export interface WebSourcesResponse {
  stats: {
    total_websites: number;
    pages_indexed: number;
    last_sync: string | null;
    crawl_errors: number;
    is_crawling: boolean;
  };
  sources: WebSourceItem[];
}

export const ingestApi = {
  /**
   * Start a background web crawl + incremental vector ingestion for a source URL.
   */
  run: async (payload: IngestionRunRequest): Promise<IngestionRunResponse> => {
    return apiClient<IngestionRunResponse>('/api/v1/kb/ingest/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get all registered web sources and aggregate crawl stats for the tenant.
   */
  getSources: async (): Promise<WebSourcesResponse> => {
    return apiClient<WebSourcesResponse>('/api/v1/kb/ingest/sources');
  },

  /**
   * Register a new web source and launch crawler + vector ingestion in the background.
   */
  addSource: async (payload: {
    url: string;
    max_pages?: number;
    frequency?: string;
  }): Promise<{ status: string; message: string; data: WebSourceItem }> => {
    return apiClient('/api/v1/kb/ingest/sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Re-sync an existing web source.
   */
  syncSource: async (sourceId: string): Promise<{ message: string; data: WebSourceItem }> => {
    return apiClient(`/api/v1/kb/ingest/sources/${sourceId}/sync`, {
      method: 'POST',
    });
  },

  /**
   * Sync all registered web sources.
   */
  syncAll: async (): Promise<{ message: string; count: number }> => {
    return apiClient('/api/v1/kb/ingest/sources/sync-all', {
      method: 'POST',
    });
  },

  /**
   * Remove a registered web source.
   */
  deleteSource: async (sourceId: string): Promise<{ message: string; source_id: string }> => {
    return apiClient(`/api/v1/kb/ingest/sources/${sourceId}`, {
      method: 'DELETE',
    });
  },
};
