import { Bot, User } from "lucide-react";
import CitationChip from "./CitationChip";

/**
 * The "Grounded Answer" product visualization: a static, clearly-labeled
 * illustrative mockup of a question answered with cited sources.
 */
export default function ProductDemoSection() {
  return (
    <section className="py-16 sm:py-20 bg-[#070c18]/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug mb-3">
          Ask a question. Get an answer{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            with receipts.
          </span>
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mb-10">
          Every response points back to the exact document it came from. No
          guessing, nothing invented.
        </p>

        <div className="text-left rounded-2xl border border-[#1b2a47] bg-[#0d1527] p-6 sm:p-7 shadow-xl shadow-black/20">
          <div className="flex justify-end mb-4">
            <div className="max-w-[85%] flex items-start gap-2.5">
              <div className="rounded-2xl rounded-tr-sm bg-[#1e293b] px-4 py-2.5 text-sm text-slate-100">
                What&apos;s our refund window for annual plans?
              </div>
              <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-start mb-5">
            <div className="max-w-[92%] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-cyan-500/[0.07] border border-cyan-400/20 px-4 py-3 text-sm text-slate-100 leading-relaxed">
                Annual plans can be refunded within 30 days of the invoice
                date
                <sup className="font-mono-ui text-cyan-300 font-bold mx-0.5">
                  1
                </sup>
                . After that window, we offer prorated account credit instead
                of a cash refund
                <sup className="font-mono-ui text-indigo-300 font-bold mx-0.5">
                  2
                </sup>
                .
              </div>
            </div>
          </div>

          <div className="pl-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2.5">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              <CitationChip
                index={1}
                label="refund-policy.pdf"
                meta="p.2"
                accent="cyan"
              />
              <CitationChip index={2} label="billing-faq" accent="indigo" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Illustrative example — answers in your workspace cite your own
          connected documents.
        </p>
      </div>
    </section>
  );
}
