"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { CheckCircle2, Save } from "lucide-react";

type SectionKey = "llm" | "vector" | "security" | "crawler";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "llm", label: "Global LLM API Keys" },
  { key: "vector", label: "Vector Database Cluster" },
  { key: "security", label: "Security & Audit Policy" },
  { key: "crawler", label: "Web Crawler Throttling" },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("llm");
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  // No settings API exists on the backend yet (confirmed: no module for this
  // under src/lib/api/), so Save here is intentionally local-only feedback,
  // not a real persistence call.
  const handleSave = (sectionLabel: string) => {
    setSavedLabel(sectionLabel);
    setTimeout(() => setSavedLabel((curr) => (curr === sectionLabel ? null : curr)), 3000);
  };

  // Vector Database Cluster fields
  const [vectorEngine, setVectorEngine] = useState("pgvector");
  const [vectorConnection] = useState(
    "postgres://vector-cluster.internal:5432/mw_rag",
  );
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-3-large");
  const [embeddingDimensions, setEmbeddingDimensions] = useState(1536);
  const [similarityMetric, setSimilarityMetric] = useState("cosine");
  const [autoReindex, setAutoReindex] = useState(true);

  // Security & Audit Policy fields
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [require2fa, setRequire2fa] = useState(false);
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [auditRetentionDays, setAuditRetentionDays] = useState(90);
  const [ipAllowlist, setIpAllowlist] = useState("");

  // Web Crawler Throttling fields
  const [maxConcurrentCrawls, setMaxConcurrentCrawls] = useState(3);
  const [requestDelayMs, setRequestDelayMs] = useState(500);
  const [maxPagesPerJob, setMaxPagesPerJob] = useState(500);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);
  const [crawlerUserAgent, setCrawlerUserAgent] = useState(
    "MediuswareAI-Bot/1.0",
  );

  return (
    <div>
      <Header
        title="System Settings"
        subtitle="Platform configuration, API keys, and infrastructure policies."
        hideTenantSwitcher
        hideDateFilter
      />

      {savedLabel && (
        <div className="mb-4 p-2.5 bg-emerald-950/60 border border-emerald-700/50 rounded-md flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {savedLabel} settings saved locally. (Not yet connected to a
            backend endpoint.)
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            System Controls
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {SECTIONS.map((section) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full text-left p-2 rounded transition cursor-pointer ${
                    activeSection === section.key
                      ? "bg-[#121e36] border border-[#1b2a47] font-semibold text-blue-400"
                      : "border border-transparent hover:bg-[#121e36]"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {activeSection === "llm" && (
          <div className="md:col-span-2 card-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              Global LLM Configuration
            </h3>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Default Provider Model
              </label>
              <select className="input-dark w-full text-xs">
                <option>OpenAI GPT-4o (Default Grounded RAG)</option>
                <option>Anthropic Claude 3.5 Sonnet</option>
                <option>Local Llama 3 70B Instruct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                OpenAI Master API Key
              </label>
              <input
                type="password"
                value="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
                readOnly
                className="input-dark w-full text-xs text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Default Max Context Token Chunk Size
              </label>
              <input
                type="number"
                defaultValue={1024}
                className="input-dark w-full text-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSave("Global LLM API Keys")}
              className="btn-primary text-xs flex items-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        )}

        {activeSection === "vector" && (
          <div className="md:col-span-2 card-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              Vector Database Cluster
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Vector Store Engine
              </label>
              <select
                value={vectorEngine}
                onChange={(e) => setVectorEngine(e.target.value)}
                className="input-dark w-full text-xs"
              >
                <option value="pgvector">pgvector (PostgreSQL)</option>
                <option value="pinecone">Pinecone</option>
                <option value="qdrant">Qdrant</option>
                <option value="weaviate">Weaviate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Cluster Connection String
              </label>
              <input
                type="password"
                value={vectorConnection}
                readOnly
                className="input-dark w-full text-xs text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Embedding Model
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="input-dark w-full text-xs"
                >
                  <option value="text-embedding-3-large">
                    text-embedding-3-large
                  </option>
                  <option value="text-embedding-3-small">
                    text-embedding-3-small
                  </option>
                  <option value="bge-large-en-v1.5">bge-large-en-v1.5</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Embedding Dimensions
                </label>
                <input
                  type="number"
                  min={1}
                  value={embeddingDimensions}
                  onChange={(e) =>
                    setEmbeddingDimensions(Number(e.target.value))
                  }
                  className="input-dark w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Similarity Metric
              </label>
              <select
                value={similarityMetric}
                onChange={(e) => setSimilarityMetric(e.target.value)}
                className="input-dark w-full text-xs"
              >
                <option value="cosine">Cosine Similarity</option>
                <option value="dot">Dot Product</option>
                <option value="l2">Euclidean (L2)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={autoReindex}
                onChange={(e) => setAutoReindex(e.target.checked)}
                className="accent-blue-500"
              />
              Automatically re-index documents on update
            </label>

            <button
              type="button"
              onClick={() => handleSave("Vector Database Cluster")}
              className="btn-primary text-xs flex items-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save Cluster Settings</span>
            </button>
          </div>
        )}

        {activeSection === "security" && (
          <div className="md:col-span-2 card-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              Security & Audit Policy
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min={6}
                  value={minPasswordLength}
                  onChange={(e) =>
                    setMinPasswordLength(Number(e.target.value))
                  }
                  className="input-dark w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Audit Log Retention (days)
              </label>
              <input
                type="number"
                min={1}
                value={auditRetentionDays}
                onChange={(e) =>
                  setAuditRetentionDays(Number(e.target.value))
                }
                className="input-dark w-full text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={require2fa}
                onChange={(e) => setRequire2fa(e.target.checked)}
                className="accent-blue-500"
              />
              Require two-factor authentication for admin accounts
            </label>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Admin Console IP Allowlist (optional)
              </label>
              <textarea
                rows={3}
                value={ipAllowlist}
                onChange={(e) => setIpAllowlist(e.target.value)}
                placeholder="One IP or CIDR range per line"
                className="input-dark w-full text-xs font-mono"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSave("Security & Audit Policy")}
              className="btn-primary text-xs flex items-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save Security Policy</span>
            </button>
          </div>
        )}

        {activeSection === "crawler" && (
          <div className="md:col-span-2 card-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              Web Crawler Throttling
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Max Concurrent Crawl Jobs
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxConcurrentCrawls}
                  onChange={(e) =>
                    setMaxConcurrentCrawls(Number(e.target.value))
                  }
                  className="input-dark w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Request Delay (ms)
                </label>
                <input
                  type="number"
                  min={0}
                  value={requestDelayMs}
                  onChange={(e) => setRequestDelayMs(Number(e.target.value))}
                  className="input-dark w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Max Pages per Crawl Job
              </label>
              <input
                type="number"
                min={1}
                value={maxPagesPerJob}
                onChange={(e) => setMaxPagesPerJob(Number(e.target.value))}
                className="input-dark w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Crawler User-Agent
              </label>
              <input
                type="text"
                value={crawlerUserAgent}
                onChange={(e) => setCrawlerUserAgent(e.target.value)}
                className="input-dark w-full text-xs font-mono"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={respectRobotsTxt}
                onChange={(e) => setRespectRobotsTxt(e.target.checked)}
                className="accent-blue-500"
              />
              Respect robots.txt on target domains
            </label>

            <button
              type="button"
              onClick={() => handleSave("Web Crawler Throttling")}
              className="btn-primary text-xs flex items-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save Crawler Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
