import { getWeekStart, toISODate } from "./dateUtils";
import { buildPrepRecommendations, scoreAssignment, scoreWeeks } from "./riskScoring";
import type { AssignmentItem, CourseSyllabus, SyllabusAnalysis } from "./types";

export function rebuildAnalysis(
  baseAnalysis: SyllabusAnalysis,
  assignments: AssignmentItem[],
  courses: CourseSyllabus[] = baseAnalysis.courses,
): SyllabusAnalysis {
  const courseLookup = new Map(courses.map((course) => [course.id, course]));
  const recalculatedAssignments = assignments
    .map((assignment) => {
      const dueDate = new Date(`${assignment.date}T12:00:00`);
      const weekStart = getWeekStart(dueDate);
      const course = courseLookup.get(assignment.courseId);

      return {
        ...assignment,
        courseName: course?.name || assignment.courseName || "Untitled Course",
        courseColor: course?.color || assignment.courseColor || "#2F6F4E",
        title: assignment.title.trim(),
        timeStatus: assignment.startTime ? "timed" : assignment.timeStatus || "all-day",
        startTime: assignment.startTime,
        endTime: assignment.startTime ? assignment.endTime || assignment.startTime : null,
        weekStart: toISODate(weekStart),
        riskPoints: scoreAssignment(assignment.type, assignment.gradeWeight),
        sourceText: assignment.sourceText || "Manually edited deadline",
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeks = scoreWeeks(recalculatedAssignments);

  return {
    ...baseAnalysis,
    courseName: courses.length === 1 ? courses[0].name : `${courses.length} courses`,
    courses: courses.map((course) => ({
      ...course,
      assignmentCount: recalculatedAssignments.filter((assignment) => assignment.courseId === course.id).length,
    })),
    generatedAt: new Date().toISOString(),
    assignments: recalculatedAssignments,
    weeks,
    recommendations: buildPrepRecommendations(weeks),
  };
}

export function combineCourseAnalyses(
  analyses: SyllabusAnalysis[],
  semesterStart: string | null,
  semesterEnd: string | null,
): SyllabusAnalysis {
  const courses = analyses.flatMap((analysis) => analysis.courses);
  const assignments = analyses.flatMap((analysis) => analysis.assignments).sort((a, b) => a.date.localeCompare(b.date));
  const weeks = scoreWeeks(assignments);

  return {
    courseName: courses.length === 1 ? courses[0].name : `${courses.length} courses`,
    courses,
    generatedAt: new Date().toISOString(),
    semesterStart,
    semesterEnd,
    assignments,
    weeks,
    recommendations: buildPrepRecommendations(weeks),
  };
}
