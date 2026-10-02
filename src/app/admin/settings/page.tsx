'use client';

import React from 'react';
import Header from '@/components/Header';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <Header
        title="System Settings"
        subtitle="Platform configuration, API keys, and infrastructure policies."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-3">System Controls</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="p-2 bg-[#121e36] rounded border border-[#1b2a47] font-semibold text-blue-400">Global LLM API Keys</li>
            <li className="p-2 hover:bg-[#121e36] rounded cursor-pointer">Vector Database Cluster</li>
            <li className="p-2 hover:bg-[#121e36] rounded cursor-pointer">Security & Audit Policy</li>
            <li className="p-2 hover:bg-[#121e36] rounded cursor-pointer">Web Crawler Throttling</li>
          </ul>
        </div>

        <div className="md:col-span-2 card-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Global LLM Configuration</h3>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Default Provider Model</label>
            <select className="input-dark w-full text-xs">
              <option>OpenAI GPT-4o (Default Grounded RAG)</option>
              <option>Anthropic Claude 3.5 Sonnet</option>
              <option>Local Llama 3 70B Instruct</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">OpenAI Master API Key</label>
            <input type="password" value="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="input-dark w-full text-xs text-slate-400" />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Default Max Context Token Chunk Size</label>
            <input type="number" defaultValue={1024} className="input-dark w-full text-xs" />
          </div>

          <button className="btn-primary text-xs flex items-center gap-2 mt-4">
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
