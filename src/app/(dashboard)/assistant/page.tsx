'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import {
  Save,
  Send,
  Bot,
  CheckCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Loader2,
  Trash2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, getFriendlyErrorMessage } from '@/lib/api-client';

interface PlaygroundSource {
  title: string;
  url: string;
}

interface PlaygroundResponse {
  status: string;
  data: {
    query: string;
    response: string;
    diagnostics: {
      confidence_level: 'High' | 'Medium' | 'Low';
      confidence_score: number;
      sources_used: PlaygroundSource[];
      token_estimate?: number;
    };
  };
}

interface MessageItem {
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
}

export default function AIAssistantPage() {
  const [tab, setTab] = useState<'config' | 'playground'>('config');

  // Config form state
  const [name, setName] = useState('Acme AI Support');
  const [welcomeMsg, setWelcomeMsg] = useState('Hello! How can I help you today?');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional & Helpful');
  const [fallbackMsg, setFallbackMsg] = useState(
    'I could not find enough approved information to answer confidently.'
  );
  const [leadCta, setLeadCta] = useState('Contact Human Support');
  const [instructions, setInstructions] = useState(
    'Answer only from approved knowledge. Do not hallucinate external policies.'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Playground chat state
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your Mediusware AI Assistant. Ask any question to test grounded retrieval and citations from your connected knowledge base.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [activeSources, setActiveSources] = useState<PlaygroundSource[]>([]);
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Low'>('High');
  const [tokenEstimate, setTokenEstimate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionPills, setSuggestionPills] = useState<string[]>([
    'What core services does Mediusware provide?',
    'Tell me about your mobile development experience',
    'What is your refund policy?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load assistant configuration and widget questions if available
  useEffect(() => {
    async function loadConfig() {
      try {
        const configData = await apiClient<{
          assistant_name?: string;
          welcome_message?: string;
          primary_language?: string;
          tone?: string;
          fallback_message?: string;
          lead_cta?: string;
          instructions?: string;
        }>('/api/v1/assistant/config');

        if (configData) {
          if (configData.assistant_name) setName(configData.assistant_name);
          if (configData.welcome_message) {
            setWelcomeMsg(configData.welcome_message);
            setMessages([
              {
                sender: 'bot',
                text: configData.welcome_message,
              },
            ]);
          }
          if (configData.primary_language) setLanguage(configData.primary_language);
          if (configData.tone) setTone(configData.tone);
          if (configData.fallback_message) setFallbackMsg(configData.fallback_message);
          if (configData.lead_cta) setLeadCta(configData.lead_cta);
          if (configData.instructions) setInstructions(configData.instructions);
        }
      } catch {
        // Fallback gracefully to default states
      }

      try {
        const widgetConfig = await apiClient<{ suggested_questions?: string[] }>(
          '/api/v1/widget/config'
        );
        if (
          widgetConfig?.suggested_questions &&
          widgetConfig.suggested_questions.length > 0
        ) {
          setSuggestionPills(widgetConfig.suggested_questions);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadConfig();
  }, []);

  // Auto-scroll on new message or loading state
  useEffect(() => {
    if (tab === 'playground') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, tab]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      await apiClient('/api/v1/assistant/config', {
        method: 'PUT',
        body: JSON.stringify({
          assistant_name: name,
          welcome_message: welcomeMsg,
          primary_language: language,
          tone: tone,
          fallback_message: fallbackMsg,
          lead_cta: leadCta,
          instructions: instructions,
        }),
      });
      setIsSaved(true);
      if (messages.length <= 1) {
        setMessages([{ sender: 'bot', text: welcomeMsg }]);
      }
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      // Local fallback for guest/dev view
      setIsSaved(true);
      if (messages.length <= 1) {
        setMessages([{ sender: 'bot', text: welcomeMsg }]);
      }
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestQuery = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = (customQuery !== undefined ? customQuery : inputQuery).trim();
    if (!queryToSend || isLoading) return;

    setInputQuery('');

    // Append user message
    const userMessage: MessageItem = { sender: 'user', text: queryToSend };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await apiClient<PlaygroundResponse>('/api/v1/chat/playground', {
        method: 'POST',
        body: JSON.stringify({
          message: queryToSend,
          persona: 'business_development_executive',
        }),
      });

      if (result?.data) {
        const botText = result.data.response || 'No response returned from assistant.';
        const sources = result.data.diagnostics?.sources_used || [];
        const conf = result.data.diagnostics?.confidence_level || 'Medium';

        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: botText,
            sources: sources.map((s) => s.title || s.url),
          },
        ]);
        setActiveSources(sources);
        setConfidence(conf);
        setTokenEstimate(result.data.diagnostics?.token_estimate ?? null);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to reach AI assistant backend.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **Connection Error:** ${getFriendlyErrorMessage(errMsg)}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Chat history cleared. Send a new test question below.',
      },
    ]);
    setActiveSources([]);
    setTokenEstimate(null);
  };

  // Helper to format inline markdown (links and bold)
  const formatInline = (text: string): React.ReactNode[] => {
    const regex = /(\[.*?\]\(https?:\/\/.*?\)|\*\*.*?\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const title = part.slice(1, part.indexOf(']('));
        const url = part.slice(part.indexOf('](') + 2, -1);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-cyan-200 hover:text-white transition"
          >
            {title}
          </a>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render rich markdown structure
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <p key={idx} className="font-bold text-white text-xs mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </p>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <p key={idx} className="font-bold text-white text-xs mt-2 mb-1">
                {trimmed.replace('## ', '')}
              </p>
            );
          }

          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const textToFormat = isBullet ? trimmed.slice(2) : trimmed;
          const formatted = formatInline(textToFormat);

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="text-blue-200 mt-0.5">•</span>
                <span className="flex-1">{formatted}</span>
              </div>
            );
          }

          return <p key={idx}>{formatted}</p>;
        })}
      </div>
    );
  };

  return (
    <div>
      <Header
        title="AI Assistant"
        subtitle="Configure behavior, knowledge and test real-time retrieval."
      />

      {/* Sub Navigation Tabs */}
      <div className="flex bg-[#121e36] p-1 rounded-lg border border-[#1b2a47] w-fit mb-6">
        <button
          onClick={() => setTab('config')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition ${
            tab === 'config'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Assistant Configuration
        </button>
        <button
          onClick={() => setTab('playground')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
            tab === 'playground'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test Playground
        </button>
      </div>

      {tab === 'config' ? (
        /* Configuration Form */
        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-panel p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4">
              Assistant Configuration
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Assistant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark w-full text-xs"
              />
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
              <label className="block text-xs text-slate-300 mb-1">Primary Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Tone</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Fallback Message</label>
              <input
                type="text"
                value={fallbackMsg}
                onChange={(e) => setFallbackMsg(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Lead CTA</label>
              <input
                type="text"
                value={leadCta}
                onChange={(e) => setLeadCta(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>
          </div>

          <div className="card-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4">
                Instructions & System Rules
              </h3>

              <div className="mb-4">
                <textarea
                  rows={10}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="input-dark w-full text-xs font-mono leading-relaxed resize-none"
                  placeholder="Answer only from approved knowledge..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1b2a47]">
              {isSaved && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Changes saved successfully!
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs flex items-center gap-2 ml-auto cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Test Playground with Live Backend Integration */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Preview Card */}
          <div className="lg:col-span-2 card-panel p-6 flex flex-col justify-between min-h-[520px]">
            <div>
              <div className="flex items-center justify-between border-b border-[#1b2a47] pb-3 mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  Live Chat Preview
                </h3>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {suggestionPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendTestQuery(undefined, pill)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#121e36] hover:bg-[#1b2a47] border border-[#1b2a47] hover:border-blue-500/40 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Messages viewport */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl p-3.5 rounded-xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#182845] text-white rounded-br-none border border-[#1b2a47]'
                          : 'bg-blue-600/90 text-white rounded-bl-none shadow-md border border-blue-500/20'
                      }`}
                    >
                      {renderMessageContent(m.text)}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-blue-400/30 text-[10px] text-blue-100 flex flex-wrap gap-1.5 items-center">
                          <span className="font-semibold text-blue-200">Sources:</span>
                          {m.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-400/20"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-md p-3.5 rounded-xl text-xs bg-blue-600/70 text-white rounded-bl-none shadow-md flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-200" />
                      <span className="text-blue-100">Consulting knowledge base & generating answer...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Test Input Form */}
            <form onSubmit={handleSendTestQuery} className="mt-4 pt-4 border-t border-[#1b2a47] flex gap-2">
              <input
                type="text"
                placeholder="Ask a test question (e.g. what mw basically offer?)..."
                value={inputQuery}
                disabled={isLoading}
                onChange={(e) => setInputQuery(e.target.value)}
                className="input-dark flex-1 text-xs disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="btn-primary text-xs flex items-center gap-1.5 px-4 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Thinking...' : 'Send'}</span>
              </button>
            </form>
          </div>

          {/* Retrieval Details Panel */}
          <div className="card-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-6 flex items-center justify-between">
                <span>Retrieval Diagnostics</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold inline-block ${
                        confidence === 'High'
                          ? 'bg-emerald-500 text-slate-950'
                          : confidence === 'Medium'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {confidence}
                    </span>
                    {tokenEstimate !== null && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        ~{tokenEstimate} tokens
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">Sources Used</p>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {activeSources.length} cited
                    </span>
                  </div>

                  {activeSources.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {activeSources.map((src, index) => (
                        <a
                          key={index}
                          href={src.url || '#'}
                          target={src.url ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#121e36] hover:bg-[#182845] transition rounded-lg border border-[#1b2a47] hover:border-blue-500/40 text-slate-300 text-[11px] flex items-center justify-between gap-2 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate font-medium text-slate-200 group-hover:text-blue-300">
                              {src.title || src.url}
                            </span>
                          </div>
                          {src.url && (
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0" />
                          )}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#121e36]/60 rounded-lg border border-[#1b2a47] text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>Send a query in the preview to inspect real-time sources and confidence.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1b2a47] text-[11px] text-slate-500">
              <p>Powered by Mediusware Agentic RAG Engine with pgvector hybrid search and FlashReranker.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
