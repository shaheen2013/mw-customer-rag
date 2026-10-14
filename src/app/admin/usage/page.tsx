'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { tenantsApi, TenantItem } from '@/lib/api/tenants';
import {
  usageApi,
  UsageSummary,
  UsageTimelinePoint,
  TenantUsageItem,
  ModelUsageItem,
  OperationUsageItem,
  ModelRateItem,
} from '@/lib/api/usage';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Cpu,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  HardDrive,
  RefreshCw,
  Download,
  Settings2,
  Calendar,
  Building2,
  Sparkles,
  Bot,
  Globe,
  Loader2,
  Check,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const DATE_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminUsagePage() {
  const router = useRouter();

  // Filter states
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [timeline, setTimeline] = useState<UsageTimelinePoint[]>([]);
  const [tenantBreakdown, setTenantBreakdown] = useState<TenantUsageItem[]>([]);
  const [modelsBreakdown, setModelsBreakdown] = useState<ModelUsageItem[]>([]);
  const [operationsBreakdown, setOperationsBreakdown] = useState<OperationUsageItem[]>([]);

  // Pricing configuration modal states
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [modelRates, setModelRates] = useState<ModelRateItem[]>([]);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editPromptRate, setEditPromptRate] = useState<number>(0);
  const [editCompletionRate, setEditCompletionRate] = useState<number>(0);
  const [savingRate, setSavingRate] = useState(false);
  const [rateSuccessMessage, setRateSuccessMessage] = useState<string | null>(null);

  // Fetch tenants for the top switcher dropdown
  useEffect(() => {
    tenantsApi
      .getTenants({ limit: 100 })
      .then((res) => setTenants(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch all usage data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, timeRes, tenRes, modRes, opRes] = await Promise.all([
        usageApi.getSummary(selectedTenantId || undefined, dateRange),
        usageApi.getTimeline(selectedTenantId || undefined, dateRange),
        usageApi.getTenants(dateRange),
        usageApi.getModels(selectedTenantId || undefined, dateRange),
        usageApi.getOperations(selectedTenantId || undefined, dateRange),
      ]);

      setSummary(sumRes.data);
      setTimeline(timeRes.data || []);
      setTenantBreakdown(tenRes.data || []);
      setModelsBreakdown(modRes.data || []);
      setOperationsBreakdown(opRes.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load AI usage analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedTenantId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open pricing rates modal
  const handleOpenPricingModal = async () => {
    try {
      const res = await usageApi.getPricingRates();
      setModelRates(res.data.models || []);
      setPricingModalOpen(true);
      setEditingModel(null);
    } catch (err) {
      alert('Failed to load pricing rates');
    }
  };

  const handleStartEditRate = (rate: ModelRateItem) => {
    setEditingModel(rate.model);
    setEditPromptRate(rate.prompt_per_1m);
    setEditCompletionRate(rate.completion_per_1m);
    setRateSuccessMessage(null);
  };

  const handleSaveRate = async () => {
    if (!editingModel) return;
    setSavingRate(true);
    try {
      await usageApi.updateModelRate(editingModel, editPromptRate, editCompletionRate);
      setRateSuccessMessage(`Updated rates for ${editingModel}`);
      setEditingModel(null);
      // Reload rates and usage data
      const res = await usageApi.getPricingRates();
      setModelRates(res.data.models || []);
      fetchData();
    } catch (err) {
      alert('Failed to update rate');
    } finally {
      setSavingRate(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!timeline.length) return;
    const headers = ['Date', 'AI Queries', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Metered Cost (USD)'];
    const rows = timeline.map((t) => [
      t.date,
      t.queries,
      t.prompt_tokens,
      t.completion_tokens,
      t.total_tokens,
      t.cost_usd.toFixed(4),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_usage_metering_${selectedTenantId || 'platform'}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeTenantObj = tenants.find((t) => t.id === selectedTenantId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <Header
        title="AI Token Usage & Cost Metering"
        subtitle={
          selectedTenantId
            ? `Viewing metered consumption & cost breakdown for ${activeTenantObj?.name || 'Selected Tenant'}`
            : 'Platform-wide token consumption, vector query metering, and provider margins across all tenants.'
        }
        tenantSwitcher={{
          options: [
            { id: '', name: 'All Tenants (Aggregated)' },
            ...tenants.map((t) => ({ id: t.id, name: `${t.name} (${t.plan_tier})` })),
          ],
          activeId: selectedTenantId,
          activeLabel: (selectedTenantId ? activeTenantObj?.name : 'All Tenants (Platform)') || 'All Tenants (Platform)',
          onSelect: (id) => setSelectedTenantId(id),
        }}
      />

      {/* Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0d1527] p-3.5 rounded-xl border border-[#1b2a47]">
        {/* Date Range Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-slate-400 ml-1.5 mr-1 shrink-0" />
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                dateRange === opt.value
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedTenantId && (
            <button
              onClick={() => setSelectedTenantId('')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1b2a47] text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Reset to All Tenants
            </button>
          )}

          <button
            onClick={handleOpenPricingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1b2a47] text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Configure model pricing rates per 1M tokens"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Pricing Rates</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1b2a47] text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Export usage breakdown to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Top 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total AI Queries */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Total AI Queries</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary ? summary.total_queries.toLocaleString() : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            {summary && summary.queries_change_pct >= 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-0.5 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" />
                +{summary.queries_change_pct}%
              </span>
            ) : summary ? (
              <span className="text-rose-400 font-medium flex items-center gap-0.5 bg-rose-950/60 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" />
                {summary?.queries_change_pct}%
              </span>
            ) : null}
            <span>vs previous period</span>
          </div>
        </div>

        {/* Prompt Tokens */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Prompt Tokens</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary ? formatNumber(summary.prompt_tokens) : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Inputs fed to LLMs</span>
          </div>
        </div>

        {/* Completion Tokens */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Completion Tokens</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary ? formatNumber(summary.completion_tokens) : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Generated AI responses</span>
          </div>
        </div>

        {/* Metered LLM Cost */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Metered Cost (USD)</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 tracking-tight">
                {summary ? `$${summary.total_cost_usd.toFixed(2)}` : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>LLM tokens & embedding spend</span>
          </div>
        </div>

        {/* Est. Gross Margin */}
        <div className="card-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-400">Est. Gross Margin</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400 tracking-tight">
                {summary ? `${summary.est_gross_margin_pct}%` : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>MRR: ${summary?.est_monthly_revenue_usd || 0}</span>
            <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Volume Trend (2 cols) */}
        <div className="lg:col-span-2 card-panel p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Daily Token Volume</h3>
              <p className="text-xs text-slate-400">Breakdown of prompt vs completion tokens over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Prompt Tokens
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Completion Tokens
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="promptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2a47" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1527',
                      borderColor: '#1b2a47',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [
                      formatNumber(Number(val)),
                      String(name === 'prompt_tokens' ? 'Prompt Tokens' : name === 'completion_tokens' ? 'Completion Tokens' : name),
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="prompt_tokens"
                    stackId="1"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#promptGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completion_tokens"
                    stackId="1"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#compGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                {loading ? 'Loading timeline...' : 'No usage recorded for this time range.'}
              </div>
            )}
          </div>
        </div>

        {/* Daily Metered Spend (1 col) */}
        <div className="card-panel p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Daily Cost ($ USD)</h3>
            <p className="text-xs text-slate-400">Total metered API and compute expenditure</p>
          </div>

          <div className="h-64 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2a47" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1527',
                      borderColor: '#1b2a47',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(4)}`, 'Cost']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="cost_usd" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                {loading ? 'Loading costs...' : 'No cost data available.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model & Operations Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by LLM Model */}
        <div className="card-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Consumption by LLM Model</h3>
              <p className="text-xs text-slate-400">Distribution of queries and costs across model families</p>
            </div>
            <button
              onClick={handleOpenPricingModal}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              <span>Edit Rates</span>
              <Settings2 className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {modelsBreakdown.map((m) => (
              <div key={m.model} className="p-3 rounded-lg bg-[#0a1122] border border-[#1b2a47]/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white">{m.model}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        m.provider === 'Google'
                          ? 'bg-blue-950/60 border-blue-800/50 text-blue-400'
                          : m.provider === 'OpenAI'
                          ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
                          : 'bg-amber-950/60 border-amber-800/50 text-amber-400'
                      }`}
                    >
                      {m.provider}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">${m.cost_usd.toFixed(4)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({m.percentage_of_cost}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(m.percentage_of_cost, 2)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{m.queries.toLocaleString()} queries</span>
                  <span>
                    {formatNumber(m.prompt_tokens)} in / {formatNumber(m.completion_tokens)} out
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metering by Operation Category */}
        <div className="card-panel p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Metered Operations</h3>
            <p className="text-xs text-slate-400">Breakdown of AI inferences, vector indexing, and scraping</p>
          </div>

          <div className="space-y-4">
            {operationsBreakdown.map((op) => (
              <div key={op.event_type} className="p-3 rounded-lg bg-[#0a1122] border border-[#1b2a47]/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-800 text-slate-300">
                      {op.event_type === 'llm_query' ? (
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                      ) : op.event_type === 'embedding' ? (
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                      ) : op.event_type === 'crawler_page' ? (
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="font-medium text-xs text-white">{op.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">${op.cost_usd.toFixed(4)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(op.percentage, 3)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{op.count.toLocaleString()} events recorded</span>
                  <span>Share: {op.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Tenant Metering Breakdown Table */}
      <div className="card-panel overflow-hidden">
        <div className="p-5 border-b border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Tenant Quota & Metering Table</h3>
            <p className="text-xs text-slate-400">
              Live usage vs plan allowances, prompt/completion tokens, and metered cost per tenant
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <span>Showing {tenantBreakdown.length} active tenants</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1220] border-b border-[#1b2a47] text-slate-400 uppercase font-medium text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">AI Queries Used / Quota</th>
                <th className="py-3 px-4">Prompt Tokens</th>
                <th className="py-3 px-4">Completion Tokens</th>
                <th className="py-3 px-4">Total Tokens</th>
                <th className="py-3 px-4">Metered Spend</th>
                <th className="py-3 px-4">Storage Used</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2a47]/50 text-slate-300">
              {tenantBreakdown.map((t) => (
                <tr key={t.tenant_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${
                        t.plan_tier === 'business'
                          ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                          : t.plan_tier === 'growth'
                          ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {t.plan_tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-white">{t.queries_used.toLocaleString()}</span>
                      <span className="text-slate-500">/ {t.query_limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.queries_percent > 90
                            ? 'bg-rose-500'
                            : t.queries_percent > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(t.queries_percent, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{formatNumber(t.prompt_tokens)}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{formatNumber(t.completion_tokens)}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-white">{formatNumber(t.total_tokens)}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                    ${t.cost_usd.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span>{formatBytes(t.storage_used_bytes)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTenantId(t.tenant_id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Filter View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Rate Configuration Modal */}
      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1220] border border-[#1b2a47] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-400" />
                  Model Pricing & Cost Rates
                </h3>
                <p className="text-xs text-slate-400">
                  Configure unit prices (USD per 1,000,000 tokens) for LLMs and embeddings
                </p>
              </div>
              <button
                onClick={() => setPricingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rateSuccessMessage && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{rateSuccessMessage}</span>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {modelRates.map((r) => {
                const isEditing = editingModel === r.model;
                return (
                  <div
                    key={r.model}
                    className="p-3.5 rounded-lg bg-[#070b15] border border-[#1b2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{r.display_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({r.model})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Provider: {r.provider}</p>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Prompt ($/1M)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editPromptRate}
                              onChange={(e) => setEditPromptRate(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Comp ($/1M)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editCompletionRate}
                              onChange={(e) => setEditCompletionRate(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 sm:mt-0">
                          <button
                            onClick={handleSaveRate}
                            disabled={savingRate}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center gap-1"
                          >
                            {savingRate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingModel(null)}
                            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <p className="text-slate-300">
                            Prompt: <span className="font-mono text-emerald-400">${r.prompt_per_1m.toFixed(3)}</span>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Completion: <span className="font-mono text-purple-400">${r.completion_per_1m.toFixed(3)}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartEditRate(r)}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1b2a47]">
              <button
                onClick={() => setPricingModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
