'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Bot,
  Database,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Code2,
  CheckCircle2,
  Building2,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'platform_admin';
  const targetDashboardUrl = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55rem] h-[35rem] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 right-10 w-[28rem] h-[28rem] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-[#1b2a47]/60 backdrop-blur-md bg-[#060a14]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-blue-600/25 border border-white/20">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Mediusware{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Enterprise Customer RAG
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <Link
                href={targetDashboardUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-[#101b33] border border-transparent hover:border-[#1b2a47] rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI-POWERED MULTI-TENANT RAG PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Intelligent Customer Support,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Grounded in Your Knowledge.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Connect documentation, websites, and FAQs to deliver instant, accurate 24/7 customer
            support with zero hallucination and strict multi-tenant data isolation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Create Organization Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0c1427] hover:bg-[#121f3a] text-slate-200 border border-[#1b2a47] hover:border-slate-600 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Sign In to Existing Workspace</span>
            </Link>
          </div>

          {/* Interactive Preview Card */}
          <div className="bg-[#0b1426]/90 border border-[#1b2a47] rounded-2xl shadow-2xl p-5 sm:p-7 text-left max-w-3xl mx-auto backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-[#1b2a47] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white">Mediusware Support Copilot</h2>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Grounded RAG v2.0
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/20 font-mono">
                99.4% Accuracy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#101c36] p-3.5 rounded-xl border border-blue-500/20">
                <p className="text-slate-400 text-[11px] font-medium mb-1">User Query</p>
                <p className="text-white">How do we configure single sign-on and manage tenant access?</p>
              </div>

              <div className="bg-[#080e1c] p-3.5 rounded-xl border border-[#1b2a47]">
                <p className="text-blue-400 text-[11px] font-medium mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI RAG Response
                </p>
                <p className="text-slate-200 leading-relaxed">
                  Organization Admins can configure SSO in <span className="text-blue-300 font-semibold">Settings → Security</span>. Each tenant workspace is strictly isolated via cryptographic JWT tokens and database row partitioning.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#1b2a47]/60 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
                    Source: knowledge_base/security.pdf (Page 4)
                  </span>
                  <span>• Latency: 240ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 border-t border-[#1b2a47]/60 bg-[#070c18]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Engineered for Enterprise Customer Support
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Everything you need to automate support tickets and empower your customer success team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Knowledge Base Ingestion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload PDFs, Markdown, Word documents, or sync live web pages for instant vector chunking and indexing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Live Web Crawler</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically crawl your public help center, blog, and documentation domains with recurring auto-sync.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Embeddable Chat Widget</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deploy to any website with a single 1-line script tag. Fully brandable colors, avatars, and welcome flows.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Strict Tenant Isolation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero data bleed. Every vector, conversation log, and API token is isolated per organization boundary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Flow */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Create Workspace</h3>
              <p className="text-xs text-slate-400">
                Register your organization and invite team members to your dedicated portal.
              </p>
            </div>

            <div className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Connect Knowledge</h3>
              <p className="text-xs text-slate-400">
                Upload company documents and crawl help centers for semantic search.
              </p>
            </div>

            <div className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Deploy & Automate</h3>
              <p className="text-xs text-slate-400">
                Embed the widget on your app to resolve customer queries 24/7 automatically.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2a47]/60 py-8 bg-[#040812] text-xs text-slate-500 text-center relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Mediusware AI Platform &copy; 2026. Enterprise Customer Support Intelligence.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-white transition">Register Organization</Link>
            <Link href="/admin/login" className="hover:text-rose-400 transition">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
