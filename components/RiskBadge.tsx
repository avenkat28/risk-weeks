import type { RiskLevel } from "@/lib/types";

const badgeStyles: Record<RiskLevel, string> = {
  Low: "bg-mint text-moss ring-moss/20",
  Medium: "bg-lemon/40 text-amber-800 ring-amber-500/25",
  High: "bg-coral/20 text-poppy ring-coral/30",
  Critical: "bg-poppy text-white ring-poppy/30 shadow-sm",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeStyles[level]}`}>
      {level}
    </span>
  );
}
