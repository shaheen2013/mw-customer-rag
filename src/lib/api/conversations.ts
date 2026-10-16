import { apiClient } from '@/lib/api-client';

export interface ChatMessageDetail {
  id: string;
  query: string;
  response: string;
  model?: string;
  tokens_used?: number;
  latency_ms?: number;
  feedback_rating?: string | null;
  feedback_text?: string | null;
  created_at?: string;
}

export interface ConversationItem {
  id: string;
  visitor: string;
  topic: string;
  response: string;
  status: 'Answered' | 'Weak Answer' | 'Unanswered' | string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  feedback: 'Positive' | 'Negative' | 'Neutral' | string;
  date: string;
  created_at?: string;
  gapDetected: boolean;
  intent: string;
  messagesCount: number;
  source: string;
  messages: ChatMessageDetail[];
}

export interface ConversationStats {
  total_conversations: number;
  answered_count: number;
  answered_rate: string;
  weak_count: number;
  unanswered_count: number;
  trend_conversations: string;
  trend_answered: string;
  trend_weak: string;
  trend_unanswered: string;
}

export interface ConversationsListResponse {
  status: string;
  stats: ConversationStats;
  data: ConversationItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ConversationDetailResponse {
  status: string;
  data: ConversationItem;
}

export const conversationsApi = {
  getConversations: async (params?: {
    filter?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ConversationsListResponse> => {
    return apiClient<ConversationsListResponse>('/api/v1/chat/conversations', {
      params: {
        filter: params?.filter && params.filter !== 'All' ? params.filter : undefined,
        search: params?.search || undefined,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    });
  },

  getConversation: async (sessionId: string): Promise<ConversationDetailResponse> => {
    return apiClient<ConversationDetailResponse>(`/api/v1/chat/conversations/${sessionId}`);
  },

  deleteConversation: async (sessionId: string): Promise<{ status: string; message: string }> => {
    return apiClient<{ status: string; message: string }>(`/api/v1/chat/conversations/${sessionId}`, {
      method: 'DELETE',
    });
  },
};
