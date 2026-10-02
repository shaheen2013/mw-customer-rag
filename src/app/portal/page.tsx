'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Cpu, MessageSquare, CheckCircle2, Database, AlertCircle } from 'lucide-react';
import { mockDatabase } from '@/lib/db';

const tenantTrendData = [
  { day: 'Sep 1', queries: 400, convs: 280 },
  { day: 'Sep 5', queries: 900, convs: 610 },
  { day: 'Sep 10', queries: 1600, convs: 1100 },
  { day: 'Sep 15', queries: 2700, convs: 1800 },
  { day: 'Sep 20', queries: 3500, convs: 2400 },
  { day: 'Sep 24', queries: 4200, convs: 2840 },
];

export default function TenantDashboardPage() {
  return (
    <div>
      <Header
        title="Tenant Dashboard"
        subtitle="AI assistant performance, knowledge health and usage."
      />

      {/* Top 4 Cards matching PDF Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Queries Used</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">4,200 <span className="text-xs font-normal text-slate-400">/ 10K</span></p>
            <span className="text-xs font-semibold text-emerald-400">+14%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Conversations</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">2,840</p>
            <span className="text-xs font-semibold text-emerald-400">+19%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Answer Rate</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">92.4%</p>
            <span className="text-xs font-semibold text-emerald-400">+3%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Knowledge Sources</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">186</p>
            <span className="text-xs font-semibold text-emerald-400">+12</span>
          </div>
        </div>
      </div>

      {/* Charts & Knowledge Health Row matching Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Queries & Conversations trend chart */}
        <div className="lg:col-span-2 card-panel p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Queries & Conversations</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenantTrendData}>
                <defs>
                  <linearGradient id="tenantColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1b2a47', borderRadius: '6px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={2} fill="url(#tenantColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Health panel */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Knowledge Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Indexed sources</span>
                <span className="text-white font-bold text-sm">186</span>
              </div>
              <div className="w-full bg-[#121e36] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Weak / missing topics
                </span>
                <span className="text-amber-400 font-bold text-sm">14</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">14 questions fallback due to unindexed documentation.</p>
        </div>
      </div>

      {/* Bottom Tables matching Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topic Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47]">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Top Customer Topics</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-2.5 px-4">Topic</th>
                <th className="py-2.5 px-4">Questions</th>
                <th className="py-2.5 px-4">Trend</th>
                <th className="py-2.5 px-4">Answer Rate</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {[
                { topic: 'Pricing & Billing', questions: '940', trend: 'Sep 24', rate: '96.2%' },
                { topic: 'API Integration', questions: '580', trend: 'Sep 24', rate: '88.4%' },
                { topic: 'Refund & Returns Policy', questions: '420', trend: 'Sep 24', rate: '99.0%' },
                { topic: 'Security & SLA', questions: '210', trend: 'Sep 24', rate: '91.5%' },
              ].map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3 px-4 font-semibold text-white">{row.topic}</td>
                  <td className="py-3 px-4 font-medium text-blue-400">{row.questions}</td>
                  <td className="py-3 px-4 text-slate-400">{row.trend}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Conversations Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47] flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Conversations</h3>
            <Link href="/portal/conversations" className="text-xs text-blue-400 hover:underline">View All</Link>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-2.5 px-4">Recent Conversation</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {mockDatabase.conversations.slice(0, 4).map((c, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{c.visitor}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{c.topic}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={c.status === 'Answered' ? 'badge-active' : c.status === 'Weak Answer' ? 'badge-warning' : 'badge-danger'}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-right">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
