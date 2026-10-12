'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { tenantsApi, TenantItem } from '@/lib/api/tenants';

export default function AdminUsagePage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantItem[]>([]);

  useEffect(() => {
    tenantsApi
      .getTenants({ limit: 100 })
      .then((res) => setTenants(res.data || []))
      .catch(() => {
        // Non-critical: the switcher just stays empty if this fails.
      });
  }, []);

  return (
    <div>
      <Header
        title="AI Token Usage & Cost Metering"
        subtitle="Detailed token usage breakdowns, vector queries, and LLM provider costs."
        tenantSwitcher={{
          options: tenants.map((t) => ({ id: t.id, name: t.name })),
          activeId: '',
          activeLabel: 'View Tenant',
          onSelect: (id) => router.push(`/admin/tenants/${id}`),
        }}
      />
      <p className="text-[11px] text-slate-500 -mt-4 mb-6">
        The figures below are platform-wide placeholders, not wired to real
        usage data yet. Picking a tenant above takes you to that tenant&apos;s
        real detail page.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Total Prompt Tokens</p>
          <p className="text-2xl font-bold text-white">45.2M tokens</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Total Completion Tokens</p>
          <p className="text-2xl font-bold text-white">12.8M tokens</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Est. Gross Margin</p>
          <p className="text-2xl font-bold text-emerald-400">76.4%</p>
        </div>
      </div>
    </div>
  );
}
