'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import {
  Plus,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ingestApi, WebSourceItem, WebSourcesResponse } from '@/lib/api/ingest';

export default function WebSourcesPage() {
  const [sources, setSources] = useState<WebSourceItem[]>([]);
  const [stats, setStats] = useState<WebSourcesResponse['stats']>({
    total_websites: 0,
    pages_indexed: 0,
    last_sync: null,
    crawl_errors: 0,
    is_crawling: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [maxPages, setMaxPages] = useState('20');
  const [frequency, setFrequency] = useState('Daily');
  const [submitting, setSubmitting] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    action?: 'widget';
  } | null>(null);

  const prevCrawlingRef = useRef(false);

  const fetchSources = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);
    try {
      const data = await ingestApi.getSources();
      if (data) {
        setStats(data.stats);
        setSources(data.sources || []);

        // Detect transition from crawling -> completed
        if (prevCrawlingRef.current && !data.stats.is_crawling) {
          setMessage({
            type: 'success',
            text: `Web crawling and vector ingestion finished! ${data.stats.pages_indexed} pages are now indexed and available in the Knowledge Base.`,
            action: 'widget',
          });
        }
        prevCrawlingRef.current = data.stats.is_crawling;
      }
    } catch (err) {
      if (!isBackground) {
        console.error('Failed to load web sources:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Polling when crawling is in progress
  useEffect(() => {
    if (!stats.is_crawling) return;

    const interval = setInterval(() => {
      fetchSources(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [stats.is_crawling, fetchSources]);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await ingestApi.addSource({
        url: newUrl,
        max_pages: parseInt(maxPages, 10) || 20,
        frequency,
      });

      setNewUrl('');
      setIsModalOpen(false);
      setMessage({
        type: 'info',
        text: `Crawler dispatched for ${newUrl}. Extracting pages and vectorizing into your Knowledge Base in the background…`,
      });

      // Refresh immediately to show Crawling status
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to register and start crawl.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncSource = async (sourceId: string, url: string) => {
    try {
      setMessage({
        type: 'info',
        text: `Starting sync for ${url}…`,
      });
      await ingestApi.syncSource(sourceId);
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to re-sync source.',
      });
    }
  };

  const handleSyncAll = async () => {
    if (syncingAll || sources.length === 0) return;
    setSyncingAll(true);
    try {
      setMessage({
        type: 'info',
        text: `Dispatched sync for all ${sources.length} website sources…`,
      });
      await ingestApi.syncAll();
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to sync all web sources.',
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDeleteSource = async (sourceId: string, url: string) => {
    if (!confirm(`Are you sure you want to remove ${url} from Web Sources?`)) return;
    try {
      await ingestApi.deleteSource(sourceId);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      fetchSources(true);
    } catch (err) {
      console.error('Failed to delete web source:', err);
    }
  };

  const openChatWidget = () => {
    const btn = document.querySelector('.mw-widget-button') as HTMLElement;
    const box = document.querySelector('.mw-widget-box') as HTMLElement;
    if (box && box.style.display !== 'flex') {
      btn?.click();
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return timestamp;
    }
  };

  return (
    <div>
      <Header
        title="Web Sources"
        subtitle="Crawl, sync and manage live website knowledge for your AI assistant."
      />

      {/* Crawl or Completion Notification */}
      {message && (
        <div
          className={`flex items-start justify-between gap-3 p-4 mb-6 rounded-lg border text-xs animate-in fade-in ${
            message.type === 'success'
              ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-200'
              : message.type === 'info'
              ? 'border-blue-800/60 bg-blue-950/40 text-blue-200'
              : 'border-rose-800/60 bg-rose-950/40 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : message.type === 'info' ? (
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className="font-semibold">{message.text}</span>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="/scraped-data"
                  className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white underline font-medium"
                >
                  View Scraped Pages <ArrowRight className="w-3 h-3" />
                </a>
                {message.action === 'widget' && (
                  <button
                    onClick={openChatWidget}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs shadow transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Test in Widget Now
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white transition p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Crawl Status Banner */}
      {stats.is_crawling && (
        <div className="flex items-center justify-between p-3.5 mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>
              <strong>Web Scraper Active:</strong> Crawling and vectorizing content in the background. The table will automatically update when finished.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[11px]">
            Live Syncing
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncingAll || sources.length === 0}
            className="btn-secondary flex items-center gap-2 text-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>

        <button
          onClick={() => fetchSources()}
          disabled={refreshing}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs transition"
          title="Refresh table"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Dynamic Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Websites Registered</p>
          <p className="text-3xl font-bold text-white">
            {loading ? <span className="opacity-40">…</span> : stats.total_websites}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Pages Indexed (pgvector)</p>
          <p className="text-3xl font-bold text-blue-400">
            {loading ? <span className="opacity-40">…</span> : stats.pages_indexed}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Last Sync</p>
          <p className="text-3xl font-bold text-slate-200">
            {loading ? <span className="opacity-40">…</span> : formatLastSync(stats.last_sync)}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Crawl Errors</p>
          <p className={`text-3xl font-bold ${stats.crawl_errors > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {loading ? <span className="opacity-40">…</span> : stats.crawl_errors}
          </p>
        </div>
      </div>

      {/* Web Sources Table */}
      <div className="card-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs">Loading live web sources…</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Web Sources Added Yet</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Add your company website or documentation URL to let Crawl4AI extract clean content and vectorize it into your Knowledge Base.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-2 text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Website</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Sync Frequency</th>
                  <th className="py-3 px-4">Last Sync</th>
                  <th className="py-3 px-4">Index Status</th>
                  <th className="py-3 px-4">Errors</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {sources.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate max-w-xs">{s.url}</span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-blue-400">
                      {s.status === 'Crawling' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Ingesting…
                        </span>
                      ) : (
                        s.pages
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{s.frequency || 'Daily'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatLastSync(s.last_sync)}</td>
                    <td className="py-3.5 px-4">
                      {s.status === 'Crawling' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Loader2 className="w-3 h-3 animate-spin" /> Crawling
                        </span>
                      ) : s.status === 'Failed' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Failed
                        </span>
                      ) : (
                        <span className="badge-active">Connected</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-medium">{s.errors || 0}</td>
                    <td className="py-3.5 px-4">
                      {s.status === 'Crawling' ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                          Processing
                        </span>
                      ) : s.status === 'Failed' ? (
                        <span className="text-rose-400">Error</span>
                      ) : (
                        <span className="text-emerald-400">Active</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSyncSource(s.id, s.url)}
                          disabled={s.status === 'Crawling'}
                          className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition disabled:opacity-40"
                          title="Re-crawl and vectorize"
                        >
                          Sync
                        </button>
                        <a
                          href={`/scraped-data?search=${encodeURIComponent(s.domain || '')}`}
                          className="bg-[#121e36] hover:bg-[#1b2a47] text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition"
                          title="View scraped markdown pages"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteSource(s.id, s.url)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                          title="Delete source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="card-panel p-6 max-w-md w-full shadow-2xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>Add Website Source</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Crawl4AI will crawl the URL, extract clean semantic Markdown, and chunk/embed it directly into pgvector for your chatbot.
            </p>

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Website URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://acme.com/help or docs.acme.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="input-dark w-full text-xs"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Max Pages to Crawl
                  </label>
                  <select
                    value={maxPages}
                    onChange={(e) => setMaxPages(e.target.value)}
                    className="input-dark w-full text-xs"
                  >
                    <option value="5">5 pages (Quick test)</option>
                    <option value="20">20 pages (Standard)</option>
                    <option value="50">50 pages (Thorough)</option>
                    <option value="100">100 pages (Deep)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Sync Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="input-dark w-full text-xs"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Starting Crawl…' : 'Start Crawl & Index'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
