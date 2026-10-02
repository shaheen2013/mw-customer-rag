'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { mockDatabase } from '@/lib/db';

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tenants, setTenants] = useState(mockDatabase.tenants);

  const [newTenantName, setNewTenantName] = useState('');
  const [newPlan, setNewPlan] = useState('Growth');

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName) return;
    const newEntry = {
      id: tenants.length + 1,
      name: newTenantName,
      plan: newPlan,
      queries: '0 / 5K',
      storage: '0.1 GB',
      assistants: 1,
      status: 'Active',
      lastActive: 'Just now',
      cost: '$79.00',
    };
    setTenants([newEntry, ...tenants]);
    setNewTenantName('');
    setIsAddModalOpen(false);
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header
        title="Tenants"
        subtitle="Create, monitor and manage client organizations."
      />

      {/* Top Action Controls matching PDF Screenshot 2 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>

          <button className="btn-secondary text-xs flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>All Plans</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark w-full pl-9 text-xs"
          />
        </div>
      </div>

      {/* 4 Tenant Counter Cards matching Screenshot 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Total Tenants</p>
          <p className="text-3xl font-bold text-white">42</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Active</p>
          <p className="text-3xl font-bold text-white">39</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Trial</p>
          <p className="text-3xl font-bold text-amber-400">2</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Suspended</p>
          <p className="text-3xl font-bold text-rose-400">1</p>
        </div>
      </div>

      {/* Main Tenants Table matching Screenshot 2 */}
      <div className="card-panel overflow-hidden">
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
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {filtered.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white">{t.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-950/60 border border-blue-800/40 text-blue-300 px-2 py-0.5 rounded text-[11px] font-medium">
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium">{t.queries}</td>
                  <td className="py-3.5 px-4 text-slate-400">{t.storage}</td>
                  <td className="py-3.5 px-4 font-medium">{t.assistants}</td>
                  <td className="py-3.5 px-4">
                    <span className={t.status === 'Active' ? 'badge-active' : t.status === 'Trial' ? 'badge-warning' : 'badge-danger'}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{t.lastActive}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="inline-flex items-center gap-1 bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Client Tenant</h3>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Organization / Tenant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberdyne Systems"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Commercial Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="input-dark w-full text-xs"
                >
                  <option value="Starter">Starter ($29/mo)</option>
                  <option value="Growth">Growth ($79/mo)</option>
                  <option value="Business">Business ($199/mo)</option>
                  <option value="Enterprise">Enterprise (Custom)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
