'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'super_admin') {
      router.push('/admin');
    } else {
      router.push('/portal');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Mediusware AI Platform...</span>
      </div>
    </div>
  );
}
