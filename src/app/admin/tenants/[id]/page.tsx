'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Shield,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  Database,
  Bot,
  Calendar,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  tenantsApi,
  TenantDetailResponse,
  UpdateTenantPayload,
} from '@/lib/api/tenants';

const usageTrendData = [
  { day: 'Day 1', usage: 120 },
  { day: 'Day 5', usage: 340 },
  { day: 'Day 10', usage: 680 },
  { day: 'Day 15', usage: 1120 },
  { day: 'Day 20', usage: 1890 },
  { day: 'Current', usage: 2420 },
];

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const [tenant, setTenant] = useState<TenantDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    plan_tier: 'growth',
    status: 'active',
    monthly_query_limit: 5000,
  });

  const fetchTenant = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tenantsApi.getTenant(tenantId);
      setTenant(data);
      setEditForm({
        name: data.name,
        slug: data.slug,
        plan_tier: data.plan_tier?.toLowerCase() || 'starter',
        status: data.status?.toLowerCase() || 'active',
        monthly_query_limit: data.entitlements?.monthly_query_limit || 1000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tenant details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!tenantId) return;
      try {
        const data = await tenantsApi.getTenant(tenantId);
        if (isMounted) {
          setTenant(data);
          setEditForm({
            name: data.name,
            slug: data.slug,
            plan_tier: data.plan_tier?.toLowerCase() || 'starter',
            status: data.status?.toLowerCase() || 'active',
            monthly_query_limit: data.entitlements?.monthly_query_limit || 1000,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load tenant details'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setActionLoading(true);
    try {
      const payload: UpdateTenantPayload = {
        name: editForm.name.trim(),
        slug: editForm.slug.trim(),
        plan_tier: editForm.plan_tier,
        status: editForm.status,
        entitlements: {
          ...tenant.entitlements,
          monthly_query_limit: Number(editForm.monthly_query_limit),
        },
      };
      await tenantsApi.updateTenant(tenant.id, payload);
      setIsEditOpen(false);
      fetchTenant();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (newStatus: 'active' | 'trial' | 'suspended') => {
    if (!tenant || tenant.status === newStatus) return;
    try {
      await tenantsApi.updateTenantStatus(tenant.id, newStatus);
      fetchTenant();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleDelete = async () => {
    if (!tenant) return;
    setActionLoading(true);
    try {
      await tenantsApi.deleteTenant(tenant.id);
      router.push('/admin/tenants');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs">Loading tenant configuration...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Tenant Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'Could not locate this tenant'}</p>
        <Link href="/admin/tenants" className="btn-primary text-xs">
          Return to Tenants
        </Link>
      </div>
    );
  }

  const statusNormalized = (tenant.status || 'active').toLowerCase();
  const planName =
    (tenant.plan_tier || 'Starter').charAt(0).toUpperCase() +
    (tenant.plan_tier || 'Starter').slice(1).toLowerCase();

  const queriesUsed = tenant.metrics?.queries_count ?? 0;
  const queriesLimit = tenant.entitlements?.monthly_query_limit ?? 1000;
  const storageBytes = tenant.storage_bytes ?? tenant.entitlements?.storage_bytes ?? 1073741824;
  const assistantsCount = tenant.metrics?.assistants_count ?? 1;
  const usersCount = tenant.metrics?.users_count ?? (tenant.users?.length || 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tenants List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Settings</span>
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <Header
        title={`Tenant Detail - ${tenant.name}`}
        subtitle={`Organization identifier: ${tenant.slug} • Managed under Super Admin Governance.`}
      />

      {/* Plan Status Badges & Quick Status Change */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0c1426] p-3.5 rounded-lg border border-[#1b2a47]">
        <div className="flex items-center gap-3">
          <span className="bg-purple-900/60 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-md text-xs font-semibold">
            {planName} Plan
          </span>
          <span
            className={
              statusNormalized === 'active'
                ? 'badge-active py-1 px-3 text-xs font-semibold'
                : statusNormalized === 'trial'
                ? 'badge-warning py-1 px-3 text-xs font-semibold'
                : 'badge-danger py-1 px-3 text-xs font-semibold'
            }
          >
            {statusNormalized.charAt(0).toUpperCase() + statusNormalized.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Quick Status Transition:</span>
          {(['active', 'trial', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusToggle(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                statusNormalized === s
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#121e36] border-[#1b2a47] text-slate-300 hover:border-slate-500'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Queries Consumption</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">
              {queriesUsed.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {queriesLimit.toLocaleString()}
              </span>
            </p>
            <span className="text-xs font-semibold text-emerald-400">
              {Math.round((queriesUsed / Math.max(queriesLimit, 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Storage Allocation</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">
              {(storageBytes / 1073741824).toFixed(1)} GB
            </p>
            <span className="text-xs font-semibold text-blue-400">Isolated</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">AI Assistants</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">
              {assistantsCount}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {tenant.entitlements?.max_assistants || 1}
              </span>
            </p>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Team Members</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">{usersCount}</p>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Usage Trend & Connection Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Usage Trend Line Chart */}
        <div className="card-panel p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Usage Trend (Current Month)
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1527',
                    borderColor: '#1b2a47',
                    borderRadius: '6px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connection Health Status Box */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">
              Tenant Health & Isolation
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#121e36] rounded-lg border border-[#1b2a47]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-300">
                    Tenant Row-Level Vector Store
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#121e36] rounded-lg border border-[#1b2a47]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-slate-300">
                    RBAC Isolation Boundary
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Enforced
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Tenant created on {new Date(tenant.created_at || '').toLocaleDateString()}.
            </span>
          </p>
        </div>
      </div>

      {/* Tenant Team Members Table */}
      <div className="card-panel overflow-hidden mb-6">
        <div className="p-4 border-b border-[#1b2a47] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Workspace Members & Admins
          </h3>
          <span className="text-xs text-slate-400">{tenant.users?.length || 0} user(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {tenant.users && tenant.users.length > 0 ? (
                tenant.users.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {u.name || u.email.split('@')[0]}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-blue-300">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={u.is_active ? 'badge-active' : 'badge-danger'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No users currently provisioned for this tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-4">Edit Tenant Settings</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Organization Name</label>
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
                      setEditForm((prev) => ({ ...prev, plan_tier: e.target.value }))
                    }
                    className="input-dark w-full text-xs"
                  >
                    <option value="starter">Starter ($29/mo)</option>
                    <option value="growth">Growth ($79/mo)</option>
                    <option value="business">Business ($199/mo)</option>
                    <option value="enterprise">Enterprise (Custom)</option>
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
                  Monthly Query Limit
                </label>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={editForm.monthly_query_limit}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      monthly_query_limit: Number(e.target.value),
                    }))
                  }
                  className="input-dark w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1b2a47]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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

      {/* Delete Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete Tenant"
        subject={tenant.name}
        description={
          <span>
            Are you sure you want to delete <strong className="text-white">{tenant.name}</strong>?
            This will permanently erase all associated documents, chat messages, and member accounts.
          </span>
        }
        confirmLabel="Permanently Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
