'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  Building2,
  Check,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { getFriendlyErrorMessage, isTechnicalErrorMessage } from '@/lib/api-client';
import {
  tenantsApi,
  TenantItem,
  TenantStats,
  CreateTenantPayload,
  UpdateTenantPayload,
} from '@/lib/api/tenants';

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter ($29/mo)', queries: 1000, storage: 1073741824 },
  { value: 'growth', label: 'Growth ($79/mo)', queries: 5000, storage: 5368709120 },
  { value: 'business', label: 'Business ($199/mo)', queries: 15000, storage: 10737418240 },
  { value: 'enterprise', label: 'Enterprise (Custom)', queries: 50000, storage: 53687091200 },
];

const DEFAULT_PLAN_TIER = 'growth';

// Looks up a plan's query entitlement from PLAN_OPTIONS instead of hardcoding it,
// so defaults stay correct if plan limits ever change.
const getQueryLimitForPlan = (planTier: string) =>
  PLAN_OPTIONS.find((p) => p.value === planTier)?.queries ?? PLAN_OPTIONS[0].queries;

export default function TenantsPage() {
  const { user } = useAuth();
  const isSuperAdmin =
    user?.role === 'super_admin' || user?.role === 'platform_admin';

  // Data states
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [isPlanFilterOpen, setIsPlanFilterOpen] = useState(false);

  // Modals & Dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMenuTenantId, setStatusMenuTenantId] = useState<string | null>(null);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState<{
    name: string;
    slug: string;
    admin_email: string;
    plan_tier: string;
    status: string;
    monthly_query_limit: number;
  }>({
    name: '',
    slug: '',
    admin_email: '',
    plan_tier: DEFAULT_PLAN_TIER,
    status: 'active',
    monthly_query_limit: getQueryLimitForPlan(DEFAULT_PLAN_TIER),
  });

  // Edit form fields
  const [editForm, setEditForm] = useState<{
    name: string;
    slug: string;
    plan_tier: string;
    status: string;
    monthly_query_limit: number;
  }>({
    name: '',
    slug: '',
    plan_tier: DEFAULT_PLAN_TIER,
    status: 'active',
    monthly_query_limit: getQueryLimitForPlan(DEFAULT_PLAN_TIER),
  });

  // Auto-slugify for Add Tenant modal
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setAddForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ? slug : prev.slug,
    }));
  };

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    const timer = setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch summary stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await tenantsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch tenant stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch tenants list
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; search?: string; limit?: number } = {
        limit: 100,
      };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await tenantsApi.getTenants(params);
      setTenants(res.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tenants';
      setError(msg);
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search]);

  useEffect(() => {
    let isMounted = true;
    const initStats = async () => {
      try {
        const data = await tenantsApi.getStats();
        if (isMounted) setStats(data);
      } catch (err) {
        console.error('Failed to fetch tenant stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };
    initStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTenants]);

  // Client-side plan filtering
  const filteredTenants = useMemo(() => {
    if (selectedPlan === 'all') return tenants;
    return tenants.filter(
      (t) => t.plan_tier?.toLowerCase() === selectedPlan.toLowerCase()
    );
  }, [tenants, selectedPlan]);

  // Handle Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    setActionLoading(true);
    setAddFormError(null);
    try {
      const payload: CreateTenantPayload = {
        name: addForm.name.trim(),
        slug: addForm.slug.trim() || undefined,
        plan_tier: addForm.plan_tier,
        status: addForm.status,
        admin_email: addForm.admin_email.trim() || undefined,
        entitlements: {
          monthly_query_limit: Number(addForm.monthly_query_limit),
        },
      };

      const created = await tenantsApi.createTenant(payload);
      showNotification(
        'success',
        `Tenant "${created.name}" created successfully${
          addForm.admin_email ? ` with admin ${addForm.admin_email}` : ''
        }!`
      );
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        slug: '',
        admin_email: '',
        plan_tier: DEFAULT_PLAN_TIER,
        status: 'active',
        monthly_query_limit: getQueryLimitForPlan(DEFAULT_PLAN_TIER),
      });
      fetchTenants();
      fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tenant';
      setAddFormError(msg);
      // Refresh the list in the background so you can see whether the tenant
      // was actually created despite the error (the backend is not atomic —
      // see the warning below the form). This does NOT auto-close the modal
      // or let you resubmit silently; you decide what to do next.
      fetchTenants();
      fetchStats();
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (t: TenantItem) => {
    setEditTarget(t);
    setEditFormError(null);
    setEditForm({
      name: t.name,
      slug: t.slug,
      plan_tier: t.plan_tier?.toLowerCase() || 'starter',
      status: t.status?.toLowerCase() || 'active',
      monthly_query_limit:
        t.entitlements?.monthly_query_limit ||
        getQueryLimitForPlan(t.plan_tier?.toLowerCase() || 'starter'),
    });
  };

  // Handle Update Tenant
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setActionLoading(true);
    setEditFormError(null);
    try {
      const payload: UpdateTenantPayload = {
        name: editForm.name.trim(),
        slug: editForm.slug.trim(),
        plan_tier: editForm.plan_tier,
        status: editForm.status,
        entitlements: {
          ...editTarget.entitlements,
          monthly_query_limit: Number(editForm.monthly_query_limit),
        },
      };

      await tenantsApi.updateTenant(editTarget.id, payload);
      showNotification('success', `Tenant "${editForm.name}" updated successfully.`);
      setEditTarget(null);
      fetchTenants();
      fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update tenant';
      setEditFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (
    tenant: TenantItem,
    newStatus: 'active' | 'trial' | 'suspended'
  ) => {
    setStatusMenuTenantId(null);
    if (tenant.status.toLowerCase() === newStatus) return;

    try {
      await tenantsApi.updateTenantStatus(tenant.id, newStatus);
      showNotification(
        'success',
        `Tenant "${tenant.name}" status updated to ${newStatus}.`
      );
      fetchTenants();
      fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change status';
      showNotification('error', msg);
    }
  };

  // Handle Delete Tenant
  const handleDeleteTenant = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await tenantsApi.deleteTenant(deleteTarget.id);
      showNotification(
        'success',
        `Tenant "${deleteTarget.name}" and associated records deleted.`
      );
      setDeleteTarget(null);
      fetchTenants();
      fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tenant';
      showNotification('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Formatter helpers
  const formatQueries = (t: TenantItem) => {
    const used = t.queries_count ?? 0;
    const limit =
      t.entitlements?.monthly_query_limit ??
      getQueryLimitForPlan(t.plan_tier?.toLowerCase() || 'starter');
    return `${used.toLocaleString()} / ${
      limit >= 1000000
        ? `${(limit / 1000000).toFixed(0)}M`
        : limit >= 1000
        ? `${(limit / 1000).toFixed(0)}K`
        : limit
    }`;
  };

  const formatStorage = (t: TenantItem) => {
    const bytes = t.storage_bytes ?? t.entitlements?.storage_bytes ?? 1073741824;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  const formatPlanName = (plan: string) => {
    if (!plan) return 'Starter';
    return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (user && !isSuperAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-400 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Access Restricted</h3>
        <p className="text-xs text-slate-400 mb-4">
          This portal is reserved strictly for Platform Super Administrators.
        </p>
        <Link href="/dashboard" className="btn-primary text-xs">
          Return to Tenant Workspace
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Tenants"
        subtitle="Create, monitor and manage client organizations."
      />

      {/* Superadmin Security Ribbon */}
      <div className="flex items-center justify-between bg-blue-950/40 border border-blue-800/30 rounded-lg px-4 py-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-blue-300">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span>
            Super Admin Governance Mode: You have full platform access to manage, isolate, and audit all tenant organizations.
          </span>
        </div>
        <button
          onClick={() => {
            fetchTenants();
            fetchStats();
          }}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          title="Sync with backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg mb-6 text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="hover:opacity-80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Controls matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>

          {/* Plan Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPlanFilterOpen(!isPlanFilterOpen)}
              className="btn-secondary text-xs flex items-center gap-2 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {selectedPlan === 'all'
                  ? 'All Plans'
                  : formatPlanName(selectedPlan) + ' Plan'}
              </span>
            </button>

            {isPlanFilterOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-[#0d1527] border border-[#1b2a47] rounded-lg shadow-xl z-20 py-1">
                {['all', 'starter', 'growth', 'business', 'enterprise'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPlan(p);
                      setIsPlanFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#131f38] transition ${
                      selectedPlan === p ? 'text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{p === 'all' ? 'All Plans' : formatPlanName(p)}</span>
                    {selectedPlan === p && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Quick Filter Pills */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0d1527] border border-[#1b2a47] rounded-lg p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'trial', label: 'Trial' },
              { id: 'suspended', label: 'Suspended' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tenant name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-9 pr-8 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Tenant Counter Cards matching Screenshot 2 with Live Backend Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`card-panel p-5 cursor-pointer transition border hover:border-blue-500/50 ${
            selectedStatus === 'all' ? 'border-blue-500/60 bg-[#0e1933]' : ''
          }`}
        >
          <p className="text-xs font-medium text-slate-400 mb-1">Total Tenants</p>
          <p className="text-3xl font-bold text-white">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              stats.total
            )}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('active')}
          className={`card-panel p-5 cursor-pointer transition border hover:border-emerald-500/50 ${
            selectedStatus === 'active' ? 'border-emerald-500/60 bg-[#0e1933]' : ''
          }`}
        >
          <p className="text-xs font-medium text-slate-400 mb-1">Active</p>
          <p className="text-3xl font-bold text-white">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              stats.active
            )}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('trial')}
          className={`card-panel p-5 cursor-pointer transition border hover:border-amber-500/50 ${
            selectedStatus === 'trial' ? 'border-amber-500/60 bg-[#0e1933]' : ''
          }`}
        >
          <p className="text-xs font-medium text-slate-400 mb-1">Trial</p>
          <p className="text-3xl font-bold text-amber-400">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              stats.trial
            )}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('suspended')}
          className={`card-panel p-5 cursor-pointer transition border hover:border-rose-500/50 ${
            selectedStatus === 'suspended' ? 'border-rose-500/60 bg-[#0e1933]' : ''
          }`}
        >
          <p className="text-xs font-medium text-slate-400 mb-1">Suspended</p>
          <p className="text-3xl font-bold text-rose-400">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              stats.suspended
            )}
          </p>
        </div>
      </div>

      {/* Main Tenants Table matching Screenshot 2 */}
      <div className="card-panel overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-medium">Loading tenants from server...</p>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Could not load tenants</p>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            <button onClick={fetchTenants} className="btn-secondary text-xs">
              Retry
            </button>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Building2 className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-white mb-1">No tenants found</p>
            <p className="text-xs text-slate-400 mb-4">
              {search
                ? `No tenant matched "${search}".`
                : 'No tenants match the current filters.'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedStatus('all');
                setSelectedPlan('all');
              }}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Queries</th>
                  <th className="py-3 px-4">Storage</th>
                  <th className="py-3 px-4">Assistants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {filteredTenants.map((t) => {
                  const statusNormalized = (t.status || 'active').toLowerCase();
                  return (
                    <tr key={t.id} className="table-row">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span className="text-white hover:text-blue-400 transition font-medium">
                            <Link href={`/admin/tenants/${t.id}`}>{t.name}</Link>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.slug}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-blue-950/60 border border-blue-800/40 text-blue-300 px-2 py-0.5 rounded text-[11px] font-medium">
                          {formatPlanName(t.plan_tier)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">
                        {formatQueries(t)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatStorage(t)}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {t.assistants_count ?? 1}
                      </td>
                      <td className="py-3.5 px-4 relative">
                        {/* Status badge with quick dropdown */}
                        <button
                          onClick={() =>
                            setStatusMenuTenantId(
                              statusMenuTenantId === t.id ? null : t.id
                            )
                          }
                          className="cursor-pointer group flex items-center gap-1.5"
                          title="Click to change status"
                        >
                          <span
                            className={
                              statusNormalized === 'active'
                                ? 'badge-active'
                                : statusNormalized === 'trial'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }
                          >
                            {statusNormalized.charAt(0).toUpperCase() +
                              statusNormalized.slice(1)}
                          </span>
                        </button>

                        {/* Status Change Dropdown */}
                        {statusMenuTenantId === t.id && (
                          <div className="absolute left-4 top-10 w-32 bg-[#0d1527] border border-[#1b2a47] rounded-lg shadow-2xl z-30 py-1">
                            {(['active', 'trial', 'suspended'] as const).map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(t, s)}
                                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#131f38] transition flex items-center justify-between ${
                                  statusNormalized === s
                                    ? 'text-blue-400 font-semibold'
                                    : 'text-slate-300'
                                }`}
                              >
                                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                                {statusNormalized === s && (
                                  <Check className="w-3 h-3 text-blue-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {formatDate(t.updated_at || t.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/tenants/${t.id}`}
                            className="inline-flex items-center gap-1 bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2 py-1 rounded text-xs transition"
                            title="View Tenant Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>

                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1 hover:bg-[#1b2a47] text-slate-400 hover:text-blue-400 rounded transition cursor-pointer"
                            title="Edit Tenant"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-1 hover:bg-[#1b2a47] text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                            title="Delete Tenant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => {
                setAddFormError(null);
                setIsAddModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Add New Client Organization
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provisions a dedicated multi-tenant workspace with isolated storage and permissions.
            </p>

            {addFormError && (
              <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-md flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span>{getFriendlyErrorMessage(addFormError)}</span>
                  <p className="mt-1 text-rose-400/80">
                    A tenant may already have been created despite this error — close
                    this dialog and check the tenant list before resubmitting, to avoid
                    creating a duplicate.
                  </p>
                  {isTechnicalErrorMessage(addFormError) && (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-rose-400/70 hover:text-rose-300">
                        Show technical details
                      </summary>
                      <p className="mt-1 text-rose-400/70 break-words">{addFormError}</p>
                    </details>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Organization / Tenant Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberdyne Systems"
                  value={addForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-dark w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Tenant Slug (URL Safe ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. cyberdyne-systems"
                  value={addForm.slug}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="input-dark w-full text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Commercial Plan</label>
                  <select
                    value={addForm.plan_tier}
                    onChange={(e) => {
                      setAddForm((prev) => ({
                        ...prev,
                        plan_tier: e.target.value,
                        monthly_query_limit: getQueryLimitForPlan(e.target.value),
                      }));
                    }}
                    className="input-dark w-full text-xs"
                  >
                    {PLAN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="input-dark w-full text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Initial Tenant Admin Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="admin@cyberdyne.com"
                  value={addForm.admin_email}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, admin_email: e.target.value }))
                  }
                  className="input-dark w-full text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  If provided, an admin user is created and a temporary password is sent.
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Monthly Query Entitlement
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={addForm.monthly_query_limit}
                  disabled={addForm.plan_tier !== 'enterprise'}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      monthly_query_limit: Number(e.target.value),
                    }))
                  }
                  className="input-dark w-full text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {addForm.plan_tier !== 'enterprise' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Set by the selected plan. Choose Enterprise (Custom) to set a custom limit.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2a47]">
                <button
                  type="button"
                  onClick={() => {
                    setAddFormError(null);
                    setIsAddModalOpen(false);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Tenant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => {
                setEditFormError(null);
                setEditTarget(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Edit Organization Settings
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Update commercial tier, identifiers, and resource entitlements for {editTarget.name}.
            </p>

            {editFormError && (
              <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-md flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span>{getFriendlyErrorMessage(editFormError)}</span>
                  {isTechnicalErrorMessage(editFormError) && (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-rose-400/70 hover:text-rose-300">
                        Show technical details
                      </summary>
                      <p className="mt-1 text-rose-400/70 break-words">{editFormError}</p>
                    </details>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateTenant} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Organization / Tenant Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-dark w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Tenant Slug</label>
                <input
                  type="text"
                  required
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="input-dark w-full text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Plan Tier</label>
                  <select
                    value={editForm.plan_tier}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        plan_tier: e.target.value,
                        monthly_query_limit:
                          e.target.value === 'enterprise'
                            ? prev.monthly_query_limit
                            : getQueryLimitForPlan(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  >
                    {PLAN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="input-dark w-full text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Monthly Query Entitlement
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={editForm.monthly_query_limit}
                  disabled={editForm.plan_tier !== 'enterprise'}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      monthly_query_limit: Number(e.target.value),
                    }))
                  }
                  className="input-dark w-full text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editForm.plan_tier !== 'enterprise' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Set by the selected plan. Choose Enterprise (Custom) to set a custom limit.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2a47]">
                <button
                  type="button"
                  onClick={() => {
                    setEditFormError(null);
                    setEditTarget(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Tenant Organization"
        subject={deleteTarget?.name}
        description={
          <span>
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">{deleteTarget?.name}</strong>? This action
            will completely delete all associated workspaces, users, knowledge base
            documents, embeddings, and chat history. This cannot be undone.
          </span>
        }
        confirmLabel="Delete Tenant"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteTenant}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
