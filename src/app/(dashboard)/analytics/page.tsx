'use client';

import React from 'react';
import Header from '@/components/Header';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

const analyticsTrendData = [
  { day: 'Sep 1', queries: 1200, quality: 90 },
  { day: 'Sep 5', queries: 2400, quality: 91 },
  { day: 'Sep 10', queries: 4100, quality: 93 },
  { day: 'Sep 15', queries: 5900, quality: 92 },
  { day: 'Sep 20', queries: 7200, quality: 94 },
  { day: 'Sep 24', queries: 8420, quality: 92.4 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <Header
        title="Analytics"
        subtitle="Customer questions, answer quality and knowledge intelligence."
      />

      {/* 4 Top Metric Cards matching Screenshot 12 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Queries</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">8,420</p>
            <span className="text-xs font-semibold text-emerald-400">+14%</span>
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
          <p className="text-xs font-medium text-slate-400 mb-1">Fallback Rate</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">4.8%</p>
            <span className="text-xs font-semibold text-emerald-400">-1.2%</span>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Positive Feedback</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-white">87%</p>
            <span className="text-xs font-semibold text-emerald-400">+5%</span>
          </div>
        </div>
      </div>

      {/* Charts & Topics Row matching Screenshot 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card-panel p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Conversation & Answer Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrendData}>
                <defs>
                  <linearGradient id="analyticsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1b2a47', borderRadius: '6px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={2} fill="url(#analyticsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customer Topics matching Screenshot 12 */}
        <div className="card-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Top Customer Topics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-200">Pricing & Package Limits</span>
                  <span className="text-blue-400 font-bold">34%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-200">Integrations (Zapier, SAP)</span>
                  <span className="text-indigo-400 font-bold">21%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-200">Security & GDPR Terms</span>
                  <span className="text-emerald-400 font-bold">15%</span>
                </div>
                <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Calculated from 2,840 verified customer sessions.</p>
        </div>
      </div>

      {/* Bottom Tables matching Screenshot 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Gap Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47]">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Knowledge Gap Intelligence</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-2.5 px-4">Knowledge Gap</th>
                <th className="py-2.5 px-4">Mentions</th>
                <th className="py-2.5 px-4">Trend</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {[
                { gap: 'SAP Integration Guide', mentions: '48 queries', trend: 'Sep 24' },
                { gap: 'SLA Custom Contracts', mentions: '22 queries', trend: 'Sep 24' },
                { gap: 'On-premise deployment', mentions: '14 queries', trend: 'Sep 24' },
              ].map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3 px-4 font-semibold text-amber-400">{row.gap}</td>
                  <td className="py-3 px-4 text-white font-medium">{row.mentions}</td>
                  <td className="py-3 px-4 text-slate-400">{row.trend}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2 py-0.5 rounded text-[11px]">
                      Add Doc
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Source Performance Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#1b2a47]">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Source Utilization</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">Answers Used</th>
                <th className="py-2.5 px-4 text-right">Feedback</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {[
                { source: 'Refund Policy.pdf', used: '1,420 times', feedback: '98% positive' },
                { source: 'https://acme.com/help', used: '980 times', feedback: '91% positive' },
                { source: 'Terms of Service.pdf', used: '410 times', feedback: '84% positive' },
              ].map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3 px-4 font-semibold text-white">{row.source}</td>
                  <td className="py-3 px-4 font-medium text-emerald-400">{row.used}</td>
                  <td className="py-3 px-4 text-slate-300 text-right">{row.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
