"use client";

import Sidebar from "@/components/Sidebar";
import TenantAuthGuard from "@/components/TenantAuthGuard";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantAuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#090e1a]">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto mx-auto w-full h-full">
          {children}
        </main>
      </div>
    </TenantAuthGuard>
  );
}
