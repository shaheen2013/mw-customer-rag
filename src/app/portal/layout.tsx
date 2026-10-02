'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#090e1a]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
