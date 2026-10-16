'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Upload, RefreshCw, FileText, Trash2, X, AlertCircle, AlertTriangle, CheckCircle2, Loader2, Info, Globe, Search } from 'lucide-react';
import { kbApi, DocumentItem, KnowledgeStats } from '@/lib/api/kb';
import { ingestApi } from '@/lib/api/ingest';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';

export default function KnowledgeBasePage() {
  const { user } = useAuthStore();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({
    documents: 0,
    indexed: 0,
    processing: 0,
    failed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'upload' | 'web'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    text: string;
  } | null>(null);

  // Check RBAC role permissions
  const canManage = user?.role === 'platform_admin' || user?.role === 'super_admin' || user?.role === 'tenant_admin' || user?.role === 'tenant_member';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, docsRes] = await Promise.all([
        kbApi.getStats().catch(() => ({ documents: 0, indexed: 0, processing: 0, failed: 0 })),
        kbApi.getDocuments({ limit: 100, offset: 0 }).catch(() => ({ meta: { pagination: { limit: 100, offset: 0, total: 0 } }, data: [] })),
      ]);

      setStats(statsRes);
      setDocs(docsRes.data || []);
    } catch (err: unknown) {
      console.error('Failed to load knowledge base data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      setMessage(null);
      const res = await kbApi.uploadDocument(file);
      setMessage({
        type: 'success',
        title: 'Upload Successful',
        text: res.message || `Uploaded "${file.name}" successfully!`,
      });
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === 'CONFLICT') {
          setMessage({
            type: 'warning',
            title: 'Duplicate Document',
            text: err.message || `The file "${file.name}" has already been uploaded to this knowledge base.`,
          });
        } else if (err.status === 400 || err.code === 'VALIDATION_ERROR') {
          setMessage({
            type: 'error',
            title: 'Invalid File',
            text: err.message || 'The selected file format is not supported.',
          });
        } else if (err.status === 403 || err.code === 'FORBIDDEN') {
          setMessage({
            type: 'error',
            title: 'Access Denied',
            text: err.message || 'You do not have permission to upload documents.',
          });
        } else {
          setMessage({
            type: 'error',
            title: 'Upload Failed',
            text: err.message || 'An unexpected error occurred while uploading.',
          });
        }
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upload document';
        setMessage({
          type: 'error',
          title: 'Upload Error',
          text: errorMsg,
        });
      }
    } finally {
      setUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  const handleReindex = async () => {
    try {
      setReindexing(true);
      setMessage(null);
      const res = await kbApi.reindex();
      setMessage({
        type: 'success',
        title: 'Re-indexing Initiated',
        text: res.message || 'Re-indexing initiated successfully.',
      });
      await fetchData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to trigger re-indexing';
      setMessage({ type: 'error', title: 'Re-index Error', text: errorMsg });
    } finally {
      setReindexing(false);
    }
  };

  const handleDelete = (doc: DocumentItem) => setDocToDelete(doc);

  const confirmDelete = async () => {
    const doc = docToDelete;
    if (!doc) return;

    try {
      setDeleting(true);
      setMessage(null);
      const res = await kbApi.deleteDocument(doc.id);
      setMessage({
        type: 'success',
        title: 'Document Deleted',
        text: res.message || `Deleted ${doc.file}`,
      });
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
      await fetchData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete document';
      setMessage({ type: 'error', title: 'Delete Error', text: errorMsg });
    } finally {
      setDeleting(false);
      setDocToDelete(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowBatchDeleteDialog(true);
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.size === 0 || deletingBatch) return;
    setDeletingBatch(true);
    setMessage(null);
    try {
      let count = 0;
      for (const id of Array.from(selectedIds)) {
        await kbApi.deleteDocument(id);
        count++;
      }
      setSelectedIds(new Set());
      setMessage({
        type: 'success',
        title: 'Documents Deleted',
        text: `Successfully deleted ${count} selected document(s).`,
      });
      await fetchData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete selected documents';
      setMessage({ type: 'error', title: 'Batch Delete Error', text: errorMsg });
    } finally {
      setDeletingBatch(false);
      setShowBatchDeleteDialog(false);
    }
  };

  const handleClearAll = () => {
    if (clearingAll || docs.length === 0) return;
    setShowClearAllDialog(true);
  };

  const confirmClearAll = async () => {
    setClearingAll(true);
    setMessage(null);
    try {
      const scope: 'all' | 'scraped' | 'uploaded' =
        sourceFilter === 'web' ? 'scraped' : sourceFilter === 'upload' ? 'uploaded' : 'all';
      const res = await kbApi.clearAll(scope);
      setSelectedIds(new Set());
      setMessage({
        type: 'success',
        title: 'Knowledge Base Cleared',
        text: res.message || 'Successfully purged documents and vector embeddings.',
      });
      await fetchData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to clear documents';
      setMessage({ type: 'error', title: 'Clear Error', text: errorMsg });
    } finally {
      setClearingAll(false);
      setShowClearAllDialog(false);
    }
  };

  const isWebDoc = (d: DocumentItem) =>
    Boolean(d.source_ref?.includes('scraped-data') || d.metadata?.source_type === 'web_page');

  const filteredDocs = docs.filter((d) => {
    const isWeb = isWebDoc(d);
    if (sourceFilter === 'upload' && isWeb) return false;
    if (sourceFilter === 'web' && !isWeb) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.file.toLowerCase().includes(q) ||
        d.source_ref.toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <Header
        title="Knowledge Base"
        subtitle="Upload and manage documents used by your assistants."
      />

      {/* Notification Banner */}
      {message && (
        <div
          className={`flex items-start justify-between p-4 mb-6 rounded-lg border text-xs transition-all shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : message.type === 'warning'
              ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
              : message.type === 'info'
              ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {message.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {message.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {message.type === 'info' && (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            {message.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              {message.title && <div className="font-semibold text-sm mb-0.5">{message.title}</div>}
              <div className="leading-relaxed">{message.text}</div>
            </div>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white transition p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons matching Screenshot 6 */}
      <div className="flex items-center gap-3 mb-6">
        {canManage ? (
          <label
            className={`btn-primary cursor-pointer flex items-center gap-2 text-xs ${
              uploading ? 'opacity-70 pointer-events-none' : ''
            }`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Upload Documents'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.txt,.md,.csv,.json"
            />
          </label>
        ) : (
          <span
            title="Read-only: Tenant Viewer cannot upload documents"
            className="btn-primary opacity-50 cursor-not-allowed flex items-center gap-2 text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Documents (Restricted)</span>
          </span>
        )}

        <button
          onClick={handleReindex}
          disabled={reindexing || !canManage}
          className={`btn-secondary flex items-center gap-2 text-xs ${
            !canManage ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={!canManage ? 'Viewer role cannot trigger re-indexing' : 'Re-index all documents'}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${reindexing ? 'animate-spin text-blue-400' : ''}`} />
          <span>{reindexing ? 'Re-indexing...' : 'Re-index Selected'}</span>
        </button>

        {canManage && selectedIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deletingBatch}
            className="px-3 py-1.5 rounded-lg border border-rose-800/60 bg-rose-950/60 hover:bg-rose-900 text-rose-200 flex items-center gap-2 text-xs font-medium transition"
            title="Delete selected documents"
          >
            {deletingBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>Delete Selected ({selectedIds.size})</span>
          </button>
        )}

        {canManage && (
          <button
            onClick={handleClearAll}
            disabled={clearingAll || docs.length === 0}
            className="px-3 py-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 flex items-center gap-2 text-xs font-medium transition disabled:opacity-40"
            title="Purge all documents and vector embeddings from the knowledge base"
          >
            {clearingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              {clearingAll
                ? 'Clearing...'
                : sourceFilter === 'web'
                ? 'Clear All Web Scraped'
                : sourceFilter === 'upload'
                ? 'Clear All Uploaded'
                : 'Clear All Documents'}
            </span>
          </button>
        )}
      </div>

      {/* 4 Status Cards matching Screenshot 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Documents</p>
          <p className="text-3xl font-bold text-white">
            {loading ? '...' : stats.documents}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Indexed</p>
          <p className="text-3xl font-bold text-emerald-400">
            {loading ? '...' : stats.indexed}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Processing</p>
          <p className="text-3xl font-bold text-amber-400">
            {loading ? '...' : stats.processing}
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-xs font-medium text-slate-400 mb-1">Failed</p>
          <p className="text-3xl font-bold text-rose-400">
            {loading ? '...' : stats.failed}
          </p>
        </div>
      </div>

      {/* Search & Source Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              sourceFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            All ({docs.length})
          </button>
          <button
            onClick={() => setSourceFilter('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              sourceFilter === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Upload className="w-3 h-3" />
            Uploaded ({docs.filter((d) => !isWebDoc(d)).length})
          </button>
          <button
            onClick={() => setSourceFilter('web')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              sourceFilter === 'web'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            Web Scraped ({docs.filter((d) => isWebDoc(d)).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark w-full pl-8 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Main Documents Table matching Screenshot 6 */}
      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredDocs.length > 0 && selectedIds.size === filteredDocs.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="py-3 px-4">File</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4">Assistant</th>
                <th className="py-3 px-4">Index Status</th>
                <th className="py-3 px-4">Used</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span>Loading knowledge base documents...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-6 h-6 text-slate-500" />
                      <span>No documents found matching the filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="table-row">
                    <td className="py-3.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => toggleSelectOne(doc.id)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      {isWebDoc(doc) ? (
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[200px]" title={doc.file}>
                        {doc.file}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#121e36] border border-[#1b2a47] px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                        {doc.type}
                      </span>
                      {isWebDoc(doc) && (
                        <span className="ml-1.5 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.5 rounded font-sans">
                          Web
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{doc.size}</td>
                    <td className="py-3.5 px-4 text-slate-400">{doc.uploaded}</td>
                    <td className="py-3.5 px-4 font-medium text-blue-300">{doc.assistant}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          doc.status === 'Indexed'
                            ? 'badge-active'
                            : doc.status === 'Processing'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{doc.used}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="bg-[#121e36] hover:bg-[#1b2a47] text-blue-400 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                        >
                          View
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleDelete(doc)}
                            title="Delete document"
                            className="bg-[#121e36] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 px-2 py-1 rounded text-xs transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-[#1b2a47] rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1b2a47]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white text-base truncate max-w-[340px]">
                  {selectedDoc.file}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-[#121e36] p-3.5 rounded border border-[#1b2a47]">
                <div>
                  <span className="text-slate-400 block text-[11px]">Type:</span>
                  <span className="font-mono font-medium text-white">{selectedDoc.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Size:</span>
                  <span className="text-white">{selectedDoc.size}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Uploaded:</span>
                  <span className="text-white">{selectedDoc.uploaded}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status:</span>
                  <span
                    className={
                      selectedDoc.status === 'Indexed'
                        ? 'text-emerald-400 font-medium'
                        : selectedDoc.status === 'Processing'
                        ? 'text-amber-400 font-medium'
                        : 'text-rose-400 font-medium'
                    }
                  >
                    {selectedDoc.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Target Assistant:</span>
                <span className="text-blue-300 font-medium">{selectedDoc.assistant}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Source Reference:</span>
                <span className="font-mono text-slate-300 bg-[#090e1a] p-2 rounded block border border-[#1b2a47] break-all">
                  {selectedDoc.source_ref}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Document ID:</span>
                <span className="font-mono text-[11px] text-slate-400 break-all">{selectedDoc.id}</span>
              </div>

              {selectedDoc.created_at && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Indexed At:</span>
                  <span className="text-slate-300">{new Date(selectedDoc.created_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-[#1b2a47]">
              {canManage && (
                <button
                  onClick={() => handleDelete(selectedDoc)}
                  className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 px-3.5 py-1.5 rounded text-xs transition"
                >
                  Delete Document
                </button>
              )}
              <button
                onClick={() => setSelectedDoc(null)}
                className="btn-secondary text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!docToDelete}
        title="Delete document?"
        description="This will permanently remove the document and its indexed content from the knowledge base. This action cannot be undone."
        subject={docToDelete?.file}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDocToDelete(null)}
      />

      <ConfirmDialog
        open={showBatchDeleteDialog}
        title={`Delete ${selectedIds.size} selected document${selectedIds.size > 1 ? 's' : ''}?`}
        description="This will permanently remove the selected documents and their vector embeddings from the knowledge base. This action cannot be undone."
        subject={`${selectedIds.size} document(s) selected`}
        confirmLabel={deletingBatch ? 'Deleting...' : 'Delete Selected'}
        variant="danger"
        loading={deletingBatch}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setShowBatchDeleteDialog(false)}
      />

      <ConfirmDialog
        open={showClearAllDialog}
        title={
          sourceFilter === 'web'
            ? 'Clear All Web Scraped Pages?'
            : sourceFilter === 'upload'
            ? 'Clear All Uploaded Documents?'
            : 'Clear All Documents?'
        }
        description={
          sourceFilter === 'web'
            ? 'This will permanently remove all web-scraped pages and their vector embeddings from the knowledge base. Uploaded files will be preserved. This action cannot be undone.'
            : sourceFilter === 'upload'
            ? 'This will permanently remove all uploaded documents and their vector embeddings from the knowledge base. Web-scraped pages will be preserved. This action cannot be undone.'
            : 'This will permanently remove ALL documents and their vector embeddings from your entire knowledge base. This action cannot be undone.'
        }
        subject={
          sourceFilter === 'web'
            ? `${docs.filter(isWebDoc).length} web-scraped page(s)`
            : sourceFilter === 'upload'
            ? `${docs.filter((d) => !isWebDoc(d)).length} uploaded document(s)`
            : `${docs.length} total document(s)`
        }
        confirmLabel={clearingAll ? 'Clearing...' : 'Clear All'}
        variant="danger"
        loading={clearingAll}
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearAllDialog(false)}
      />
    </div>
  );
}
