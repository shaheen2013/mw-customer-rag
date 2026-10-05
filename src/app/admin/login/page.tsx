'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminLoginMutation } from '@/hooks/useAuthQueries';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@mediusware.ai');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminLoginMutation = useAdminLoginMutation({
    onError: (err: any) => {
      const msg = err?.data?.error?.message || err?.message || 'Authentication failed. Please check credentials.';
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    adminLoginMutation.mutate({ email, password });
  };

  const isLoading = adminLoginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-rose-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[36rem] h-[36rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10">
        {/* Top Header Badge & Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4 tracking-wide shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>SUPERADMIN SECURITY CONSOLE</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-rose-600/20 border border-white/20">
              M
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Mediusware{' '}
              <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Platform governance, tenant management, and system telemetry access.
          </p>
        </div>

        {/* Card Box with Glassmorphism */}
        <div className="bg-[#0b1324]/90 backdrop-blur-xl border border-rose-500/20 rounded-2xl shadow-2xl p-6 sm:p-8 relative">
          {/* Top subtle glow line */}
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Master Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mediusware.ai"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#070d1a] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Master Password
                </label>
                <span className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer">
                  Hardware token?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#070d1a] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & TLS Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#070d1a] border-[#1b2a47] text-rose-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>Enforce hardware session key</span>
              </label>
              <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TLS 1.3 Strict</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 via-red-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/25 transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Admin Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate to Admin Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Tenant Portal Footer */}
          <div className="mt-6 pt-5 border-t border-[#1b2a47]/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Looking for tenant workspace?</span>
            <Link
              href="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>Go to Tenant Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Mediusware Security Governance &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}
