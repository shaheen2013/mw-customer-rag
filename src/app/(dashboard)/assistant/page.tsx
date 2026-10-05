'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Save, Send, Bot, CheckCircle, FileText, Sparkles } from 'lucide-react';

export default function AIAssistantPage() {
  const [tab, setTab] = useState<'config' | 'playground'>('config');

  // Config form state
  const [name, setName] = useState('Acme AI Support');
  const [welcomeMsg, setWelcomeMsg] = useState('Hello! How can I help you today?');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional & Helpful');
  const [fallbackMsg, setFallbackMsg] = useState('I could not find enough approved information to answer confidently.');
  const [leadCta, setLeadCta] = useState('Contact Human Support');
  const [instructions, setInstructions] = useState('Answer only from approved knowledge. Do not hallucinate external policies.');
  const [isSaved, setIsSaved] = useState(false);

  // Playground chat state
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'What is your refund policy?' },
    { sender: 'bot', text: 'Refunds are available within 30 days of purchase upon request provided the account remains in good standing.', sources: ['Refund Policy.pdf', '/terms/refunds'] },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [activeSources, setActiveSources] = useState(['Refund Policy.pdf', '/terms/refunds']);
  const [confidence, setConfidence] = useState('High');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSendTestQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');

    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);

    setTimeout(() => {
      let botAnswer = 'I am answering based on your uploaded tenant knowledge base documents.';
      let sources = ['Refund Policy.pdf'];
      let conf = 'High';

      if (userText.toLowerCase().includes('sap') || userText.toLowerCase().includes('integration')) {
        botAnswer = fallbackMsg;
        sources = ['/docs/integrations'];
        conf = 'Low';
      } else if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('plan')) {
        botAnswer = 'Business Plan costs $199/mo and includes up to 15,000 queries per month.';
        sources = ['/pricing', 'Product Specification v2.docx'];
        conf = 'High';
      }

      setMessages([...newMsgs, { sender: 'bot', text: botAnswer, sources }]);
      setActiveSources(sources);
      setConfidence(conf);
    }, 600);
  };

  return (
    <div>
      <Header
        title="AI Assistant"
        subtitle="Configure behavior, knowledge and response rules."
      />

      {/* Sub Navigation Tabs */}
      <div className="flex bg-[#121e36] p-1 rounded-lg border border-[#1b2a47] w-fit mb-6">
        <button
          onClick={() => setTab('config')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition ${
            tab === 'config' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Assistant Configuration
        </button>
        <button
          onClick={() => setTab('playground')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
            tab === 'playground' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test Playground
        </button>
      </div>

      {tab === 'config' ? (
        /* Configuration Form matching PDF Screenshot 8 */
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
                  <CheckCircle className="w-4 h-4" /> Changes saved!
                </span>
              )}
              <button type="submit" className="btn-primary text-xs flex items-center gap-2 ml-auto">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Test Playground matching PDF Screenshot 9 */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Preview Card */}
          <div className="lg:col-span-2 card-panel p-6 flex flex-col justify-between min-h-[480px]">
            <div>
              <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                Chat Preview
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-lg text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#182845] text-white rounded-br-none border border-[#1b2a47]'
                          : 'bg-blue-600 text-white rounded-bl-none shadow-md'
                      }`}
                    >
                      <p>{m.text}</p>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-500/40 text-[10px] text-blue-200">
                          Sources: {m.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Input Form */}
            <form onSubmit={handleSendTestQuery} className="mt-4 pt-4 border-t border-[#1b2a47] flex gap-2">
              <input
                type="text"
                placeholder="Ask a test question..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="input-dark flex-1 text-xs"
              />
              <button type="submit" className="btn-primary text-xs flex items-center gap-1.5 px-4">
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Retrieval Details Panel matching Screenshot 9 */}
          <div className="card-panel p-6">
            <h3 className="text-sm font-semibold text-white border-b border-[#1b2a47] pb-3 mb-6">
              Retrieval Details
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-400 mb-2">Confidence</p>
                <span className={`px-3 py-1 rounded-md text-xs font-bold inline-block ${
                  confidence === 'High' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {confidence}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Sources Used</p>
                <div className="space-y-2 text-xs">
                  {activeSources.map((src, index) => (
                    <div key={index} className="p-2 bg-[#121e36] rounded border border-[#1b2a47] text-slate-300 font-mono text-[11px] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{index + 1}. {src}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
