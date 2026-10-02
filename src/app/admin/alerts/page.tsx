'use client';

import React from 'react';
import Header from '@/components/Header';
import { AlertTriangle } from 'lucide-react';

export default function AdminAlertsPage() {
  return (
    <div>
      <Header
        title="Platform System Alerts"
        subtitle="Active warnings, threshold limits, and service notifications."
      />
      <div className="card-panel overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="table-header">
              <th className="py-3 px-4">Alert Title</th>
              <th className="py-3 px-4">Tenant</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="table-row">
              <td className="py-3 px-4 font-semibold text-white">Embedding Queue Delay</td>
              <td className="py-3 px-4">Acme Corp</td>
              <td className="py-3 px-4"><span className="badge-warning">Medium</span></td>
              <td className="py-3 px-4 text-slate-400">Sep 24, 10:42 AM</td>
            </tr>
            <tr className="table-row">
              <td className="py-3 px-4 font-semibold text-white">Storage Threshold 90%</td>
              <td className="py-3 px-4">Apex AI Labs</td>
              <td className="py-3 px-4"><span className="badge-danger">High</span></td>
              <td className="py-3 px-4 text-slate-400">Sep 23, 04:15 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
