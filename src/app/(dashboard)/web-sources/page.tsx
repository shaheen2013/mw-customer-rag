'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  const [excludePaths, setExcludePaths] = useState('');
  const [maxPages, setMaxPages] = useState('20');
  const [frequency, setFrequency] = useState('Daily');
  const [submitting, setSubmitting] = useState(false);
  const [crawlingNextId, setCrawlingNextId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<{ id: string; url: string } | null>(null);
  const [deletingSource, setDeletingSource] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    action?: 'widget';
  } | null>(null);

  const prevCrawlingRef = useRef(false);

  const fetchSources = useCallback(async (isBackground = false) => {
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
    let ignore = false;
    async function loadInitialSources() {
      try {
        const data = await ingestApi.getSources();
        if (!ignore && data) {
          setStats(data.stats);
          setSources(data.sources || []);
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
        console.error('Failed to load web sources:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadInitialSources();
    return () => {
      ignore = true;
    };
  }, []);

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

    const parsedExcludePaths = excludePaths
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      await ingestApi.addSource({
        url: newUrl,
        max_pages: parseInt(maxPages, 10) || 20,
        frequency,
        exclude_paths: parsedExcludePaths.length > 0 ? parsedExcludePaths : undefined,
      });

      setNewUrl('');
      setExcludePaths('');
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

  const handleCrawlNext = async (sourceId: string, url: string, batchSize: number = 50) => {
    setCrawlingNextId(sourceId);
    try {
      setMessage({
        type: 'info',
        text: `Crawling next batch of pending pages for ${url}…`,
      });
      await ingestApi.crawlNext(sourceId, batchSize);
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to crawl next batch.',
      });
    } finally {
      setCrawlingNextId(null);
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

  const handleClearAll = () => {
    if (clearingAll || (sources.length === 0 && stats.pages_indexed === 0)) return;
    setShowClearAllDialog(true);
  };

  const confirmClearAll = async () => {
    setClearingAll(true);
    try {
      const res = await ingestApi.clearAll();
      setSources([]);
      setMessage({
        type: 'success',
        text: res.message || 'Successfully cleared all scraped data and vector embeddings.',
      });
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to clear scraped data.',
      });
    } finally {
      setClearingAll(false);
      setShowClearAllDialog(false);
    }
  };

  const handleDeleteSource = (sourceId: string, url: string) => {
    setSourceToDelete({ id: sourceId, url });
  };

  const confirmDeleteSource = async () => {
    if (!sourceToDelete) return;
    setDeletingSource(true);
    try {
      await ingestApi.deleteSource(sourceToDelete.id, true);
      setSources((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
      setMessage({
        type: 'success',
        text: `Successfully deleted ${sourceToDelete.url} and removed its indexed pages and vector embeddings.`,
      });
      await fetchSources(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete web source.',
      });
    } finally {
      setDeletingSource(false);
      setSourceToDelete(null);
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
      return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
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

          <button
            onClick={handleClearAll}
            disabled={clearingAll || (sources.length === 0 && stats.pages_indexed === 0)}
            className="px-3 py-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 flex items-center gap-2 text-xs font-medium transition disabled:opacity-40"
            title="Purge all scraped websites, files, and vector embeddings"
          >
            {clearingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{clearingAll ? 'Clearing...' : 'Clear All Scraped Data'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchSources();
          }}
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
                      {s.exclude_paths && s.exclude_paths.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-500 font-normal">Excluded:</span>
                          {s.exclude_paths.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-800/90 text-rose-300/80 border border-slate-700/60 px-1.5 py-0.5 rounded font-mono"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-blue-400">
                      {s.status === 'Crawling' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Ingesting…
                        </span>
                      ) : (
                        <div>
                          <span className="text-white font-semibold">{s.pages}</span>
                          {s.pending_pages && s.pending_pages > 0 ? (
                            <div className="text-[11px] text-amber-400/90 font-normal mt-0.5">
                              +{s.pending_pages} pending
                            </div>
                          ) : null}
                        </div>
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
                        {Boolean(s.pending_pages && s.pending_pages > 0) && s.status !== 'Crawling' ? (
                          <button
                            onClick={() => handleCrawlNext(s.id, s.url, 50)}
                            disabled={crawlingNextId === s.id}
                            className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 px-2.5 py-1 rounded text-xs transition flex items-center gap-1 font-medium shadow-sm"
                            title={`Crawl next batch of up to 50 pending pages (${s.pending_pages} remaining)`}
                          >
                            {crawlingNextId === s.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>Crawl Next ({Math.min(s.pending_pages || 0, 50)})</span>
                          </button>
                        ) : null}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Exclude Paths (Optional)
                  </label>
                  <span className="text-[11px] text-slate-500">Comma-separated</span>
                </div>
                <input
                  type="text"
                  placeholder="/blog/*, /careers/*, /tags/*, *.pdf"
                  value={excludePaths}
                  onChange={(e) => setExcludePaths(e.target.value)}
                  className="input-dark w-full text-xs font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Wildcards supported (e.g. <span className="text-slate-300">/blog/*</span> or <span className="text-slate-300">mediusware/blog/*</span>) to skip specific paths.
                </p>
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
                    <option value="250">250 pages (Extensive)</option>
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
      {/* Delete Source Confirmation Dialog */}
      <ConfirmDialog
        open={!!sourceToDelete}
        title="Delete Website Source?"
        description="This will remove the website source and purge all its scraped pages and vector embeddings from the Knowledge Base. This action cannot be undone."
        subject={sourceToDelete?.url}
        confirmLabel={deletingSource ? 'Deleting...' : 'Delete Source'}
        variant="danger"
        loading={deletingSource}
        onConfirm={confirmDeleteSource}
        onCancel={() => setSourceToDelete(null)}
      />

      {/* Clear All Scraped Data Confirmation Dialog */}
      <ConfirmDialog
        open={showClearAllDialog}
        title="Clear All Scraped Data?"
        description="This will permanently delete all registered website sources, their scraped markdown files, and their vector embeddings from the Knowledge Base. Uploaded files will be preserved. This action cannot be undone."
        subject={`${stats.total_websites} website(s), ${stats.pages_indexed} indexed page(s)`}
        confirmLabel={clearingAll ? 'Clearing All...' : 'Clear All Scraped Data'}
        variant="danger"
        loading={clearingAll}
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </div>
  );
}
