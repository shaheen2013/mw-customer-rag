'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { ArrowLeft, CheckCircle, Bot } from 'lucide-react';

const usageTrendData = [
  { day: 'Sep 1', usage: 1200 },
  { day: 'Sep 5', usage: 2400 },
  { day: 'Sep 10', usage: 3800 },
  { day: 'Sep 15', usage: 5200 },
  { day: 'Sep 20', usage: 6900 },
  { day: 'Sep 24', usage: 8420 },
];

export default function TenantDetailPage() {
  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tenants List</span>
        </Link>
      </div>

      <Header
        title="Tenant Detail - Acme Corp"
        subtitle="Account, usage, assistants and operational health."
      />

      {/* Plan Status Badges matching Screenshot 3 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-purple-900/60 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-md text-xs font-semibold">
          Business Plan
        </span>
        <span className="badge-active py-1 px-3 text-xs font-semibold">
          Active
        </span>
      </div>

      {/* 4 Metric Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Queries</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">8,420 <span className="text-sm font-normal text-slate-400">/ 10K</span></p>
            <span className="text-xs font-semibold text-emerald-400">+12%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">API Cost</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">$412.75</p>
            <span className="text-xs font-semibold text-emerald-400">+8%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Storage</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">8.6 GB</p>
            <span className="text-xs font-semibold text-emerald-400">+5%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Assistants</p>
          <p className="text-2xl font-bold text-white">1 <span className="text-sm font-normal text-slate-400">/ 3</span></p>
        </div>
      </div>

      {/* Usage Trend & Connection Health Row matching Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Usage Trend Line Chart */}
        <div className="card-panel p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Usage Trend</h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData}>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1b2a47', borderRadius: '6px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connection Health Status Box */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Connection Health</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#121e36] rounded-lg border border-[#1b2a47]">
                <span className="text-xs font-medium text-slate-300">Website Crawl Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Synced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#121e36] rounded-lg border border-[#1b2a47]">
                <span className="text-xs font-medium text-slate-300">Knowledge Index Vector DB</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Healthy
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4">Last synchronization completed today at 10:42 AM.</p>
        </div>
      </div>

      {/* Connected Assistants Table matching Screenshot 3 */}
      <div className="card-panel overflow-hidden">
        <div className="p-4 border-b border-[#1b2a47]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Connected Assistant Configs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">Assistant</th>
                <th className="py-3 px-4">Queries</th>
                <th className="py-3 px-4">Sources</th>
                <th className="py-3 px-4">Conversations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {[
                { name: 'Acme General Support', queries: '8,420', sources: '83 docs + 3 sites', convs: '2,840', status: 'Connected' },
                { name: 'Acme Sales Concierge', queries: '0', sources: 'Draft', convs: '0', status: 'Inactive' },
              ].map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span>{row.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium">{row.queries}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.sources}</td>
                  <td className="py-3.5 px-4 text-slate-300">{row.convs}</td>
                  <td className="py-3.5 px-4">
                    <span className={row.status === 'Connected' ? 'badge-active' : 'badge-warning'}>{row.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
