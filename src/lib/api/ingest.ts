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
};
