'use client';

import React from 'react';
import Header from '@/components/Header';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Cpu, DollarSign, HardDrive } from 'lucide-react';

const trendData = [
  { day: 'Sep 1', queries: 2400, cost: 120 },
  { day: 'Sep 5', queries: 3200, cost: 180 },
  { day: 'Sep 10', queries: 2800, cost: 150 },
  { day: 'Sep 15', queries: 4500, cost: 230 },
  { day: 'Sep 20', queries: 5100, cost: 290 },
  { day: 'Sep 24', queries: 6800, cost: 340 },
];

export default function SuperAdminDashboard() {
  return (
    <div>
      <Header
        title="Super Admin Dashboard"
        subtitle="Platform health, tenant activity and AI usage."
      />

      {/* Top 4 Metric Cards matching PDF Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Active Tenants</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">42</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              +3
            </span>
          </div>
        </div>

        <div className="card-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">AI Queries</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">1.24M</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              +18%
            </span>
          </div>
        </div>

        <div className="card-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">API Cost</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">$1,245</span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              -12%
            </span>
          </div>
        </div>

        <div className="card-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400">Storage</span>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white tracking-tight">120 GB</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              +8%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts matching PDF Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart 1: AI Queries & Cost Trend */}
        <div className="lg:col-span-2 card-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">AI Queries & Cost Trend</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1b2a47', borderRadius: '6px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queries by Model Breakdown */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Queries by Model</h3>
            <div className="space-y-4 mt-6">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">GPT-4o</span>
                  <span className="text-blue-400 font-bold">52%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">GPT-4.1</span>
                  <span className="text-indigo-400 font-bold">28%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Claude 3.5 Sonnet</span>
                  <span className="text-emerald-400 font-bold">20%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Calculated across 1,240,000 active execution tokens.</p>
        </div>
      </div>

      {/* Bottom Row: Tables matching PDF Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Activity Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="py-2.5 px-4">Tenant</th>
                  <th className="py-2.5 px-4">Queries</th>
                  <th className="py-2.5 px-4">Cost</th>
                  <th className="py-2.5 px-4">Storage</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {['Acme Corp', 'TechFlow Inc', 'Nexus Solutions', 'Global Dynamic', 'Apex AI'].map((name, i) => (
                  <tr key={i} className="table-row">
                    <td className="py-3 px-4 font-semibold text-white">{name}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">8,420</td>
                    <td className="py-3 px-4">$412.75</td>
                    <td className="py-3 px-4 text-slate-400">Sep 24</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">Connected</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47]">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="py-2.5 px-4">Alert</th>
                  <th className="py-2.5 px-4">Tenant</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {[
                  { alert: 'Embedding Queue Delay', tenant: 'Acme Corp', sev: 'Medium', status: 'Sep 24' },
                  { alert: 'High Token Rate Limit', tenant: 'TechFlow', sev: 'Low', status: 'Sep 24' },
                  { alert: 'Crawl Timeout Warning', tenant: 'Nexus', sev: 'Low', status: 'Sep 24' },
                  { alert: 'Storage Limit 90%', tenant: 'Apex AI', sev: 'High', status: 'Sep 24' },
                  { alert: 'API Key Expiring', tenant: 'Global Dyn', sev: 'Low', status: 'Sep 24' },
                ].map((row, i) => (
                  <tr key={i} className="table-row">
                    <td className="py-3 px-4 font-medium text-white">{row.alert}</td>
                    <td className="py-3 px-4 text-slate-400">{row.tenant}</td>
                    <td className="py-3 px-4">
                      <span className={row.sev === 'High' ? 'badge-danger' : 'badge-warning'}>{row.sev}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
