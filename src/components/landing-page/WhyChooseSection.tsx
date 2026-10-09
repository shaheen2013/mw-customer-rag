import { Clock3, Languages, ShieldCheck, Zap } from "lucide-react";

const CARDS = [
  {
    title: "Instant Answers",
    description:
      "Generate grounded responses from your knowledge base in under a second.",
    icon: Zap,
    active: true,
  },
  {
    title: "Zero Hallucination",
    description:
      "Every answer is grounded strictly in your own documents, nothing invented.",
    icon: ShieldCheck,
    active: false,
  },
  {
    title: "40+ Languages",
    description:
      "Connect with customers in over 40 languages for effortless support.",
    icon: Languages,
    active: false,
  },
  {
    title: "24/7 Availability",
    description:
      "No matter the time zone, your AI agent is always on and ready to help.",
    icon: Clock3,
    active: false,
  },
];

/** "Why choose us" pitch: a 2x2 benefits grid beside a closing headline. */
export default function WhyChooseSection() {
  return (
    <section className="py-16 sm:py-20 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 2x2 benefits grid */}
          <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
            {CARDS.map(({ title, description, icon: Icon, active }, i) => (
              <div
                key={title}
                className={`p-5 rounded-2xl animate-fade-in-up transition-colors duration-300 ${
                  active
                    ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 shadow-xl shadow-blue-600/25"
                    : "bg-[#0c1427]/80 border border-[#1b2a47] hover:border-blue-500/40"
                }`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    active
                      ? "bg-white/15 border border-white/20 text-white"
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${active ? "text-white/80" : "text-slate-400"}`}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* Headline, copy, CTA */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Mediusware AI
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-md mx-auto lg:mx-0">
              Mediusware AI brings together retrieval-grounded answers and
              strict multi-tenant isolation, so every organization gets a
              private, accurate support agent without the risk of data bleeding
              between tenants.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
