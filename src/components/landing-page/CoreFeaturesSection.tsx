import { CheckCircle2, Database, Globe, ShieldCheck } from "lucide-react";
import Image from "next/image";

const ORBIT_BADGES = [
  {
    label: "Knowledge Base",
    icon: Database,
    className: "top-2 left-0 sm:-left-4",
    delay: "0s",
  },
  {
    label: "Zero Hallucination",
    icon: ShieldCheck,
    className: "bottom-6 left-2 sm:left-0",
    delay: "0.6s",
  },
  {
    label: "24/7 Live",
    icon: Globe,
    className: "top-6 right-0 sm:-right-4",
    delay: "1.1s",
  },
];

const FEATURES = [
  {
    title: "Guided Onboarding",
    body: "Walk every new teammate through workspace setup, knowledge sync, and widget install with a short, contextual introduction.",
  },
  {
    title: "One-Click Knowledge Sync",
    bullets: [
      "Re-crawl or re-index any source in a single click, no redeploy needed.",
      "Manage every document and URL from one dashboard.",
    ],
  },
  {
    title: "Custom Branding & Greetings",
    bullets: [
      "Match the widget's colors, avatar, and tone to your brand.",
      "Personalize the greeting message for every tenant.",
    ],
  },
];

/** Numbered core-feature list beside a glowing AI mascot illustration. */
export default function CoreFeaturesSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Numbered feature list */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-10">
              Our Core Features
            </h2>

            <div className="space-y-8">
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  {feature.body ? (
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.body}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {feature.bullets?.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-sm text-slate-400 leading-relaxed flex gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI mascot illustration */}
          <div className="relative flex items-center justify-center py-6">
            {/* Ambient glow, no boxed card */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute w-56 h-56 rounded-full bg-blue-600/15 blur-3xl animate-float-b" />

            {/* Dashed orbit ring */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-dashed border-cyan-400/15" />

            <div className="relative w-64 h-64 sm:w-72 sm:h-72 animate-float-c">
              <Image
                src="/robot.png"
                alt="Mediusware AI assistant mascot"
                fill
                sizes="(min-width: 640px) 18rem, 16rem"
                className="object-contain drop-shadow-[0_15px_45px_rgba(34,211,238,0.4)]"
                priority={false}
              />
            </div>

            {/* Orbiting feature badges */}
            {ORBIT_BADGES.map(({ label, icon: Icon, className, delay }) => (
              <div
                key={label}
                className={`hidden sm:flex absolute items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-[#0c1427]/90 backdrop-blur-xl shadow-lg animate-float-a ${className}`}
                style={{ animationDelay: delay }}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}

            <div className="absolute bottom-0 w-28 h-4 rounded-full bg-cyan-500/25 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
