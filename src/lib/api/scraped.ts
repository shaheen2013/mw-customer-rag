import { apiClient } from '@/lib/api-client';

export interface ScrapedPageItem {
  id: string;
  title: string;
  url: string | null;
  category: string;
  domain: string | null;
  source_type: string;
  word_count: number;
  status: 'Indexed' | 'Failed' | 'Processing' | string;
  scraped_at: string | null;
  media_links: Record<string, unknown>[];
  youtube_urls: string[];
  has_content: boolean;
}

export interface ScrapedStats {
  total_pages: number;
  indexed: number;
  failed: number;
  sites: number;
  categories: number;
  last_scraped_at: string | null;
}

export interface ScrapedListResponse {
  meta: {
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  data: ScrapedPageItem[];
}

export interface ScrapedPageDetail extends ScrapedPageItem {
  content_markdown: string;
  metadata: Record<string, unknown>;
}

export const scrapedApi = {
  /**
   * Fetch aggregate counts for the scraped-data summary cards.
   */
  getStats: async (): Promise<ScrapedStats> => {
    return apiClient<ScrapedStats>('/api/v1/kb/scraped/stats');
  },

  /**
   * Fetch the scraped pages captured for the tenant.
   */
  getPages: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ScrapedListResponse> => {
    return apiClient<ScrapedListResponse>('/api/v1/kb/scraped', { params });
  },

  /**
   * Fetch a single scraped page including its raw markdown content.
   */
  getPage: async (pageId: string): Promise<ScrapedPageDetail> => {
    return apiClient<ScrapedPageDetail>(`/api/v1/kb/scraped/${pageId}`);
  },
};
