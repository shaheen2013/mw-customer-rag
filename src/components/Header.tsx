/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Calendar } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTenant, setActiveTenant, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [failedAvatarSrc, setFailedAvatarSrc] = React.useState<string | null>(null);

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'platform_admin' || pathname?.startsWith('/admin');

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().slice(0, 2).toUpperCase();
    }
    return isSuperAdmin ? 'SA' : 'TU';
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
  const resolvedAvatar = user?.avatarUrl
    ? user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')
      ? user.avatarUrl
      : `${apiBaseUrl}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
    : null;

  const tenantsList = ['Acme Corp', 'TechFlow Inc', 'Nexus Solutions', 'Global Dynamic'];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#1b2a47]/60 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Date Filter Pill */}
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-[#121e36] border border-[#1b2a47] rounded-md text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Last 30 days</span>
        </button>

        {/* Tenant Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#121e36] border border-[#1b2a47] rounded-md text-xs font-semibold text-slate-200 hover:text-white hover:border-blue-500 transition"
          >
            <span>{activeTenant}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0d1527] border border-[#1b2a47] rounded-md shadow-xl z-50 py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase border-b border-[#1b2a47]">
                Switch Tenant
              </div>
              {tenantsList.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveTenant(t);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                    activeTenant === t ? 'bg-[#121f38] text-blue-400 font-semibold' : 'text-slate-300 hover:bg-[#121e36]'
                  }`}
                >
                  <span>{t}</span>
                  {activeTenant === t && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <button
          onClick={() => router.push(isSuperAdmin ? '/admin/profile' : '/profile')}
          className="w-8 h-8 rounded-md bg-[#1d3557] border border-blue-500/40 text-blue-200 font-bold flex items-center justify-center text-xs shadow-inner overflow-hidden hover:border-blue-400 transition cursor-pointer"
          title="Account Profile & Settings"
        >
          {resolvedAvatar && resolvedAvatar !== failedAvatarSrc ? (
            <img
              src={resolvedAvatar}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
              onError={() => setFailedAvatarSrc(resolvedAvatar)}
            />
          ) : (
            getInitials(user?.name, user?.email)
          )}
        </button>
      </div>
    </header>
  );
}
