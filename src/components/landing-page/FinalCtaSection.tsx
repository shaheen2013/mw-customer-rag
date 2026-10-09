import { ArrowRight } from "lucide-react";
import Link from "next/link";

/** Final conversion moment: one clear next step after all context has been given. */
export default function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug mb-3">
          Ready to put your knowledge to work?
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          Create your workspace and connect your first document in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Create Organization Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#0c1427] hover:bg-[#121f3a] text-slate-200 border border-[#1b2a47] hover:border-slate-600 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>Sign In to Existing Workspace</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
