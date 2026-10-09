"use client";

import { ArrowRight, Bot, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SUGGESTIONS = [
  "Instant Answers from Your Docs",
  "Live Website Crawling & Sync",
  "Embeddable Chat Widget",
  "Strict Tenant Data Isolation",
  "Conversation Analytics & Insights",
];

const ITEM_STAGGER_MS = 180;
const TYPING_MS = 1300;
const HOLD_MS = 4200;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_1px_rgba(103,232,249,0.8)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function ChatPreview() {
  const [phase, setPhase] = useState<"typing" | "answer">("typing");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function runCycle() {
      if (!active) return;
      setPhase("typing");
      setVisibleCount(0);

      timers.push(
        setTimeout(() => {
          if (!active) return;
          setPhase("answer");
          SUGGESTIONS.forEach((_, i) => {
            timers.push(
              setTimeout(() => {
                if (active) setVisibleCount((c) => Math.max(c, i + 1));
              }, i * ITEM_STAGGER_MS),
            );
          });
          timers.push(
            setTimeout(
              runCycle,
              SUGGESTIONS.length * ITEM_STAGGER_MS + HOLD_MS,
            ),
          );
        }, TYPING_MS),
      );
    }

    runCycle();
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto py-8">
      {/* Vivid blobs behind the glass so the blur has something to refract, drifting gently */}
      <div className="absolute -top-2 -left-10 w-44 h-44 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 opacity-70 blur-2xl animate-float-a" />
      <div className="absolute top-1/3 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-70 blur-2xl animate-float-b" />
      <div className="absolute -bottom-2 left-6 w-48 h-32 rounded-full bg-gradient-to-r from-violet-500 to-sky-400 opacity-60 blur-3xl animate-float-c" />
      {/* <div className="absolute -top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-white/70 to-indigo-300/30 border border-white/40 backdrop-blur-sm shadow-lg animate-float-b" /> */}

      {/* Outer glass shell */}
      <div className="relative rounded-[2rem] p-3.5 border border-white/25 bg-white/[0.07] backdrop-blur-2xl shadow-[0_8px_60px_-10px_rgba(99,102,241,0.55),inset_0_1px_0_0_rgba(255,255,255,0.35),inset_0_-1px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5" />
        {/* Shimmer sweep crossing the glass for a living, glossy feel */}
        <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-40 bg-white/10 blur-xl animate-shimmer-sweep" />

        {/* Header */}
        <div className="relative flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-white/10 backdrop-blur-xl px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] animate-fade-in-up">
          <div className="relative w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-300/50 backdrop-blur flex items-center justify-center text-cyan-300 shadow-[0_0_16px_2px_rgba(34,211,238,0.45),inset_0_1px_0_0_rgba(255,255,255,0.4)]">
            <span className="absolute inset-0 rounded-full border border-cyan-300/40 animate-ping" />
            <Bot className="w-5 h-5 relative" />
          </div>
          <div>
            <p className="text-sm font-mono font-semibold tracking-wide text-cyan-50">
              Mediusware<span className="text-cyan-300">_AI</span>
            </p>
            <p className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.7)] animate-pulse" />
              online · responding instantly
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="relative mt-4 space-y-3.5">
          <div
            className="flex justify-end animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-white/30 bg-gradient-to-br from-indigo-400/60 to-violet-500/50 backdrop-blur-xl px-4 py-2.5 text-xs text-white shadow-[0_6px_24px_-6px_rgba(129,140,248,0.7),inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              How could you be useful for my support team?
            </div>
          </div>

          {/* Both phases share one grid cell so the card height is always set by the
              taller (answer) state and swapping phases never reflows the layout. */}
          <div className="grid grid-cols-1 grid-rows-1">
            <div
              className={`col-start-1 row-start-1 self-start transition-opacity duration-200 ${
                phase === "typing"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="inline-block rounded-2xl rounded-tl-sm border border-cyan-400/25 bg-cyan-500/10 backdrop-blur-xl px-4 py-3 shadow-[0_0_20px_-4px_rgba(34,211,238,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                <TypingDots />
              </div>
            </div>

            <div
              className={`col-start-1 row-start-1 self-start transition-opacity duration-200 ${
                phase === "answer"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="inline-block rounded-2xl rounded-tl-sm border border-cyan-400/25 bg-cyan-500/10 backdrop-blur-xl px-4 py-2.5 text-xs font-mono text-cyan-50 shadow-[0_0_20px_-4px_rgba(34,211,238,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                Here is the list I can help you with:
              </div>
              <ul className="mt-2.5 space-y-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/6 backdrop-blur-xl p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                {SUGGESTIONS.map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-300/50 hover:translate-x-1 hover:scale-[1.02] backdrop-blur-md px-3 py-2 text-xs font-mono text-cyan-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-300 ${
                      i < visibleCount
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <span className="text-cyan-300">{">"}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="relative mt-4 flex items-center justify-between rounded-full border border-cyan-400/25 bg-cyan-500/10 backdrop-blur-xl pl-5 pr-2 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          <span className="text-xs font-mono text-cyan-100/70 flex items-center gap-1.5">
            <span className="text-cyan-300">{">"}</span>
            Ask a question
            <span className="w-px h-3.5 bg-cyan-300 animate-blink-cursor" />
          </span>
          <span className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-300/40 flex items-center justify-center text-cyan-200 shadow-[0_0_14px_-2px_rgba(34,211,238,0.6)] hover:scale-110 hover:bg-cyan-500/30 transition-all">
            <Send className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Landing page hero: headline and CTAs on the left, animated-style chat preview on the right. */
export default function HeroSection() {
  return (
    <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-8 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI-POWERED MULTI-TENANT RAG PLATFORM</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Intelligent Customer Support,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Grounded in Your Knowledge.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
            Connect documentation, websites, and FAQs to deliver instant,
            accurate 24/7 customer support with zero hallucination and strict
            multi-tenant data isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
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

        <ChatPreview />
      </div>
    </section>
  );
}
