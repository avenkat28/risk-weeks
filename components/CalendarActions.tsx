"use client";

import { CalendarPlus, Download } from "lucide-react";
import { createIcsText, getGoogleCalendarUrl, getIcsFileName } from "@/lib/calendar";
import type { AssignmentItem } from "@/lib/types";

function downloadIcs(assignments: AssignmentItem[], label: string) {
  const blob = new Blob([createIcsText(assignments)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getIcsFileName(label);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CalendarActions({
  assignment,
  variant = "compact",
}: {
  assignment: AssignmentItem;
  variant?: "compact" | "full";
}) {
  const label = variant === "full" ? "Apple/Outlook .ics" : ".ics";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={getGoogleCalendarUrl(assignment)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-moss/20 bg-mint px-2.5 py-1.5 text-xs font-semibold text-moss transition hover:bg-moss hover:text-white"
      >
        <CalendarPlus size={14} aria-hidden="true" />
        Google
      </a>
      <button
        type="button"
        onClick={() => downloadIcs([assignment], assignment.title)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-moss hover:text-moss"
      >
        <Download size={14} aria-hidden="true" />
        {label}
      </button>
    </div>
  );
}

export function BulkCalendarDownload({ assignments }: { assignments: AssignmentItem[] }) {
  return (
    <button
      type="button"
      onClick={() => downloadIcs(assignments, "RiskWeeks Semester Schedule")}
      disabled={assignments.length === 0}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-lemon px-4 py-2 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download size={16} aria-hidden="true" />
      Download Semester Calendar
    </button>
  );
}
