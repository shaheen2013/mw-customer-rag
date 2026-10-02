'use client';

import React from 'react';
import Header from '@/components/Header';
import { Check, Edit3 } from 'lucide-react';

export default function PlansBillingPage() {
  const plansData = [
    { name: 'Starter', queries: '1K queries', price: '$29/mo', tenants: 12, mrr: '$348', limit: '1,000 / mo', storage: '1 GB', assistants: 1 },
    { name: 'Growth', queries: '5K queries', price: '$79/mo', tenants: 18, mrr: '$1,422', limit: '5,000 / mo', storage: '5 GB', assistants: 1 },
    { name: 'Business', queries: '15K queries', price: '$199/mo', tenants: 9, mrr: '$1,791', limit: '15,000 / mo', storage: '20 GB', assistants: 3 },
    { name: 'Enterprise', queries: 'Custom queries', price: 'Custom/mo', tenants: 3, mrr: '$5,550', limit: 'Custom', storage: 'Custom', assistants: 'Unlimited' },
  ];

  return (
    <div>
      <Header
        title="Plans & Usage"
        subtitle="Configure commercial plans, limits and entitlements."
      />

      {/* 4 Plan Cards matching PDF Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plansData.map((plan, index) => (
          <div key={index} className="card-panel p-6 flex flex-col justify-between relative hover:border-blue-500/50 transition">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{plan.queries}</p>

              <div className="text-3xl font-extrabold text-blue-500 mb-4 tracking-tight">
                {plan.price}
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 pt-4 border-t border-[#1b2a47]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pages • Docs • Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assistant Limits Configurable</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commercial Entitlements Table matching Screenshot 4 */}
      <div className="card-panel overflow-hidden">
        <div className="p-4 border-b border-[#1b2a47]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Plan Active Subscriptions</h3>
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
              {plansData.map((row, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white">{row.name}</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">{row.tenants} active</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{row.mrr}</td>
                  <td className="py-3.5 px-4 text-slate-300">{row.limit}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.storage}</td>
                  <td className="py-3.5 px-4">{row.assistants}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="inline-flex items-center gap-1 bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs">
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
    </div>
  );
}
