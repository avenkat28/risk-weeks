import type { LucideIcon } from "lucide-react";

const toneStyles = {
  neutral: {
    card: "border-ink/10",
    icon: "bg-mint text-moss",
  },
  warning: {
    card: "border-lemon/50",
    icon: "bg-lemon/40 text-amber-800",
  },
  danger: {
    card: "border-coral/30",
    icon: "bg-coral/15 text-poppy",
  },
  critical: {
    card: "border-poppy/30",
    icon: "bg-poppy text-white",
  },
};

export function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <div className={`rounded-lg border bg-white p-5 shadow-sm ${toneStyles[tone].card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="mt-2 break-words text-3xl font-bold text-ink">{value}</p>
          {detail ? <p className="mt-2 text-xs text-ink/50">{detail}</p> : null}
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneStyles[tone].icon}`}>
          <Icon size={19} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
