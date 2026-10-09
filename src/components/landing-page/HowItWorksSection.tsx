const STEPS = [
  {
    title: "Create Workspace",
    color: "bg-blue-600",
    body: "Register your organization and invite team members to your dedicated portal.",
  },
  {
    title: "Connect Knowledge",
    color: "bg-indigo-600",
    body: "Upload company documents and crawl help centers for semantic search.",
  },
  {
    title: "Deploy & Automate",
    color: "bg-cyan-600",
    body: "Embed the widget on your app to resolve customer queries 24/7 automatically.",
  },
];

/** Three-step workflow explainer, matching the real register → knowledge-base → widget flow. */
export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 max-w-5xl mx-auto px-4 sm:px-6 text-center scroll-mt-20"
    >
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mb-10">
        How It Works
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="p-5 bg-[#0b1324] border border-[#1b2a47] rounded-xl"
          >
            <span
              className={`w-7 h-7 rounded-full ${step.color} text-white font-bold text-xs flex items-center justify-center mb-3`}
            >
              {i + 1}
            </span>
            <h3 className="text-sm font-semibold text-white mb-1">
              {step.title}
            </h3>
            <p className="text-xs text-slate-400">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
