import { ShieldCheck, Lock } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Source-grounded by design",
    body: "Responses are generated only from the documents and sources you've connected to your workspace — not the open internet, not guesses.",
  },
  {
    icon: Lock,
    title: "Isolated by workspace",
    body: "Every organization's documents, conversations, and settings live inside their own workspace boundary, kept separate from every other tenant on the platform.",
  },
];

/** Trust section: explains grounding and tenant isolation — no certifications, logos, or testimonials. */
export default function TrustSection() {
  return (
    <section id="trust" className="py-16 sm:py-20 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
            Answers only come from what you give it.
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            No external knowledge, no cross-tenant data. Just your content,
            answering for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-[#0c1427]/80 border border-[#1b2a47]"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
