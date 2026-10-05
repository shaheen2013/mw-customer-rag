'use client';

import React from 'react';
import Header from '@/components/Header';

export default function AdminInfrastructurePage() {
  return (
    <div>
      <Header
        title="Infrastructure & Cluster Health"
        subtitle="Monitor database connections, vector index nodes, and scraping workers."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">MySQL Database Pool</p>
          <p className="text-2xl font-bold text-emerald-400">10 / 10 Active</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Vector Indexing Queue</p>
          <p className="text-2xl font-bold text-white">0 Pending</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs text-slate-400 mb-1">Crawler Workers</p>
          <p className="text-2xl font-bold text-blue-400">4 Idle / Healthy</p>
        </div>
      </div>
    </div>
  );
}
