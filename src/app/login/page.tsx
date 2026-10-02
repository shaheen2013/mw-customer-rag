'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bot, Shield, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'super_admin' | 'tenant_admin'>('tenant_admin');
  const [email, setEmail] = useState('acme@mediusware.ai');
  const [password, setPassword] = useState('password');
  const [tenantName, setTenantName] = useState('Acme Corp');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role, tenantName);
    if (role === 'super_admin') {
      router.push('/admin');
    } else {
      router.push('/portal');
    }
  };

  const quickLoginSuperAdmin = () => {
    login('admin@mediusware.ai', 'super_admin', 'Acme Corp');
    router.push('/admin');
  };

  const quickLoginTenant = () => {
    login('acme@mediusware.ai', 'tenant_admin', 'Acme Corp');
    router.push('/portal');
  };

  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center gap-3 bg-[#0d1527] border border-[#1b2a47] px-4 py-2 rounded-full mb-3 shadow-lg">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            M
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Mediusware AI</span>
        </div>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Multi-Tenant AI Knowledge Chatbot & Customer Intelligence Platform
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#0d1527] border border-[#1b2a47] rounded-xl shadow-2xl p-6 sm:p-8 z-10">
        {/* Tab Switcher: Login vs Register */}
        <div className="flex bg-[#121e36] p-1 rounded-lg border border-[#1b2a47] mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
              mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
              mode === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Tenant
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mb-6 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
            ⚡ Quick Demo Logins
          </div>
          <button
            onClick={quickLoginSuperAdmin}
            type="button"
            className="w-full py-2.5 px-3 bg-[#121f38] hover:bg-[#182845] border border-blue-500/30 rounded-lg text-xs font-medium text-blue-300 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Login as <strong>Super Admin</strong></span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={quickLoginTenant}
            type="button"
            className="w-full py-2.5 px-3 bg-[#121f38] hover:bg-[#182845] border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Login as <strong>Acme Corp (Tenant)</strong></span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#1b2a47]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-medium text-slate-500 uppercase">Or Continue With</span>
          <div className="flex-grow border-t border-[#1b2a47]"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Role selector inside form */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Access Portal</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('super_admin');
                  setEmail('admin@mediusware.ai');
                }}
                className={`py-2 px-3 border rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition ${
                  role === 'super_admin'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                    : 'border-[#1b2a47] bg-[#121e36] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('tenant_admin');
                  setEmail('acme@mediusware.ai');
                }}
                className={`py-2 px-3 border rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition ${
                  role === 'tenant_admin'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                    : 'border-[#1b2a47] bg-[#121e36] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                Client Portal
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                className="w-full bg-[#121e36] border border-[#1b2a47] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@domain.com"
              required
              className="w-full bg-[#121e36] border border-[#1b2a47] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#121e36] border border-[#1b2a47] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/30 transition mt-2"
          >
            {mode === 'login' ? 'Sign In to Platform' : 'Create Organization Account'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-slate-500">
        Mediusware AI Platform &copy; 2026. All rights reserved.
      </p>
    </div>
  );
}
