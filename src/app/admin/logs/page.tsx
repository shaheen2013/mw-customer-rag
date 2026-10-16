'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import { tenantsApi, TenantItem } from '@/lib/api/tenants';
import {
  logsApi,
  AuditLogItem,
  AuditLogStats,
  LogSeverity,
} from '@/lib/api/logs';
import {
  FileText,
  Shield,
  Key,
  Database,
  Bot,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  Download,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  Code,
  X,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'auth', label: 'Auth & Security' },
  { value: 'tenant', label: 'Tenant Operations' },
  { value: 'kb', label: 'Knowledge Base' },
  { value: 'chat', label: 'AI & Chat' },
  { value: 'admin', label: 'Admin Governance' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const DATE_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function getCategoryIcon(action: string) {
  if (action.startsWith('auth.') || action.includes('login') || action.includes('password')) {
    return <Key className="w-3.5 h-3.5 text-blue-400" />;
  }
  if (action.startsWith('kb.') || action.includes('document') || action.includes('crawl')) {
    return <Database className="w-3.5 h-3.5 text-purple-400" />;
  }
  if (action.startsWith('tenant.') || action.includes('member')) {
    return <Building2 className="w-3.5 h-3.5 text-emerald-400" />;
  }
  if (action.startsWith('chat.') || action.startsWith('assistant.')) {
    return <Bot className="w-3.5 h-3.5 text-cyan-400" />;
  }
  if (action.startsWith('admin.') || action.includes('plan')) {
    return <Shield className="w-3.5 h-3.5 text-amber-400" />;
  }
  return <FileText className="w-3.5 h-3.5 text-slate-400" />;
}

function getSeverityBadge(severity: LogSeverity) {
  switch (severity) {
    case 'error':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-400" />
          ERROR
        </span>
      );
    case 'warning':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          WARN
        </span>
      );
    case 'success':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          SUCCESS
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 border border-blue-800 text-blue-300 flex items-center gap-1">
          <Info className="w-3 h-3 text-blue-400" />
          INFO
        </span>
      );
  }
}

export default function AdminLogsPage() {
  // Tenant Switcher
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Filters
  const [category, setCategory] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Pagination
  const [page, setPage] = useState<number>(0);
  const pageSize = 25;

  // Data states
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector Drawer
  const [inspectTarget, setInspectTarget] = useState<AuditLogItem | null>(null);

  // Fetch tenants for switcher
  useEffect(() => {
    tenantsApi
      .getTenants({ limit: 100 })
      .then((res) => setTenants(res.data || []))
      .catch(() => {});
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await logsApi.getLogs({
        tenant_id: selectedTenantId || undefined,
        category: category !== 'all' ? category : undefined,
        severity: severity !== 'all' ? severity : undefined,
        search: debouncedSearch || undefined,
        date_range: dateRange,
        limit: pageSize,
        offset: page * pageSize,
      });

      setLogs(res.data || []);
      setTotalCount(res.meta.total);
      setStats(res.meta.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [selectedTenantId, category, severity, debouncedSearch, dateRange, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  // Export logs to CSV
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'Severity', 'Tenant', 'Actor Email', 'Action', 'Resource Type', 'Resource ID', 'Description'];
    const rows = logs.map((l) => [
      l.occurred_at,
      l.severity,
      l.tenant_name,
      l.actor_email,
      l.action,
      l.resource_type || '',
      l.resource_id || '',
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_logs_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const activeTenantObj = tenants.find((t) => t.id === selectedTenantId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <Header
        title="System Audit & Execution Logs"
        subtitle={
          selectedTenantId
            ? `Viewing filtered audit trail and tenant security events for ${activeTenantObj?.name || 'Selected Tenant'}`
            : 'Immutable system audit trail, multi-tenant governance events, and authentication security history.'
        }
        tenantSwitcher={{
          options: [
            { id: '', name: 'All Tenants (Platform View)' },
            ...tenants.map((t) => ({ id: t.id, name: `${t.name} (${t.plan_tier})` })),
          ],
          activeId: selectedTenantId,
          activeLabel: (selectedTenantId ? activeTenantObj?.name : 'All Tenants (Platform)') || 'All Tenants (Platform)',
          onSelect: (id) => {
            setSelectedTenantId(id);
            setPage(0);
          },
        }}
      />

      {/* 4 Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Total Audit Events</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {stats ? stats.total_events.toLocaleString() : '—'}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-400">Recorded in current time window</p>
        </div>

        {/* Security & Auth */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Security & Auth Events</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {stats ? stats.security_events.toLocaleString() : '—'}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-400">Logins, OTP checks, and token grants</p>
        </div>

        {/* Warnings & Alerts */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Warnings & Security Alerts</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-400 tracking-tight">
              {stats ? stats.warning_events.toLocaleString() : '—'}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-400">Quota warnings and policy adjustments</p>
        </div>

        {/* Active Tenants Logged */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Active Tenants Logged</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400 tracking-tight">
              {stats ? stats.active_tenants_logged : '—'}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-400">Tenants with logged operations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1527] border border-[#1b2a47] rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor email, action, resource ID, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-[#1b2a47] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Severity dropdown */}
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-slate-900 border border-[#1b2a47] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Date range dropdown */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-slate-900 border border-[#1b2a47] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
            >
              {DATE_RANGE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#1b2a47] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Export filtered logs to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-xs text-slate-400 mr-1.5 shrink-0">Category:</span>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value);
                setPage(0);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                category === c.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-[#1b2a47] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-rose-300 text-sm">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Logs Explorer Table */}
      <div className="card-panel overflow-hidden">
        <div className="p-4 border-b border-[#1b2a47] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{logs.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> logs
          </span>
          {selectedTenantId && (
            <button
              onClick={() => setSelectedTenantId('')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Clear Tenant Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1220] border-b border-[#1b2a47] text-slate-400 uppercase font-medium text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Tenant Scope</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/50 text-slate-300 font-mono">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setInspectTarget(log)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {new Date(log.occurred_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">{getSeverityBadge(log.severity)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-800 shrink-0">
                        {getCategoryIcon(log.action)}
                      </div>
                      <span className="font-semibold text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {log.tenant_id ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {log.tenant_name}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/60 font-sans">
                        Platform System
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate" title={log.actor_email}>
                    {log.actor_email}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate" title={log.description}>
                    {log.description}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectTarget(log);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans transition flex items-center gap-1 ml-auto"
                    >
                      <Code className="w-3 h-3 text-blue-400" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No audit logs found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#1b2a47] flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <strong className="text-white">{page + 1}</strong> of <strong className="text-white">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-[#1b2a47] bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-[#1b2a47] bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Inspector Drawer / Modal */}
      {inspectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1220] border border-[#1b2a47] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Audit Event Inspector</span>
                    {getSeverityBadge(inspectTarget.severity)}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{inspectTarget.action}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectTarget(null)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#070b15] p-3.5 rounded-lg border border-[#1b2a47]/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Event ID</span>
                <span className="font-mono text-slate-200 text-[11px] select-all">{inspectTarget.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Timestamp (UTC)</span>
                <span className="font-mono text-slate-200 text-[11px]">{new Date(inspectTarget.occurred_at).toUTCString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tenant Scope</span>
                <span className="font-medium text-white">{inspectTarget.tenant_name}</span>
                {inspectTarget.tenant_id && (
                  <span className="text-[10px] font-mono text-slate-500 block truncate">{inspectTarget.tenant_id}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Actor / User</span>
                <span className="font-medium text-white">{inspectTarget.actor_email}</span>
                {inspectTarget.actor_id && (
                  <span className="text-[10px] font-mono text-slate-500 block truncate">{inspectTarget.actor_id}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resource Type</span>
                <span className="font-mono text-purple-400">{inspectTarget.resource_type || 'system'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resource ID</span>
                <span className="font-mono text-slate-300 truncate block">{inspectTarget.resource_id || '—'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-slate-400 block text-xs font-semibold mb-1">Action Description</span>
              <p className="p-3 bg-[#070b15] border border-[#1b2a47]/60 rounded-lg text-xs text-slate-200">
                {inspectTarget.description}
              </p>
            </div>

            {/* JSON Metadata Payload */}
            <div>
              <span className="text-slate-400 block text-xs font-semibold mb-1">Event Metadata Payload (JSON)</span>
              <pre className="p-4 bg-[#050811] border border-[#1b2a47] rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56">
                {JSON.stringify(inspectTarget.metadata, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1b2a47]">
              <button
                onClick={() => setInspectTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
