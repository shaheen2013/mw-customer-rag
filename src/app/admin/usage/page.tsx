'use client';

import React from 'react';
import Header from '@/components/Header';

export default function AdminUsagePage() {
  return (
    <div>
      <Header
        title="AI Token Usage & Cost Metering"
        subtitle="Detailed token usage breakdowns, vector queries, and LLM provider costs."
      />
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
