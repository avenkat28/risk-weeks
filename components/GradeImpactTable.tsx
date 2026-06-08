import { formatDisplayDate } from "@/lib/dateUtils";
import type { AssignmentItem } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function GradeImpactTable({ assignments }: { assignments: AssignmentItem[] }) {
  const weightedAssignments = assignments
    .filter((assignment) => assignment.gradeWeight !== null)
    .sort((a, b) => (b.gradeWeight ?? 0) - (a.gradeWeight ?? 0));

  if (weightedAssignments.length === 0) {
    return (
      <EmptyState
        title="No grade-critical deadlines yet"
        message="RiskWeeks found deadlines, but no percentages like 10%, 15%, or 25%. Add weights in the editor to rank grade impact."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-ink text-xs uppercase text-white/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Assignment</th>
            <th className="px-4 py-3 font-semibold">Course</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Due</th>
            <th className="px-4 py-3 text-right font-semibold">Weight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {weightedAssignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-paper/60">
              <td className="px-4 py-3 font-medium text-ink">{assignment.title}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink/65">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: assignment.courseColor }}
                    aria-hidden="true"
                  />
                  {assignment.courseName}
                </span>
              </td>
              <td className="px-4 py-3 capitalize text-ink/60">{assignment.type}</td>
              <td className="px-4 py-3 text-ink/60">{formatDisplayDate(assignment.date)}</td>
              <td className="px-4 py-3 text-right">
                <span className="rounded-full bg-lemon/40 px-2.5 py-1 font-semibold text-ink">
                  {assignment.gradeWeight}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
