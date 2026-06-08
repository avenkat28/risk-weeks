import { CheckCircle2 } from "lucide-react";
import { formatDisplayDate } from "@/lib/dateUtils";
import type { PrepRecommendation } from "@/lib/types";

export function PrepPlan({ recommendations }: { recommendations: PrepRecommendation[] }) {
  const visible = recommendations.slice(0, 8);

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        {visible.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-lg bg-paper p-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-moss" size={18} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">{formatDisplayDate(item.actionDate)}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.courseColor }} aria-hidden="true" />
                {item.courseName}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/60">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
