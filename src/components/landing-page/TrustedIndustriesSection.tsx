import {
  Code2,
  CreditCard,
  GraduationCap,
  HeartPulse,
  ShoppingCart,
  Truck,
} from "lucide-react";

const INDUSTRIES = [
  { label: "SaaS & Tech", icon: Code2 },
  { label: "E-Commerce", icon: ShoppingCart },
  { label: "FinTech", icon: CreditCard },
  { label: "Healthcare", icon: HeartPulse },
  { label: "EdTech", icon: GraduationCap },
  { label: "Logistics", icon: Truck },
];

/** Minimal, monochrome strip: who Mediusware AI is built for, between the hero and the feature grid. */
export default function TrustedIndustriesSection() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 animate-fade-in-up"
        >
          Trusted Across Industries
        </p>

        <h2
          className="font-display mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          One Knowledge Base.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Every Support Team.
          </span>
        </h2>
        <p
          className="text-sm text-slate-400 mt-2 max-w-md mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Multi-tenant by design, so teams across every industry run on the
          same platform without ever touching each other&apos;s data.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center">
          {INDUSTRIES.map(({ label, icon: Icon }, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <span className="hidden sm:block w-px h-4 bg-white/10 mx-6 lg:mx-8" />
              )}
              <div
                className="group flex items-center gap-2 py-2 animate-fade-in-up cursor-default"
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
              >
                <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors duration-300">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
