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
  LayoutTemplate,
  CheckCircle2,
  Moon,
  Sun,
  Sidebar,
  Sparkles,
} from 'lucide-react';
import { apiClient, getApiBaseUrl } from '@/lib/api-client';

interface WidgetConfigResponse {
  tenant_id: string;
  widget_name: string;
  primary_color: string;
  position: string;
  template?: string;
  is_enabled?: boolean;
  allowed_domains: string[];
  suggested_questions: string[];
}

const TEMPLATES = [
  {
    id: 'modern_dark',
    name: 'Modern Floating',
    badge: 'Popular • Dark Mode',
    icon: Moon,
    desc: 'Floating card with dark slate glassmorphism, online status, and circular bubble launcher.',
    bubbleText: '💬',
    previewType: 'dark',
  },
  {
    id: 'minimal_light',
    name: 'Minimal Light',
    badge: 'Clean & Crisp',
    icon: Sun,
    desc: 'High-contrast light interface with pill capsule launcher button and soft shadows.',
    bubbleText: 'Chat with us 💬',
    previewType: 'light',
  },
  {
    id: 'sidebar_drawer',
    name: 'Edge Drawer',
    badge: 'Enterprise Panel',
    icon: Sidebar,
    desc: 'Full-height edge-docked sidebar panel ideal for documentation and enterprise portals.',
    bubbleText: 'Ask AI Assistant 💬',
    previewType: 'drawer',
  },
];

export default function WidgetDeploymentPage() {
  const [widgetName, setWidgetName] = useState('AI Assistant');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [position, setPosition] = useState('bottom-right');
  const [template, setTemplate] = useState('modern_dark');
  const [isEnabled, setIsEnabled] = useState(true);
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
          if (config.template) setTemplate(config.template);
          if (typeof config.is_enabled === 'boolean') setIsEnabled(config.is_enabled);
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
  const apiHost = apiBase || 'http://localhost:8000';
  const scriptHost =
    typeof window !== 'undefined'
      ? window.location.origin
      : apiHost;

  const embedCodeSnippet = `<script
  src="${scriptHost}/widget.js"
  data-tenant-id="${tenantId || '00000000-0000-0000-0000-000000000001'}"
  data-api-host="${apiHost}"
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
          template: template,
          is_enabled: isEnabled,
          allowed_domains: domainsList.length > 0 ? domainsList : ['*'],
          suggested_questions: questionsList,
        }),
      });

      if (updated?.tenant_id) {
        setTenantId(updated.tenant_id);
      }
      if (updated?.template) {
        setTemplate(updated.template);
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

  const selectedTemplateObj = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  return (
    <div>
      <Header
        title="Widget & Deployment"
        subtitle="Brand, configure, select templates, and embed the live AI assistant on your website."
      />

      {isLoading ? (
        <div className="card-panel p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-xs">Loading widget configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget Customization Card */}
          <form onSubmit={handleSaveConfig} className="card-panel p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-indigo-400" />
                <span>Widget Customization & Templates</span>
              </span>
              {isSaved && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </h3>

            {/* Widget Enable/Disable Switch */}
            <div className="p-3.5 rounded-lg border border-slate-700/60 bg-[#0d1627] flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-white">
                  Widget Status
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEnabled
                    ? 'Widget is live and will appear on your website.'
                    : 'Widget is disabled and hidden from your website.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={isEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Visual Template Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-white">
                  Select Widget Template
                </label>
                <span className="text-[11px] text-indigo-400 font-medium">
                  {selectedTemplateObj.name} Selected
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = template === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setTemplate(tmpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-[#090f1e] hover:border-slate-700 hover:bg-[#0e1628]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5 pr-5">
                          <tmpl.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {tmpl.name}
                          </span>
                        </div>

                        {/* Miniature Visual Mockup */}
                        <div className="my-2 p-2 rounded-lg bg-[#050811] border border-white/5 space-y-1.5">
                          {/* Mini Window Frame */}
                          <div className={`p-1.5 rounded text-[8px] space-y-1 ${
                            tmpl.id === 'minimal_light' 
                              ? 'bg-white text-slate-900 border border-slate-200' 
                              : tmpl.id === 'sidebar_drawer'
                              ? 'bg-[#0f172a] text-slate-100 border-r-2 border-indigo-500'
                              : 'bg-[#1e293b] text-slate-100'
                          }`}>
                            <div className="flex items-center justify-between pb-1 border-b border-black/10">
                              <span className="font-semibold text-[7px] truncate max-w-[65px]">{widgetName || 'Assistant'}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                            </div>
                            <div className={`p-1 rounded text-[7px] ${tmpl.id === 'minimal_light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-800 text-slate-300'}`}>
                              Hi! How can I help?
                            </div>
                            <div 
                              className="p-1 rounded text-[7px] text-white self-end text-right ml-3"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Need support
                            </div>
                          </div>

                          {/* Mini Launcher Button */}
                          <div className="flex justify-end pt-1">
                            {tmpl.id === 'modern_dark' ? (
                              <div
                                style={{ backgroundColor: primaryColor }}
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] text-white shadow"
                              >
                                💬
                              </div>
                            ) : tmpl.id === 'minimal_light' ? (
                              <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[6px] text-white font-medium shadow"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
                                Chat 💬
                              </div>
                            ) : (
                              <div
                                style={{ backgroundColor: primaryColor }}
                                className="px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-[6px] text-white font-medium shadow"
                              >
                                <Sidebar className="w-2 h-2" /> Ask AI
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-tight">
                          {tmpl.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                          {tmpl.badge}
                        </span>
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-indigo-400 font-semibold' : 'text-slate-500'}`}>
                          {isSelected ? 'Active' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
              <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3 mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Live Appearance Preview</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Template: <span className="text-indigo-400 font-semibold">{selectedTemplateObj.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="text-xs px-2.5 py-1 rounded bg-[#16233b] hover:bg-[#1e2f50] text-slate-200 border border-slate-700/60 transition cursor-pointer"
                  >
                    {previewOpen ? 'Show Closed' : 'Show Opened'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Experience real-time branding and the exact selected template layout:
              </p>

              {/* Preview Container */}
              <div className="bg-[#070b16] border border-[#1b2a47] rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                {/* Floating Preview Window Simulation */}
                {previewOpen ? (
                  <div
                    className={`w-full max-w-sm overflow-hidden shadow-2xl transition-all ${
                      template === 'minimal_light'
                        ? 'rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-slate-900/20'
                        : template === 'sidebar_drawer'
                        ? 'rounded-xl bg-[#0b1120] text-slate-100 border-l-2 border-indigo-500 shadow-2xl'
                        : 'rounded-2xl bg-[#0f172a] text-slate-100 border border-white/10'
                    }`}
                  >
                    {/* Header */}
                    <div
                      className={`p-3.5 flex items-center justify-between ${
                        template === 'minimal_light'
                          ? 'bg-[#f8fafc] border-b border-slate-200 text-slate-900'
                          : template === 'sidebar_drawer'
                          ? 'bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-white/10 text-white'
                          : 'text-white'
                      }`}
                      style={
                        template === 'modern_dark'
                          ? { backgroundColor: primaryColor }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        <span className="font-semibold text-xs flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {widgetName || 'AI Assistant'}
                        </span>
                        {template === 'sidebar_drawer' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            DRAWER
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(false)}
                        className="hover:opacity-75 cursor-pointer text-sm leading-none opacity-80"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Messages Container */}
                    <div
                      className={`p-3.5 space-y-3 min-h-[160px] text-xs ${
                        template === 'minimal_light' ? 'bg-[#f8fafc]' : 'bg-[#090e1c]'
                      }`}
                    >
                      {/* Bot Welcome Message */}
                      <div
                        className={`p-2.5 rounded-xl max-w-[85%] text-[11px] leading-relaxed shadow-sm ${
                          template === 'minimal_light'
                            ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                            : 'bg-slate-800/90 text-slate-200 border border-white/5 rounded-bl-sm'
                        }`}
                      >
                        <p className="font-medium mb-1">Hello! 👋</p>
                        <p>How can I assist you with our services today?</p>
                      </div>

                      {/* Suggested Questions */}
                      {questionsArray.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-medium">Quick Suggestions:</span>
                          {questionsArray.slice(0, 3).map((q, idx) => (
                            <div
                              key={idx}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] truncate transition cursor-pointer flex items-center gap-1.5 ${
                                template === 'minimal_light'
                                  ? 'bg-white text-indigo-600 border border-slate-200 hover:border-indigo-400 shadow-sm'
                                  : 'bg-slate-800/60 text-indigo-300 border border-indigo-500/20 hover:border-indigo-400/50'
                              }`}
                            >
                              <span>💬</span>
                              <span className="truncate">{q}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input Field */}
                    <div
                      className={`p-2.5 border-t flex gap-2 items-center ${
                        template === 'minimal_light'
                          ? 'bg-white border-slate-200'
                          : 'bg-[#0b101f] border-white/10'
                      }`}
                    >
                      <input
                        type="text"
                        disabled
                        placeholder="Type a message..."
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] flex-1 outline-none ${
                          template === 'minimal_light'
                            ? 'bg-slate-100 border border-slate-200 text-slate-700'
                            : 'bg-slate-800/70 border border-white/10 text-slate-300'
                        }`}
                      />
                      <button
                        className="px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold cursor-pointer shadow"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Closed State: Launcher Button */
                  <div className="flex flex-col items-center gap-3 py-4">
                    {template === 'modern_dark' ? (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        style={{ backgroundColor: primaryColor }}
                        className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl hover:scale-105 transition cursor-pointer relative"
                        title="Click to preview open chat window"
                      >
                        <MessageSquare className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#070b16]"></span>
                      </button>
                    ) : template === 'minimal_light' ? (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-5 py-3 rounded-full text-white font-semibold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition cursor-pointer"
                        title="Click to preview open chat window"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                        <span>Chat with us</span>
                        <span>💬</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-5 py-3 rounded-xl text-white font-semibold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 transition cursor-pointer"
                        title="Click to preview open chat window"
                      >
                        <Sidebar className="w-4 h-4" />
                        <span>Ask AI Assistant</span>
                        <span>💬</span>
                      </button>
                    )}

                    <div className="text-center">
                      <span className="text-[11px] text-slate-400 block">
                        Click the button above to preview the open chat window
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono mt-0.5 inline-block">
                        Style: {selectedTemplateObj.name}
                      </span>
                    </div>
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
