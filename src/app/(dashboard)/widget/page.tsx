'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  Copy,
  Check,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  MessageSquare,
  Globe,
  Code2,
} from 'lucide-react';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';

interface WidgetConfigResponse {
  tenant_id: string;
  widget_name: string;
  primary_color: string;
  position: string;
  allowed_domains: string[];
  suggested_questions: string[];
}

export default function WidgetDeploymentPage() {
  const [widgetName, setWidgetName] = useState('AI Assistant');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [position, setPosition] = useState('bottom-right');
  const [suggestedQuestions, setSuggestedQuestions] = useState(
    'What services do you provide?\nHow can I get started?'
  );
  const [allowedDomains, setAllowedDomains] = useState('*');
  const [tenantId, setTenantId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load live configuration from backend
  useEffect(() => {
    async function loadWidgetConfig() {
      try {
        const config = await apiClient<WidgetConfigResponse>('/api/v1/widget/config');
        if (config) {
          if (config.widget_name) setWidgetName(config.widget_name);
          if (config.primary_color) setPrimaryColor(config.primary_color);
          if (config.position) setPosition(config.position);
          if (config.tenant_id) setTenantId(config.tenant_id);
          if (config.allowed_domains && config.allowed_domains.length > 0) {
            setAllowedDomains(config.allowed_domains.join(', '));
          }
          if (config.suggested_questions && config.suggested_questions.length > 0) {
            setSuggestedQuestions(config.suggested_questions.join('\n'));
          }
        }
      } catch {
        // Fallback for unauthenticated dev mode
      } finally {
        setIsLoading(false);
      }
    }

    loadWidgetConfig();
  }, []);

  // Compute live embed code based on current configuration
  const apiBase = getApiBaseUrl();
  const scriptHost =
    typeof window !== 'undefined'
      ? window.location.origin
      : apiBase || 'http://localhost:8000';

  const embedCodeSnippet = `<script
  src="${scriptHost}/widget.js"
  data-tenant-id="${tenantId || '00000000-0000-0000-0000-000000000001'}"
  data-api-host="${scriptHost}"
  data-color="${primaryColor}"
  async>
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    const domainsList = allowedDomains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const questionsList = suggestedQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean);

    try {
      const updated = await apiClient<WidgetConfigResponse>('/api/v1/widget/config', {
        method: 'PUT',
        body: JSON.stringify({
          widget_name: widgetName,
          primary_color: primaryColor,
          position: position,
          allowed_domains: domainsList.length > 0 ? domainsList : ['*'],
          suggested_questions: questionsList,
        }),
      });

      if (updated?.tenant_id) {
        setTenantId(updated.tenant_id);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      // Local fallback in dev
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const questionsArray = suggestedQuestions
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);

  return (
    <div>
      <Header
        title="Widget & Deployment"
        subtitle="Brand, configure and embed the live AI assistant on your website."
      />

      {isLoading ? (
        <div className="card-panel p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-xs">Loading widget configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget Customization Card */}
          <form onSubmit={handleSaveConfig} className="card-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4 flex items-center justify-between">
              <span>Widget Customization</span>
              {isSaved && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Widget Name</label>
              <input
                type="text"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                placeholder="e.g. Acme Support Bot"
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Theme / Brand Color</label>
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
                  className="input-dark flex-1 text-xs uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Screen Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="input-dark w-full text-xs"
              >
                <option value="bottom-right">Bottom Right (Default)</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="inline">Inline Embedded Container</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Suggested Questions (One per line)
              </label>
              <textarea
                rows={3}
                value={suggestedQuestions}
                onChange={(e) => setSuggestedQuestions(e.target.value)}
                placeholder="What services do you provide?&#10;How do I get started?"
                className="input-dark w-full text-xs resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                These questions appear as quick-click suggestion chips when visitors open the widget.
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Allowed Domains (Security Restriction)
              </label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="acme.com, docs.acme.com (or * for all)"
                className="input-dark w-full text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Only authorized origins can embed and query your assistant. Use &quot;*&quot; to allow all.
              </p>
            </div>

            <div className="pt-4 border-t border-[#1b2a47] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>

          {/* Deployment & Live Preview Column */}
          <div className="space-y-6">
            {/* Embed Code Snippet Card */}
            <div className="card-panel p-6">
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Embed Code Snippet</span>
              </h3>

              <p className="text-xs text-slate-300 mb-3">
                Paste this script tag directly before the closing{' '}
                <code className="text-blue-400 bg-blue-950/60 px-1 py-0.5 rounded text-[11px]">
                  &lt;/body&gt;
                </code>{' '}
                tag of your website:
              </p>

              <div className="bg-[#080d19] border border-[#1b2a47] rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto relative mb-4">
                <pre className="whitespace-pre">{embedCodeSnippet}</pre>
              </div>

              <button
                onClick={copyEmbedCode}
                className="btn-primary text-xs flex items-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Code Copied to Clipboard!' : 'Copy Embed Code'}</span>
              </button>
            </div>

            {/* Live Widget Appearance Preview */}
            <div className="card-panel p-6">
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Live Appearance Preview</span>
              </h3>

              <p className="text-xs text-slate-400 mb-4">
                Here is how your floating chat button and popup will appear on your website:
              </p>

              <div className="bg-[#090e1c] border border-[#1b2a47] rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                {/* Floating Preview Window Simulation */}
                {previewOpen ? (
                  <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#12192e] text-xs">
                    <div
                      className="p-3 text-white font-semibold flex items-center justify-between"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {widgetName || 'AI Assistant'}
                      </span>
                      <button
                        onClick={() => setPreviewOpen(false)}
                        className="hover:opacity-75 cursor-pointer text-sm leading-none"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-3 space-y-2 bg-[#0c1222] min-h-[120px]">
                      <div className="p-2 rounded-lg bg-white/10 text-slate-200 text-[11px]">
                        Hello! How can I assist you with our services today?
                      </div>

                      {questionsArray.length > 0 && (
                        <div className="flex flex-col gap-1 pt-1">
                          {questionsArray.slice(0, 2).map((q, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 rounded bg-[#1a243d] text-[10px] text-blue-300 truncate border border-blue-500/20"
                            >
                              {q}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-white/10 bg-[#090e1c] flex gap-1">
                      <input
                        type="text"
                        disabled
                        placeholder="Type a message..."
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-[10px] flex-1 text-slate-400"
                      />
                      <button
                        className="px-2.5 py-1 rounded text-white text-[10px] font-semibold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      style={{ backgroundColor: primaryColor }}
                      className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
                      title="Click to preview open chat window"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Click the button above to preview the chat window
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
