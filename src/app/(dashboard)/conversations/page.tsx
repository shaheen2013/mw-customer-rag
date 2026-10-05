'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { MessageSquare, AlertTriangle, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import { mockDatabase } from '@/lib/db';

export default function ConversationsPage() {
  const [filter, setFilter] = useState<'All' | 'Answered' | 'Weak' | 'Unanswered'>('All');
  const [selectedConv, setSelectedConv] = useState<(typeof mockDatabase.conversations)[number] | null>(null);

  const convs = mockDatabase.conversations;

  const filteredConvs = convs.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'Answered') return c.status === 'Answered';
    if (filter === 'Weak') return c.status === 'Weak Answer';
    if (filter === 'Unanswered') return c.status === 'Unanswered';
    return true;
  });

  return (
    <div>
      <Header
        title="Conversations"
        subtitle="Review customer questions, answers and unresolved needs."
      />

      {selectedConv ? (
        /* Conversation Detail View matching PDF Screenshot 11 */
        <div>
          <button
            onClick={() => setSelectedConv(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Conversations List</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Transcript Panel */}
            <div className="lg:col-span-2 card-panel p-6 min-h-[400px] flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-6">
                  {selectedConv.visitor} • {selectedConv.date}
                </p>

                <div className="space-y-4 max-w-lg">
                  <div className="p-4 bg-[#121e36] text-slate-200 text-xs rounded-lg border border-[#1b2a47]">
                    <p className="font-semibold text-white mb-1">Customer Question:</p>
                    <p>{selectedConv.topic}</p>
                  </div>

                  <div className="p-4 bg-blue-900/40 text-blue-100 text-xs rounded-lg border border-blue-500/30">
                    <p className="font-semibold text-blue-300 mb-1">AI Grounded Response:</p>
                    <p>{selectedConv.response}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Signals Panel matching Screenshot 11 */}
            <div className="card-panel p-6">
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-6">
                Conversation Signals
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Status</p>
                  <span className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-md font-bold text-xs inline-block">
                    {selectedConv.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Intent</p>
                  <p className="text-xs font-medium text-white">Integration / Feature Query</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Confidence</p>
                  <p className="text-xs font-medium text-slate-300">{selectedConv.confidence}</p>
                </div>

                {selectedConv.gapDetected && (
                  <div className="pt-4 border-t border-[#1b2a47]">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Knowledge gap detected
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      No documentation matches &quot;{selectedConv.topic}&quot;. Upload relevant PDF or web page to resolve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main Conversations List matching PDF Screenshot 10 */
        <div>
          {/* 4 Status Metric Cards matching Screenshot 10 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-panel p-5">
              <p className="text-xs font-medium text-slate-400 mb-1">Conversations</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-white">2,840</p>
                <span className="text-xs font-semibold text-emerald-400">+19%</span>
              </div>
            </div>

            <div className="card-panel p-5">
              <p className="text-xs font-medium text-slate-400 mb-1">Answered</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-white">92.4%</p>
                <span className="text-xs font-semibold text-emerald-400">+3%</span>
              </div>
            </div>

            <div className="card-panel p-5">
              <p className="text-xs font-medium text-slate-400 mb-1">Weak Answers</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-amber-400">128</p>
                <span className="text-xs font-semibold text-rose-400">-8%</span>
              </div>
            </div>

            <div className="card-panel p-5">
              <p className="text-xs font-medium text-slate-400 mb-1">Unanswered</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-rose-400">86</p>
                <span className="text-xs font-semibold text-rose-400">-12%</span>
              </div>
            </div>
          </div>

          {/* Filter Pills matching Screenshot 10 */}
          <div className="flex bg-[#121e36] p-1 rounded-lg border border-[#1b2a47] w-fit mb-6">
            {(['All', 'Answered', 'Weak', 'Unanswered'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                  filter === t ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Conversations Table matching Screenshot 10 */}
          <div className="card-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="table-header">
                    <th className="py-3 px-4">Visitor</th>
                    <th className="py-3 px-4">Topic / Question</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Feedback</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-300">
                  {filteredConvs.map((c) => (
                    <tr key={c.id} className="table-row">
                      <td className="py-3.5 px-4 font-semibold text-white">{c.visitor}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">{c.topic}</td>
                      <td className="py-3.5 px-4">
                        <span className={c.status === 'Answered' ? 'badge-active' : c.status === 'Weak Answer' ? 'badge-warning' : 'badge-danger'}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{c.confidence}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.feedback}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedConv(c)}
                          className="inline-flex items-center gap-1 bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
