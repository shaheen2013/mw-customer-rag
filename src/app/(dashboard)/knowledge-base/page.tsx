'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Upload, RefreshCw, FileText } from 'lucide-react';
import { mockDatabase } from '@/lib/db';

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState(mockDatabase.documents);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const newDoc = {
      id: docs.length + 1,
      file: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploaded: 'Just now',
      assistant: 'Acme Support',
      status: 'Indexed',
      used: 'Active',
    };
    setDocs([newDoc, ...docs]);
  };

  return (
    <div>
      <Header
        title="Knowledge Base"
        subtitle="Upload and manage documents used by your assistants."
      />

      {/* Action Buttons matching Screenshot 6 */}
      <div className="flex items-center gap-3 mb-6">
        <label className="btn-primary cursor-pointer flex items-center gap-2 text-xs">
          <Upload className="w-4 h-4" />
          <span>Upload Documents</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>

        <button className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Re-index Selected</span>
        </button>
      </div>

      {/* 4 Status Cards matching Screenshot 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Documents</p>
          <p className="text-3xl font-bold text-white">83</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Indexed</p>
          <p className="text-3xl font-bold text-emerald-400">79</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Processing</p>
          <p className="text-3xl font-bold text-amber-400">2</p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Failed</p>
          <p className="text-3xl font-bold text-rose-400">2</p>
        </div>
      </div>

      {/* Main Documents Table matching Screenshot 6 */}
      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">File</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4">Assistant</th>
                <th className="py-3 px-4">Index Status</th>
                <th className="py-3 px-4">Used</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {docs.map((doc) => (
                <tr key={doc.id} className="table-row">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>{doc.file}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#121e36] border border-[#1b2a47] px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{doc.size}</td>
                  <td className="py-3.5 px-4 text-slate-400">{doc.uploaded}</td>
                  <td className="py-3.5 px-4 font-medium text-blue-300">{doc.assistant}</td>
                  <td className="py-3.5 px-4">
                    <span className={doc.status === 'Indexed' ? 'badge-active' : doc.status === 'Processing' ? 'badge-warning' : 'badge-danger'}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{doc.used}</td>
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
    </div>
  );
}
