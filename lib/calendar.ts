import { addDays, toISODate } from "./dateUtils";
import type { AssignmentItem } from "./types";

function compactDate(date: string) {
  return date.replaceAll("-", "");
}

function compactDateTime(date: string, time: string) {
  return `${compactDate(date)}T${time.replace(":", "")}00`;
}

function escapeIcsText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}

function getAssignmentEndDate(assignment: AssignmentItem) {
  return toISODate(addDays(new Date(`${assignment.date}T12:00:00`), 1));
}

function getCalendarTitle(assignment: AssignmentItem) {
  return `${assignment.courseName}: ${assignment.title}`;
}

function getCalendarDescription(assignment: AssignmentItem) {
  const parts = [
    `Type: ${assignment.type}`,
    assignment.gradeWeight !== null ? `Grade weight: ${assignment.gradeWeight}%` : null,
    `Source: ${assignment.sourceText}`,
  ].filter(Boolean);

  return parts.join("\n");
}

export function getGoogleCalendarUrl(assignment: AssignmentItem) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: getCalendarTitle(assignment),
    details: getCalendarDescription(assignment),
  });

  if (assignment.timeStatus === "timed" && assignment.startTime && assignment.endTime) {
    params.set("dates", `${compactDateTime(assignment.date, assignment.startTime)}/${compactDateTime(assignment.date, assignment.endTime)}`);
  } else {
    params.set("dates", `${compactDate(assignment.date)}/${compactDate(getAssignmentEndDate(assignment))}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createIcsText(assignments: AssignmentItem[]) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const events = assignments
    .map((assignment) => {
      const lines = [
        "BEGIN:VEVENT",
        `UID:${assignment.id}@riskweeks.local`,
        `DTSTAMP:${timestamp}`,
        `SUMMARY:${escapeIcsText(getCalendarTitle(assignment))}`,
        `DESCRIPTION:${escapeIcsText(getCalendarDescription(assignment))}`,
      ];

      if (assignment.timeStatus === "timed" && assignment.startTime && assignment.endTime) {
        lines.push(`DTSTART:${compactDateTime(assignment.date, assignment.startTime)}`);
        lines.push(`DTEND:${compactDateTime(assignment.date, assignment.endTime)}`);
      } else {
        lines.push(`DTSTART;VALUE=DATE:${compactDate(assignment.date)}`);
        lines.push(`DTEND;VALUE=DATE:${compactDate(getAssignmentEndDate(assignment))}`);
      }

      lines.push("END:VEVENT");
      return lines.join("\r\n");
    })
    .join("\r\n");

  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RiskWeeks//Semester Schedule//EN", "CALSCALE:GREGORIAN", events, "END:VCALENDAR"].join("\r\n");
}

export function getIcsFileName(label: string) {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "riskweeks"}-calendar.ics`;
}
