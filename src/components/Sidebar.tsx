'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Cpu,
  Server,
  FileText,
  AlertTriangle,
  Settings,
  Database,
  Globe,
  Bot,
  MessageSquare,
  BarChart3,
  Code2,
  PieChart,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin' || pathname.startsWith('/admin');

  const superAdminNav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tenants', href: '/admin/tenants', icon: Users },
    { name: 'Plans & Billing', href: '/admin/plans', icon: CreditCard },
    { name: 'AI Usage', href: '/admin/usage', icon: Cpu },
    { name: 'Infrastructure', href: '/admin/infrastructure', icon: Server },
    { name: 'System Logs', href: '/admin/logs', icon: FileText },
    { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const tenantNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: Database },
    { name: 'Web Sources', href: '/web-sources', icon: Globe },
    { name: 'AI Assistant', href: '/assistant', icon: Bot },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Widget & Deploy', href: '/widget', icon: Code2 },
    { name: 'Plan & Usage', href: '/plan', icon: PieChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const currentNav = isSuperAdmin ? superAdminNav : tenantNav;

  return (
    <aside className="w-64 bg-[#060a14] border-r border-[#1b2a47] min-h-screen flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1b2a47]/50 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-lg shadow-blue-500/20">
            M
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Mediusware AI</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 uppercase tracking-wide">
            {isSuperAdmin ? 'Super Admin' : 'Client Portal'}
          </span>
          <button
            onClick={() => router.push(isSuperAdmin ? '/dashboard' : '/admin')}
            className="text-[10px] text-slate-400 hover:text-white underline transition"
          >
            Switch to {isSuperAdmin ? 'Workspace' : 'Admin'}
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#121f38] text-blue-400 border-l-4 border-blue-500 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0d1527]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#1b2a47] bg-[#080d19]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
              JS
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@mediusware.ai'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            title="Log out"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-[#121e36] transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
