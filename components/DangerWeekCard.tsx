import { AlertTriangle } from "lucide-react";
import { formatWeekRange } from "@/lib/dateUtils";
import type { WeekRisk } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

export function DangerWeekCard({ week, rank }: { week: WeekRisk; rank: number }) {
  return (
    <article className="rounded-lg border border-poppy/20 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-coral/15 text-poppy">
          <AlertTriangle size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">
              #{rank} {formatWeekRange(week.weekStart, week.weekEnd)}
            </h3>
            <RiskBadge level={week.level} />
          </div>
          <p className="mt-1 text-sm font-medium text-ink/60">{week.score} risk points · {week.assignments.length} deadlines</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from(new Map(week.assignments.map((assignment) => [assignment.courseId, assignment])).values()).map(
              (assignment) => (
                <span
                  key={assignment.courseId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink/65"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: assignment.courseColor }}
                    aria-hidden="true"
                  />
                  {assignment.courseName}
                </span>
              ),
            )}
          </div>
          <ul className="mt-4 space-y-2">
            {week.reasons.slice(0, 3).map((reason) => (
              <li key={reason} className="flex gap-2 text-sm leading-6 text-ink/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-poppy" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
