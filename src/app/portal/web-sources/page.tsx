'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Plus, RefreshCw, Globe, CheckCircle } from 'lucide-react';
import { mockDatabase } from '@/lib/db';

export default function WebSourcesPage() {
  const [sources, setSources] = useState(mockDatabase.webSources);
  const [newUrl, setNewUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    const newEntry = {
      id: sources.length + 1,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      pages: 18,
      frequency: 'Daily',
      lastSync: 'Just now',
      index: 'Connected',
      errors: 0,
      status: 'Active',
    };
    setSources([newEntry, ...sources]);
    setNewUrl('');
    setIsModalOpen(false);
  };

  return (
    <div>
      <Header
        title="Web Sources"
        subtitle="Crawl, sync and manage website knowledge."
      />

      {/* Action Buttons matching Screenshot 7 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Website</span>
        </button>

        <button className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Sync All</span>
        </button>
      </div>

      {/* 4 Status Cards matching Screenshot 7 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Websites</p>
          <p className="text-3xl font-bold text-white">3</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Pages Indexed</p>
          <p className="text-3xl font-bold text-white">428</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Last Sync</p>
          <p className="text-3xl font-bold text-slate-200">2h ago</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Crawl Errors</p>
          <p className="text-3xl font-bold text-rose-400">7</p>
        </div>
      </div>

      {/* Web Sources Table matching Screenshot 7 */}
      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">Source URL</th>
                <th className="py-3 px-4">Pages</th>
                <th className="py-3 px-4">Sync Frequency</th>
                <th className="py-3 px-4">Last Sync</th>
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Errors</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {sources.map((s) => (
                <tr key={s.id} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{s.url}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-blue-400">{s.pages}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.frequency}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.lastSync}</td>
                  <td className="py-3.5 px-4">
                    <span className="badge-active">Connected</span>
                  </td>
                  <td className="py-3.5 px-4 text-rose-400 font-medium">{s.errors}</td>
                  <td className="py-3.5 px-4">
                    <span className="badge-active">{s.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Website Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card-panel p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Website Crawl Source</h3>
            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Website URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://acme.com/docs"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="input-dark w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Start Crawl & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
