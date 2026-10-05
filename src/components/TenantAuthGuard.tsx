'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Building2 } from 'lucide-react';

export default function TenantAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setHasHydrated(true);

    let activeUser = user;

    // Check localStorage fallback if store is not yet initialized
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

    if (!activeUser) {
      router.replace('/login');
    } else {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, setUser, setHasHydrated, router]);

  if (!isReady || !user) {
    return (
      <div className="min-h-screen bg-[#060a14] flex flex-col items-center justify-center text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-[#0c1427] border border-[#1b2a47] rounded-2xl shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Loading Workspace...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to your organization portal</p>
          </div>
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
