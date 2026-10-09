import { FileText, Globe2, HelpCircle, MessageCircleQuestionMark, Search } from "lucide-react";
import CitationChip from "./CitationChip";

/** Problem/solution framing: scattered knowledge sources on the left, one grounded answer source on the right. */
export default function ProblemSolutionSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Problem */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              The Problem
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug mb-4">
              Your answers are scattered.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-8">
              Documentation in one place, FAQs in another, policies buried in
              a PDF nobody can find. Every support ticket means digging
              through all of it by hand, every single time.
            </p>

            <div className="relative h-32">
              <div className="absolute left-2 top-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c1427]/80 border border-[#1b2a47] -rotate-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">Refund Policy.pdf</span>
              </div>
              <div className="absolute left-40 top-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c1427]/80 border border-[#1b2a47] rotate-2">
                <Globe2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">help.yourapp.com</span>
              </div>
              <div className="absolute left-4 top-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c1427]/80 border border-[#1b2a47] rotate-1">
                <MessageCircleQuestionMark className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">Team chat threads</span>
              </div>
              <div className="absolute left-56 top-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0c1427]/80 border border-[#1b2a47] -rotate-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400">Tribal knowledge</span>
              </div>
            </div>
          </div>

          {/* Solution */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3">
              The Solution
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug mb-4">
              One place that already knows the answer.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-8">
              Connect everything you already have — documents, FAQs, website
              content — and get answers generated directly from it, with the
              source attached every time.
            </p>

            <div className="rounded-2xl border border-[#1b2a47] bg-[#0d1527] p-5">
              <div className="flex items-center gap-3 rounded-xl border border-[#1b2a47] bg-[#121e36] px-4 py-3 mb-4">
                <Search className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-300">
                  What&apos;s our refund window?
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <CitationChip index={1} label="refund-policy.pdf" accent="cyan" />
                <CitationChip index={2} label="help.yourapp.com" accent="indigo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
