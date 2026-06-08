import type { SyllabusAnalysis } from "./types";
import { buildPrepRecommendations } from "./riskScoring";

export const analysisStorageKey = "riskweeks.analysis.v2";
const legacyAnalysisStorageKey = "riskweeks.analysis.v1";

export function saveAnalysis(analysis: SyllabusAnalysis) {
  window.localStorage.setItem(analysisStorageKey, JSON.stringify(analysis));
}

function withCalendarDefaults<T extends Record<string, unknown>>(assignment: T) {
  return {
    ...assignment,
    timeStatus: assignment.timeStatus || "all-day",
    startTime: assignment.startTime || null,
    endTime: assignment.endTime || null,
  };
}

export function loadAnalysis(): SyllabusAnalysis | null {
  const raw = window.localStorage.getItem(analysisStorageKey) ?? window.localStorage.getItem(legacyAnalysisStorageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SyllabusAnalysis;
    if (parsed.courses) {
      const assignments = parsed.assignments.map(withCalendarDefaults);
      const weeks = parsed.weeks.map((week) => ({
        ...week,
        assignments: week.assignments.map(withCalendarDefaults),
      }));

      return {
        ...parsed,
        assignments,
        weeks,
        recommendations: buildPrepRecommendations(weeks),
      } as SyllabusAnalysis;
    }

    const courseId = "legacy-course";
    const courseName = parsed.courseName || "Imported Course";
    const courseColor = "#2F6F4E";
    return {
      ...parsed,
      courseName,
      courses: [
        {
          id: courseId,
          name: courseName,
          color: courseColor,
          sourceType: "paste",
          assignmentCount: parsed.assignments.length,
        },
      ],
      assignments: parsed.assignments.map((assignment) => ({
        ...withCalendarDefaults(assignment),
        courseId,
        courseName,
        courseColor,
      })),
      weeks: parsed.weeks.map((week) => ({
        ...week,
        assignments: week.assignments.map((assignment) => ({
          ...withCalendarDefaults(assignment),
          courseId,
          courseName,
          courseColor,
        })),
      })),
      recommendations: buildPrepRecommendations(
        parsed.weeks.map((week) => ({
          ...week,
          assignments: week.assignments.map((assignment) => ({
            ...withCalendarDefaults(assignment),
            courseId,
            courseName,
            courseColor,
          })),
        })),
      ),
    };
  } catch {
    return null;
  }
}
