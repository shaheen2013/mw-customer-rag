'use client';

import React from 'react';
import Header from '@/components/Header';
import { Zap } from 'lucide-react';

export default function TenantPlanUsagePage() {
  return (
    <div>
      <Header
        title="Plan & Usage"
        subtitle="Current subscription, quotas and usage consumption."
      />

      {/* Plan Summary Banner matching PDF Screenshot 14 */}
      <div className="card-panel p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-blue-500">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Business Plan</h2>
          <p className="text-xs text-slate-400">Renews Oct 24, 2026 • Billing email: billing@acme.com</p>
        </div>
        <button className="btn-primary text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" />
          <span>Upgrade Plan</span>
        </button>
      </div>

      {/* 4 Usage Quota Meter Progress Cards matching Screenshot 14 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-2">AI Queries</p>
          <p className="text-2xl font-bold text-white mb-3">4,200 <span className="text-xs font-normal text-slate-400">/ 10,000</span></p>
          <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-2">Website Pages</p>
          <p className="text-2xl font-bold text-white mb-3">428 <span className="text-xs font-normal text-slate-400">/ 2,000</span></p>
          <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '21.4%' }}></div>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-2">Documents</p>
          <p className="text-2xl font-bold text-white mb-3">83 <span className="text-xs font-normal text-slate-400">/ 500</span></p>
          <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '16.6%' }}></div>
          </div>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-2">Storage</p>
          <p className="text-2xl font-bold text-white mb-3">8.6 <span className="text-xs font-normal text-slate-400">/ 20 GB</span></p>
          <div className="w-full bg-[#121e36] h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '43%' }}></div>
          </div>
        </div>
      </div>

      {/* Usage & Invoice History Table matching Screenshot 14 */}
      <div className="card-panel overflow-hidden">
        <div className="p-4 border-b border-[#1b2a47]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Usage & Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Queries</th>
                <th className="py-3 px-4">API Cost</th>
                <th className="py-3 px-4">Storage</th>
                <th className="py-3 px-4">Overage</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {[
                { period: 'Sep 2026', queries: '8,420', cost: '$412.75', storage: '8.6 GB', overage: 'None', status: 'View PDF' },
                { period: 'Aug 2026', queries: '7,150', cost: '$350.20', storage: '6.4 GB', overage: 'None', status: 'View PDF' },
                { period: 'Jul 2026', queries: '6,200', cost: '$310.00', storage: '5.1 GB', overage: 'None', status: 'View PDF' },
              ].map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white">{row.period}</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">{row.queries}</td>
                  <td className="py-3.5 px-4">{row.cost}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.storage}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.overage}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition">
                      {row.status}
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
