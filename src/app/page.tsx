"use client";

import ChannelsSection from "@/components/landing-page/ChannelsSection";
import CoreFeaturesSection from "@/components/landing-page/CoreFeaturesSection";
import HeroSection from "@/components/landing-page/HeroSection";
import TrustedIndustriesSection from "@/components/landing-page/TrustedIndustriesSection";
import WhyChooseSection from "@/components/landing-page/WhyChooseSection";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, Code2, Database, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isAdmin =
    user?.role === "super_admin" || user?.role === "platform_admin";
  const targetDashboardUrl = isAdmin ? "/admin" : "/dashboard";

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
          backgroundSize: "28px 28px",
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
                Mediusware{" "}
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
        <HeroSection />

        <TrustedIndustriesSection />

        {/* Feature Highlights Grid */}
        <section className="py-16 bg-[#070c18]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Engineered for Enterprise Customer Support
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Everything you need to automate support tickets and empower your
                customer success team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Knowledge Base Ingestion
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload PDFs, Markdown, Word documents, or sync live web pages
                  for instant vector chunking and indexing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Live Web Crawler
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically crawl your public help center, blog, and
                  documentation domains with recurring auto-sync.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Embeddable Chat Widget
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deploy to any website with a single 1-line script tag. Fully
                  brandable colors, avatars, and welcome flows.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-[#0c1427]/80 border border-[#1b2a47] rounded-2xl shadow-lg hover:border-blue-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Strict Tenant Isolation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero data bleed. Every vector, conversation log, and API token
                  is isolated per organization boundary.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CoreFeaturesSection />

        <ChannelsSection />

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
              <h3 className="text-sm font-semibold text-white mb-1">
                Create Workspace
              </h3>
              <p className="text-xs text-slate-400">
                Register your organization and invite team members to your
                dedicated portal.
              </p>
            </div>

            <div className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">
                Connect Knowledge
              </h3>
              <p className="text-xs text-slate-400">
                Upload company documents and crawl help centers for semantic
                search.
              </p>
            </div>

            <div className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl">
              <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">
                Deploy & Automate
              </h3>
              <p className="text-xs text-slate-400">
                Embed the widget on your app to resolve customer queries 24/7
                automatically.
              </p>
            </div>
          </div>
        </section>

        <WhyChooseSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2a47]/60 py-8 bg-[#040812] text-xs text-slate-500 text-center relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Mediusware AI Platform &copy; 2026. Enterprise Customer Support
            Intelligence.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Register Organization
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-rose-400 transition"
            >
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
