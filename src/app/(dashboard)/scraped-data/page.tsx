'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  ScrollText,
  RefreshCw,
  ExternalLink,
  X,
  Search,
  Info,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  Globe,
  Trash2,
} from 'lucide-react';
import {
  scrapedApi,
  ScrapedPageItem,
  ScrapedStats,
  ScrapedPageDetail,
} from '@/lib/api/scraped';
import { ingestApi } from '@/lib/api/ingest';

export default function ScrapedDataPage() {
  const [stats, setStats] = useState<ScrapedStats>({
    total_pages: 0,
    indexed: 0,
    failed: 0,
    sites: 0,
    categories: 0,
    last_scraped_at: null,
  });
  const [pages, setPages] = useState<ScrapedPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const [selected, setSelected] = useState<ScrapedPageItem | null>(null);
  const [detail, setDetail] = useState<ScrapedPageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [crawlOpen, setCrawlOpen] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlMaxPages, setCrawlMaxPages] = useState('10');
  const [crawling, setCrawling] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      setError(null);
      const [statsRes, pagesRes] = await Promise.all([
        scrapedApi.getStats().catch(() => null),
        scrapedApi
          .getPages({ limit: 200, offset: 0 })
          .catch(() => ({ meta: { pagination: { limit: 200, offset: 0, total: 0 } }, data: [] })),
      ]);
      if (statsRes) setStats(statsRes);
      setPages(pagesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scraped data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const categories = useMemo(() => {
    return Array.from(new Set(pages.map((p) => p.category).filter(Boolean))).sort();
  }, [pages]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return pages.filter((p) => {
      const matchesSearch =
        !needle ||
        p.title.toLowerCase().includes(needle) ||
        (p.url || '').toLowerCase().includes(needle);
      const matchesCategory = category === 'all' || p.category === category;
      const matchesStatus = status === 'all' || p.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [pages, search, category, status]);

  const openDetail = async (page: ScrapedPageItem) => {
    setSelected(page);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await scrapedApi.getPage(page.id);
      setDetail(res);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRunCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;
    setCrawling(true);
    setError(null);
    setNotice(null);
    try {
      const maxPages = Number(crawlMaxPages);
      const res = await ingestApi.run({
        source: crawlUrl.trim(),
        max_pages: Number.isFinite(maxPages) && maxPages > 0 ? maxPages : undefined,
      });
      setNotice(
        `${res.message} Scraped pages will appear here once the crawl finishes (refresh in a moment).`
      );
      setCrawlOpen(false);
      setCrawlUrl('');
      // The crawl runs in the background on the API; refresh shortly after.
      setTimeout(() => fetchData(true), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start crawl');
    } finally {
      setCrawling(false);
    }
  };

  const handleClearAll = () => {
    if (clearingAll || stats.total_pages === 0) return;
    setShowClearAllDialog(true);
  };

  const confirmClearAll = async () => {
    setClearingAll(true);
    setError(null);
    try {
      const res = await ingestApi.clearAll();
      setPages([]);
      setStats({
        total_pages: 0,
        indexed: 0,
        failed: 0,
        sites: 0,
        categories: 0,
        last_scraped_at: null,
      });
      setNotice(res.message || 'Successfully cleared all scraped data and vector embeddings.');
      await fetchData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear scraped data.');
    } finally {
      setClearingAll(false);
      setShowClearAllDialog(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div>
      <Header
        title="Scraped Data"
        subtitle="Raw pages captured from your web sources by the crawler."
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-lg border border-rose-800/60 bg-rose-950/40 text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Notice Banner */}
      {notice && (
        <div className="flex items-start justify-between gap-3 p-4 mb-6 rounded-lg border border-emerald-800/60 bg-emerald-950/40 text-emerald-200 text-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{notice}</div>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCrawlOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Run Crawl</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearingAll || stats.total_pages === 0}
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
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Total Pages</p>
          <p className="text-3xl font-bold text-white">{loading ? '...' : stats.total_pages}</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Indexed</p>
          <p className="text-3xl font-bold text-emerald-400">{loading ? '...' : stats.indexed}</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Failed</p>
          <p className="text-3xl font-bold text-rose-400">{loading ? '...' : stats.failed}</p>
        </div>
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Sites</p>
          <p className="text-3xl font-bold text-blue-400">{loading ? '...' : stats.sites}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or URL..."
            className="input-dark w-full text-xs pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-dark text-xs md:w-44"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-dark text-xs md:w-40"
        >
          <option value="all">All statuses</option>
          <option value="Indexed">Indexed</option>
          <option value="Failed">Failed</option>
          <option value="Processing">Processing</option>
        </select>
      </div>

      {/* Scraped Pages Table */}
      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4">Page</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Words</th>
                <th className="py-3 px-4">Scraped At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span>Loading scraped data...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-6 h-6 text-slate-500" />
                      <span>
                        {pages.length === 0
                          ? 'No scraped data yet. Use "Run Crawl" above to scrape a website.'
                          : 'No pages match the current filters.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((page) => (
                  <tr key={page.id} className="table-row">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2">
                        <ScrollText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate max-w-[320px]" title={page.title}>
                            {page.title}
                          </span>
                          {page.url && (
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 truncate max-w-[320px]"
                            >
                              <span className="truncate">{page.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#121e36] border border-[#1b2a47] px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                        {page.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{page.word_count.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(page.scraped_at)}</td>
                    <td className="py-3.5 px-4">
                      <span className={page.status === 'Indexed' ? 'badge-active' : page.status === 'Processing' ? 'badge-warning' : 'badge-danger'}>
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openDetail(page)}
                        className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Crawl Modal */}
      {crawlOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-[#1b2a47] rounded-lg max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-2.5 p-6 pb-4 border-b border-[#1b2a47]">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white text-base">Run Website Crawl</h3>
            </div>
            <form onSubmit={handleRunCrawl} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Website URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://mediusware.com"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  className="input-dark w-full text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  We discover pages via the site&apos;s sitemap and index them incrementally.
                </p>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Max pages</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={crawlMaxPages}
                  onChange={(e) => setCrawlMaxPages(e.target.value)}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCrawlOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={crawling} className="btn-primary text-xs">
                  {crawling ? 'Starting...' : 'Start Crawl & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-[#1b2a47] rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-[#1b2a47]">
              <div className="flex items-start gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-base truncate" title={selected.title}>
                    {selected.title}
                  </h3>
                  {selected.url && (
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{selected.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white transition p-1 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#121e36] p-3.5 rounded border border-[#1b2a47] mb-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-mono text-white">{selected.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Domain</span>
                  <span className="text-white">{selected.domain || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Words</span>
                  <span className="text-white">{selected.word_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Scraped At</span>
                  <span className="text-white">{formatDate(selected.scraped_at)}</span>
                </div>
              </div>

              <span className="text-slate-400 block text-[11px] mb-1">Scraped Content</span>
              {detailLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Loading content...</span>
                </div>
              ) : (
                <pre className="font-mono text-[11px] leading-relaxed text-slate-300 bg-[#090e1a] p-3 rounded border border-[#1b2a47] whitespace-pre-wrap break-words max-h-[45vh] overflow-y-auto">
                  {detail?.content_markdown || 'No content available for this page.'}
                </pre>
              )}
            </div>

            <div className="mt-2 flex justify-end gap-2 p-4 border-t border-[#1b2a47]">
              <button onClick={() => setSelected(null)} className="btn-secondary text-xs px-4 py-1.5">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Clear All Scraped Data Confirmation Dialog */}
      <ConfirmDialog
        open={showClearAllDialog}
        title="Clear All Scraped Data?"
        description="This will permanently delete all scraped markdown files, queue files, and vector embeddings from the Knowledge Base. Uploaded files will be preserved. This action cannot be undone."
        subject={`${stats.total_pages} page(s) across ${stats.sites} site(s)`}
        confirmLabel={clearingAll ? 'Clearing All...' : 'Clear All Scraped Data'}
        variant="danger"
        loading={clearingAll}
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </div>
  );
}
