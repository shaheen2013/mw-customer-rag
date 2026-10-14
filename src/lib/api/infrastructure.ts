import { apiClient } from '@/lib/api-client';

export interface DatabaseHealth {
  engine: string;
  status: string;
  latency_ms: number;
  pool_size: number;
  max_overflow: number;
  active_connections: number;
  db_size_bytes: number;
  pgvector_installed: boolean;
  vector_version?: string;
  documents_count: number;
  usage_events_count: number;
}

export interface RedisHealth {
  status: string;
  latency_ms: number;
  mode: string;
  connected_clients: number;
  fallback_active: boolean;
}

export interface VectorEngineHealth {
  status: string;
  index_type: string;
  distance_metric: string;
  dimension: number;
  active_namespaces: number;
  pending_queue: number;
}

export interface CrawlerFleetHealth {
  status: string;
  total_workers: number;
  idle_workers: number;
  queue_backlog: number;
  concurrency_limit_per_tenant: number;
}

export interface LlmGatewayHealth {
  status: string;
  primary_provider: string;
  primary_models: string[];
  fallback_provider: string;
  fallback_models: string[];
  avg_latency_ms: number;
  uptime_percentage: number;
  rate_limit_headroom_pct: number;
}

export interface SystemHealth {
  os: string;
  python_version: string;
  memory_rss_mb: number;
  cpu_percent: number;
}

export interface ClusterHealthData {
  overall_status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime_seconds: number;
  database: DatabaseHealth;
  redis: RedisHealth;
  vector_engine: VectorEngineHealth;
  crawler_fleet: CrawlerFleetHealth;
  llm_gateway: LlmGatewayHealth;
  system: SystemHealth;
}

export interface DiagnosticTestResult {
  component: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  latency_ms: number;
  details: string;
}

export interface DiagnosticsReport {
  status: string;
  overall_result: 'PASS' | 'WARNING' | 'FAIL';
  executed_at: string;
  tests: DiagnosticTestResult[];
}

export interface InfrastructureResponse<T> {
  data: T;
}

export const infrastructureApi = {
  getHealth: async (): Promise<InfrastructureResponse<ClusterHealthData>> => {
    return apiClient<InfrastructureResponse<ClusterHealthData>>('/api/v1/admin/infrastructure/health');
  },

  runDiagnostics: async (): Promise<DiagnosticsReport> => {
    return apiClient<DiagnosticsReport>('/api/v1/admin/infrastructure/diagnostics', {
      method: 'POST',
    });
  },
};
