'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenantRegisterMutation } from '@/hooks/useAuthQueries';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function TenantRegisterPage() {
  const [organizationName, setOrganizationName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useTenantRegisterMutation({
    onError: (err: unknown) => {
      const errorObj = err as { data?: { error?: { message?: string } }; message?: string };
      const msg =
        errorObj?.data?.error?.message ||
        errorObj?.message ||
        'Registration failed. Please try a different email or workspace slug.';
      setErrorMessage(msg);
    },
  });

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrganizationName(val);
    // Auto generate clean slug if user hasn't manually edited slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    registerMutation.mutate({
      name: organizationName,
      email,
      password,
      slug: slug || undefined,
      admin_name: adminName || undefined,
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 left-10 w-[24rem] h-[24rem] bg-emerald-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3 tracking-wide shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>ORGANIZATION ADMIN SIGNUP</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-600/25 border border-white/20">
              M
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Mediusware{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Workspace
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Register your company workspace and deploy your enterprise AI customer support system.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0c1427]/90 backdrop-blur-xl border border-[#1b2a47] rounded-2xl shadow-2xl p-6 sm:p-8 relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          {/* Admin Notice Banner */}
          <div className="mb-5 p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Founding Administrator Account:</span> This
              registers your organization tenant and grants you full admin access to manage knowledge,
              assistants, widgets, and team members.
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={organizationName}
                  onChange={handleOrgNameChange}
                  placeholder="Acme Corporation Ltd."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080e1d] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Workspace Subdomain / Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Workspace Slug
                </label>
                <span className="text-[11px] text-slate-400">
                  {slug ? `${slug}.mediusware.ai` : 'auto-generated'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                  placeholder="acme-corp"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080e1d] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Admin Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080e1d] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@acme.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080e1d] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Admin Password
                </label>
                <span className="text-[11px] text-slate-400">Min 6 characters</span>
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
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#080e1d] border border-[#1b2a47] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Organization Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace & Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer: Already have an account */}
          <div className="mt-6 pt-5 border-t border-[#1b2a47]/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Already have an organization?</span>
            <Link
              href="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Mediusware Multi-Tenant AI Platform &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}
