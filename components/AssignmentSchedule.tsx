import { Clock } from "lucide-react";
import { CalendarActions, BulkCalendarDownload } from "./CalendarActions";
import { formatDisplayDate } from "@/lib/dateUtils";
import type { AssignmentItem } from "@/lib/types";

function getScheduleLabel(assignment: AssignmentItem) {
  if (assignment.timeStatus === "timed" && assignment.startTime) return assignment.startTime;
  if (assignment.timeStatus === "tbd") return "All-day · time TBD";
  return "All-day";
}

export function AssignmentSchedule({ assignments }: { assignments: AssignmentItem[] }) {
  const sortedAssignments = [...assignments].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Semester schedule</h2>
          <p className="mt-1 text-sm text-ink/60">
            Every extracted assignment becomes a calendar-ready event. If a time is TBD, RiskWeeks creates an all-day
            event.
          </p>
        </div>
        <BulkCalendarDownload assignments={sortedAssignments} />
      </div>

      <div className="mt-5 space-y-3">
        {sortedAssignments.map((assignment) => (
          <article key={assignment.id} className="grid gap-3 rounded-lg bg-paper p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="min-w-[112px]">
              <p className="text-sm font-bold text-ink">{formatDisplayDate(assignment.date)}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50">
                <Clock size={13} aria-hidden="true" />
                {getScheduleLabel(assignment)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-ink">{assignment.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-xs font-semibold text-ink/60">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: assignment.courseColor }}
                    aria-hidden="true"
                  />
                  {assignment.courseName}
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium capitalize text-ink/60">
                  {assignment.type}
                </span>
                {assignment.gradeWeight !== null ? (
                  <span className="rounded-full bg-lemon/40 px-2 py-1 text-xs font-bold text-ink">
                    {assignment.gradeWeight}%
                  </span>
                ) : null}
              </div>
            </div>

            <CalendarActions assignment={assignment} variant="full" />
          </article>
        ))}
      </div>
    </section>
  );
}
