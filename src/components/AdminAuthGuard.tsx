'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const [isReady, setIsReady] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    setHasHydrated(true);

    let activeUser = user;

    if (!activeUser && typeof window !== 'undefined') {
      const saved = localStorage.getItem('mw_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setUser(parsed);
            activeUser = parsed;
          }
        } catch {
          // ignore corrupted local storage
        }
      }
    }

    const isAdmin =
      activeUser &&
      (activeUser.role === 'super_admin' || activeUser.role === 'platform_admin');

    if (!activeUser || !isAdmin) {
      router.replace('/admin/login');
    } else {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, setUser, setHasHydrated, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isAdmin =
    user && (user.role === 'super_admin' || user.role === 'platform_admin');

  if (!isReady || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#040812] flex flex-col items-center justify-center text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-[#0b1324] border border-rose-500/20 rounded-2xl shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Verifying Admin Permissions...</p>
            <p className="text-xs text-slate-400 mt-1">Checking secure session governance</p>
          </div>
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
