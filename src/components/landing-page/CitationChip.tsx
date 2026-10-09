import { FileText } from "lucide-react";

interface CitationChipProps {
  index: number;
  label: string;
  meta?: string;
  accent?: "cyan" | "indigo";
}

const ACCENTS = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/30",
    index: "text-cyan-300",
    icon: "text-cyan-300",
    label: "text-cyan-50",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-400/30",
    index: "text-indigo-300",
    icon: "text-indigo-300",
    label: "text-indigo-50",
  },
} as const;

/** The "Citation Thread" signature component — a source reference chip used beside generated answers. */
export default function CitationChip({
  index,
  label,
  meta,
  accent = "cyan",
}: CitationChipProps) {
  const theme = ACCENTS[accent];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${theme.border} ${theme.bg} px-3.5 py-2`}
    >
      <span className={`font-mono-ui text-[11px] font-bold ${theme.index}`}>
        {index}
      </span>
      <FileText className={`w-3.5 h-3.5 ${theme.icon}`} />
      <span className={`font-mono-ui text-xs ${theme.label}`}>{label}</span>
      {meta && (
        <span className="font-mono-ui text-[11px] text-slate-500">{meta}</span>
      )}
    </span>
  );
}
