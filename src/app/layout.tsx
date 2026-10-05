import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Mediusware AI - SaaS Platform",
  description: "Multi-Tenant AI Knowledge Chatbot + Customer Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#060a14]">
      <body className="min-h-full flex flex-col text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
