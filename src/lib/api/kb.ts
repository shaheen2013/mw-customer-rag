import { apiClient } from '@/lib/api-client';

export interface KnowledgeStats {
  documents: number;
  indexed: number;
  processing: number;
  failed: number;
}

export interface DocumentItem {
  id: string;
  tenant_id: string;
  file: string;
  type: string;
  size: string;
  size_bytes: number;
  uploaded: string;
  assistant: string;
  status: 'Indexed' | 'Processing' | 'Failed' | string;
  used: 'Active' | 'Pending' | 'Inactive' | string;
  created_at: string | null;
  source_ref: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentListResponse {
  meta: {
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  data: DocumentItem[];
}

export interface DocumentUploadResponse {
  status: string;
  message: string;
  data: DocumentItem;
}

export interface ReindexResponse {
  status: string;
  message: string;
}

export const kbApi = {
  /**
   * Fetch aggregate document counts for knowledge base summary cards.
   */
  getStats: async (): Promise<KnowledgeStats> => {
    return apiClient<KnowledgeStats>('/api/v1/kb/stats');
  },

  /**
   * Fetch paginated documents for the tenant.
   */
  getDocuments: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
  }): Promise<DocumentListResponse> => {
    return apiClient<DocumentListResponse>('/api/v1/kb/documents', {
      params,
    });
  },

  /**
   * Upload and index a new document.
   */
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<DocumentUploadResponse>('/api/v1/kb/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Reindex all or selected documents for the tenant.
   */
  reindex: async (documentIds?: string[]): Promise<ReindexResponse> => {
    return apiClient<ReindexResponse>('/api/v1/kb/reindex', {
      method: 'POST',
      body: JSON.stringify(documentIds ? { document_ids: documentIds } : {}),
    });
  },

  /**
   * Delete a document by ID.
   */
  deleteDocument: async (documentId: string): Promise<{ status: string; message: string }> => {
    return apiClient<{ status: string; message: string }>(`/api/v1/kb/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};
