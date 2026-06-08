import { formatDisplayDate, formatWeekRange } from "@/lib/dateUtils";
import type { WeekRisk } from "@/lib/types";
import { CalendarActions } from "./CalendarActions";
import { RiskBadge } from "./RiskBadge";

const cardStyles = {
  Low: "border-ink/10 bg-white",
  Medium: "border-lemon/60 bg-white",
  High: "border-coral/30 bg-coral/[0.04]",
  Critical: "border-poppy/30 bg-poppy/[0.04]",
};

export function WeekRiskCard({ week }: { week: WeekRisk }) {
  return (
    <article className={`rounded-lg border p-5 shadow-sm ${cardStyles[week.level]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{formatWeekRange(week.weekStart, week.weekEnd)}</h3>
          <p className="mt-1 text-sm text-ink/50">
            {week.assignments.length} deadline{week.assignments.length === 1 ? "" : "s"} · {week.score} risk points
          </p>
        </div>
        <RiskBadge level={week.level} />
      </div>
      {(week.level === "High" || week.level === "Critical") && (
        <p className="mt-3 rounded-lg bg-white/75 px-3 py-2 text-sm font-medium leading-6 text-ink/70">
          {week.reasons[0]}
        </p>
      )}
      <div className="mt-4 space-y-2">
        {week.assignments.map((assignment) => (
          <div key={assignment.id} className="rounded-lg bg-white p-3 ring-1 ring-ink/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{assignment.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-paper px-2 py-1 text-xs font-medium capitalize text-ink/70">
                  {assignment.type}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2 py-1 text-xs font-semibold text-ink/60">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: assignment.courseColor }}
                    aria-hidden="true"
                  />
                  {assignment.courseName}
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              {formatDisplayDate(assignment.date)}
              {assignment.startTime ? ` · ${assignment.startTime}` : " · All-day"}
              {assignment.gradeWeight !== null ? ` · ${assignment.gradeWeight}%` : ""}
            </p>
            <div className="mt-3">
              <CalendarActions assignment={assignment} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
