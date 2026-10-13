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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Total Prompt Tokens</p>
          <p className="text-2xl font-bold text-slate-500">— (coming soon)</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Total Completion Tokens</p>
          <p className="text-2xl font-bold text-slate-500">— (coming soon)</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Est. Gross Margin</p>
          <p className="text-2xl font-bold text-slate-500">— (coming soon)</p>
        </div>
      </div>
    </div>
  );
}
