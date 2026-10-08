import {
  Code2,
  Headphones,
  Inbox,
  LifeBuoy,
  Mail,
  MessageCircle,
  Palette,
  Webhook,
} from "lucide-react";

const CHANNELS = [
  { label: "Email", icon: Mail, color: "text-rose-500", top: "18%", left: "27%" },
  { label: "Live Chat Widget", icon: MessageCircle, color: "text-blue-500", top: "26%", left: "74%" },
  { label: "API & Webhooks", icon: Webhook, color: "text-slate-400", top: "52%", left: "24%" },
  { label: "Developer Docs", icon: Code2, color: "text-amber-500", top: "49%", left: "86%" },
  { label: "Help Center", icon: LifeBuoy, color: "text-emerald-500", top: "77%", left: "15%" },
  { label: "Custom Branding", icon: Palette, color: "text-purple-500", top: "82%", left: "33%" },
  { label: "Team Inbox", icon: Inbox, color: "text-fuchsia-500", top: "67%", left: "48%" },
  { label: "Live Support", icon: Headphones, color: "text-cyan-500", top: "80%", left: "73%" },
];

/** Gradient panel with scattered channel badges around a centered headline. */
export default function ChannelsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-500 via-sky-400 to-emerald-400 shadow-2xl shadow-blue-600/30 h-64 sm:h-80 flex items-center justify-center overflow-visible animate-fade-in-up">
          <h2 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white text-center leading-snug px-10 drop-shadow-sm">
            Stay Connected
            <br />
            on All Channels
          </h2>

          {CHANNELS.map(({ label, icon: Icon, color, top, left }, i) => (
            <div
              key={label}
              title={label}
              className="absolute flex w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white items-center justify-center shadow-xl ring-4 ring-[#060a14] animate-float-a"
              style={{
                top,
                left,
                transform: "translate(-50%, -50%)",
                animationDelay: `${i * 0.25}s`,
              }}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
