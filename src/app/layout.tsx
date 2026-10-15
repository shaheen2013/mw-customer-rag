import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  title: "Mediusware AI - SaaS Platform",
  description: "Multi-Tenant AI Knowledge Chatbot + Customer Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <html
      lang="en"
      className={`h-full bg-[#060a14] ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <script
          src="http://localhost:3000/widget.js"
          data-tenant-id="3b8825f5-c2fe-4824-bc46-2e108457bc00"
          data-api-host="http://localhost:8000"
          data-color="#4F46E5"
          async>
        </script>
      </body>
    </html>
  );
}
