"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import Header from "@/components/Header";
import {
  getFriendlyErrorMessage,
  isTechnicalErrorMessage,
} from "@/lib/api-client";
import {
  PlanEntitlementUpdatePayload,
  PlanItem,
  plansApi,
} from "@/lib/api/plans";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit3,
  Loader2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const GB = 1073741824;

interface EditValues {
  monthly_query_limit: number;
  max_pages: number;
  max_documents: number;
  storage_gb: number;
  max_assistants: number;
  sync_frequency_hours: number;
}

export default function PlansBillingPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [configureTarget, setConfigureTarget] = useState<PlanItem | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({
    monthly_query_limit: 0,
    max_pages: 0,
    max_documents: 0,
    storage_gb: 0,
    max_assistants: 0,
    sync_frequency_hours: 0,
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [savingEntitlements, setSavingEntitlements] = useState(false);

  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(
      () =>
        setNotification((curr) => (curr?.message === message ? null : curr)),
      4500,
    );
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await plansApi.getPlans();
      setPlans(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount; fetchPlans() above is reused imperatively for
  // Retry and for refreshing after a save (effects can't call a shared
  // stateful callback directly — see react-hooks/set-state-in-effect).
  useEffect(() => {
    plansApi
      .getPlans()
      .then((res) => setPlans(res.data || []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load plans");
      })
      .finally(() => setLoading(false));
  }, []);

  const openConfigure = (plan: PlanItem) => {
    setConfigureTarget(plan);
    setModalError(null);
    setEditValues({
      monthly_query_limit: plan.entitlements.monthly_query_limit,
      max_pages: plan.entitlements.max_pages,
      max_documents: plan.entitlements.max_documents,
      storage_gb:
        Math.round((plan.entitlements.storage_bytes / GB) * 100) / 100,
      max_assistants: plan.entitlements.max_assistants,
      sync_frequency_hours: plan.entitlements.sync_frequency_hours,
    });
  };

  const closeConfigure = () => {
    setConfigureTarget(null);
    setModalError(null);
  };

  const handleSaveEntitlements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configureTarget) return;

    setSavingEntitlements(true);
    setModalError(null);
    try {
      const payload: PlanEntitlementUpdatePayload = {
        monthly_query_limit: editValues.monthly_query_limit,
        max_pages: editValues.max_pages,
        max_documents: editValues.max_documents,
        storage_bytes: Math.round(editValues.storage_gb * GB),
        max_assistants: editValues.max_assistants,
        sync_frequency_hours: editValues.sync_frequency_hours,
      };
      await plansApi.updatePlanEntitlements(configureTarget.tier, payload);
      showNotification(
        "success",
        `${configureTarget.display_name} entitlements updated (in-memory). Edit plans_config.py to persist across restarts.`,
      );
      closeConfigure();
      fetchPlans();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to update entitlements",
      );
    } finally {
      setSavingEntitlements(false);
    }
  };

  const handleApplyToTenants = async () => {
    if (!configureTarget) return;
    setApplying(true);
    try {
      const res = await plansApi.applyPlanToTenants(configureTarget.tier);
      showNotification(
        "success",
        `Applied to ${res.updated_tenant_count} tenant${res.updated_tenant_count === 1 ? "" : "s"}.`,
      );
      setApplyConfirmOpen(false);
      closeConfigure();
      fetchPlans();
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to apply entitlements",
      );
      setApplyConfirmOpen(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <Header
        title="Plans & Usage"
        subtitle="Configure commercial plans, limits and entitlements."
        hideTenantSwitcher
      />

      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg mb-6 text-xs font-medium border ${
            notification.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
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

      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card-panel p-6 animate-pulse">
                <div className="h-4 w-20 bg-[#1b2a47] rounded mb-3" />
                <div className="h-3 w-28 bg-[#1b2a47] rounded mb-4" />
                <div className="h-8 w-16 bg-[#1b2a47] rounded mb-4" />
                <div className="pt-4 border-t border-[#1b2a47] space-y-2">
                  <div className="h-3 w-full bg-[#1b2a47] rounded" />
                  <div className="h-3 w-3/4 bg-[#1b2a47] rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="card-panel overflow-hidden p-4 animate-pulse space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full bg-[#1b2a47] rounded" />
            ))}
          </div>
        </>
      ) : error ? (
        <div className="card-panel p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
          <p className="text-sm font-semibold text-white mb-1">
            Could not load plans
          </p>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button onClick={fetchPlans} className="btn-secondary text-xs">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 4 Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className="card-panel p-6 flex flex-col justify-between relative hover:border-blue-500/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white">
                      {plan.display_name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      {plan.tenant_count} tenant
                      {plan.tenant_count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{plan.tagline}</p>

                  <div className="text-3xl font-extrabold text-blue-500 mb-4 tracking-tight">
                    {plan.price_label}
                  </div>

                  <ul className="text-xs text-slate-400 space-y-1.5 pt-4 border-t border-[#1b2a47]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Commercial Entitlements Table */}
          <div className="card-panel overflow-hidden">
            <div className="p-4 border-b border-[#1b2a47]">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Plan Active Subscriptions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="table-header">
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Tenants</th>
                    <th className="py-3 px-4">MRR</th>
                    <th className="py-3 px-4">Query Limit</th>
                    <th className="py-3 px-4">Storage</th>
                    <th className="py-3 px-4">Assistants</th>
                    <th className="py-3 px-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-300">
                  {plans.map((plan) => (
                    <tr key={plan.tier} className="table-row">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {plan.display_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-400">
                        {plan.tenant_count} active
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {plan.mrr_label}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {plan.display.queries}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {plan.display.storage}
                      </td>
                      <td className="py-3.5 px-4">{plan.display.assistants}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openConfigure(plan)}
                          className="inline-flex items-center gap-1 bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Configure Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Configure Plan Modal */}
      {configureTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeConfigure}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Configure {configureTarget.display_name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Edit default entitlements for the{" "}
              <span className="font-mono">{configureTarget.tier}</span> tier.
            </p>

            {modalError && (
              <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/30 rounded-md flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span>{getFriendlyErrorMessage(modalError)}</span>
                  {isTechnicalErrorMessage(modalError) && (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-rose-400/70 hover:text-rose-300">
                        Show technical details
                      </summary>
                      <p className="mt-1 text-rose-400/70 wrap-break">
                        {modalError}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEntitlements} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Monthly Query Limit
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editValues.monthly_query_limit}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        monthly_query_limit: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Max Assistants
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editValues.max_assistants}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        max_assistants: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Max Pages
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editValues.max_pages}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        max_pages: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Max Documents
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editValues.max_documents}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        max_documents: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Storage (GB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={editValues.storage_gb}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        storage_gb: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Sync Frequency (hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editValues.sync_frequency_hours}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        sync_frequency_hours: Number(e.target.value),
                      }))
                    }
                    className="input-dark w-full text-xs"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-950/40 border border-blue-800/30 rounded-md text-[11px] text-blue-300">
                Changes to this tier&apos;s defaults are applied in-memory
                immediately. To persist them across server restarts, edit{" "}
                <span className="font-mono">plans_config.py</span> on the
                backend. Existing tenants on this plan keep their current
                entitlements unless you apply the update below.
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1b2a47]">
                <button
                  type="button"
                  onClick={() => setApplyConfirmOpen(true)}
                  disabled={savingEntitlements || applying}
                  className="btn-secondary text-xs disabled:opacity-50"
                >
                  Apply to All Tenants
                </button>
                <button
                  type="submit"
                  disabled={savingEntitlements}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {savingEntitlements && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to All Tenants confirmation */}
      <ConfirmDialog
        open={applyConfirmOpen}
        title="Apply Entitlements to All Tenants"
        variant="info"
        description={
          configureTarget ? (
            <span>
              This will push the current{" "}
              <strong className="text-white">
                {configureTarget.display_name}
              </strong>{" "}
              entitlements to all{" "}
              <strong className="text-white">
                {configureTarget.tenant_count}
              </strong>{" "}
              tenant{configureTarget.tenant_count === 1 ? "" : "s"} on this
              plan. This cannot be undone automatically.
            </span>
          ) : undefined
        }
        confirmLabel="Apply to Tenants"
        loading={applying}
        onConfirm={handleApplyToTenants}
        onCancel={() => setApplyConfirmOpen(false)}
      />
    </div>
  );
}
