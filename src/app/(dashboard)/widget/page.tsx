'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Copy, Check, Code, ShieldCheck } from 'lucide-react';

export default function WidgetDeploymentPage() {
  const [widgetName, setWidgetName] = useState('Acme AI Assistant');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [position, setPosition] = useState('Bottom Right');
  const [welcomeMsg, setWelcomeMsg] = useState('Hello! How can I help you today?');
  const [suggestedQuestions, setSuggestedQuestions] = useState('What is your refund policy?\nHow do I upgrade my plan?\nDo you offer REST API access?');

  const [allowedDomains, setAllowedDomains] = useState('acme.com, docs.acme.com');
  const [copied, setCopied] = useState(false);

  const embedCodeSnippet = `<script
  src="https://cdn.mediusware.ai/widget.js"
  data-tenant-id="tenant_acme_8420"
  data-color="${primaryColor}"
  async>
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Header
        title="Widget & Deployment"
        subtitle="Brand, secure and deploy the chatbot on your website."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget Customization Card matching PDF Screenshot 13 */}
        <div className="card-panel p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4">
            Widget Settings
          </h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Widget Name</label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              className="input-dark w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-9 h-9 rounded bg-[#121e36] border border-[#1b2a47] cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="input-dark flex-1 text-xs uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input-dark w-full text-xs"
            >
              <option>Bottom Right</option>
              <option>Bottom Left</option>
              <option>Inline Embedded Container</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Welcome Message</label>
            <input
              type="text"
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              className="input-dark w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Suggested Questions (One per line)</label>
            <textarea
              rows={3}
              value={suggestedQuestions}
              onChange={(e) => setSuggestedQuestions(e.target.value)}
              className="input-dark w-full text-xs resize-none"
            />
          </div>
        </div>

        {/* Deployment & Allowed Domains Card matching Screenshot 13 */}
        <div className="card-panel p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4">
              Deployment
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Allowed Domains (Security Restriction)</label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="acme.com"
                className="input-dark w-full text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Only requests from authorized origins will load your AI assistant.
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-2">Embed Code Snippet</label>
              <div className="bg-[#080d19] border border-[#1b2a47] rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto relative">
                <pre>{embedCodeSnippet}</pre>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1b2a47] flex justify-start">
            <button
              onClick={copyEmbedCode}
              className="btn-primary text-xs flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
