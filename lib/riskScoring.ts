import { addDays, toISODate } from "./dateUtils";
import type { AssignmentItem, AssignmentType, PrepRecommendation, RiskLevel, WeekRisk } from "./types";

export const baseRiskPoints: Record<AssignmentType, number> = {
  reading: 1,
  discussion: 2,
  homework: 3,
  lab: 3,
  quiz: 4,
  paper: 5,
  project: 6,
  simulation: 5,
  presentation: 6,
  exam: 7,
  midterm: 8,
  final: 9,
  other: 2,
};

const testTypes: AssignmentType[] = ["quiz", "exam", "midterm", "final"];
const majorTypes: AssignmentType[] = ["project", "paper", "presentation", "simulation"];

export function scoreAssignment(type: AssignmentType, gradeWeight: number | null) {
  let score = baseRiskPoints[type] ?? baseRiskPoints.other;
  if (gradeWeight !== null && gradeWeight >= 20) {
    score += 5;
  } else if (gradeWeight !== null && gradeWeight >= 10) {
    score += 3;
  }
  return score;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export function scoreWeeks(assignments: AssignmentItem[]): WeekRisk[] {
  const grouped = assignments.reduce<Record<string, AssignmentItem[]>>((acc, assignment) => {
    acc[assignment.weekStart] = [...(acc[assignment.weekStart] ?? []), assignment];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([weekStart, weekAssignments]) => {
      const sortedAssignments = [...weekAssignments].sort((a, b) => a.date.localeCompare(b.date));
      const testCount = sortedAssignments.filter((item) => testTypes.includes(item.type)).length;
      const hasTest = sortedAssignments.some((item) => ["exam", "midterm", "final"].includes(item.type));
      const hasMajor = sortedAssignments.some((item) => majorTypes.includes(item.type));
      const courseCount = new Set(sortedAssignments.map((item) => item.courseId)).size;
      const reasons: string[] = [];
      let score = sortedAssignments.reduce((sum, item) => sum + item.riskPoints, 0);

      if (courseCount >= 2) {
        reasons.push(`Deadlines from ${courseCount} classes overlap this week`);
      }
      if (sortedAssignments.length >= 3) {
        score += 4;
        reasons.push(`${sortedAssignments.length} deadlines clustered in the same week`);
      }
      if (testCount >= 2) {
        score += 5;
        reasons.push("Multiple quizzes or exams close together");
      }
      if (hasMajor && hasTest) {
        score += 5;
        reasons.push("A major deliverable overlaps with an exam");
      }

      sortedAssignments
        .filter((item) => item.gradeWeight !== null && item.gradeWeight >= 10)
        .forEach((item) => reasons.push(`${item.title} carries ${item.gradeWeight}% of the grade`));

      if (reasons.length === 0) {
        reasons.push("Manageable workload based on detected deadlines");
      }

      const weekDate = new Date(`${weekStart}T12:00:00`);
      return {
        weekStart,
        weekEnd: toISODate(addDays(weekDate, 6)),
        assignments: sortedAssignments,
        score,
        level: getRiskLevel(score),
        reasons,
      };
    })
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export function buildPrepRecommendations(weeks: WeekRisk[]): PrepRecommendation[] {
  const riskyWeeks = new Set(
    weeks.filter((week) => week.level === "High" || week.level === "Critical").map((week) => week.weekStart),
  );

  return weeks
    .flatMap((week) =>
      week.assignments.map((assignment) => {
        const dueDate = new Date(`${assignment.date}T12:00:00`);
        let daysBefore = 3;
        let action = `Begin ${assignment.title} 3 days before it is due.`;

        if (["exam", "midterm", "final"].includes(assignment.type)) {
          daysBefore = 7;
          action = `Start reviewing for ${assignment.title} 7 days before the exam date.`;
        } else if (["project", "paper", "presentation", "simulation"].includes(assignment.type)) {
          daysBefore = 10;
          action = `Start planning ${assignment.title} 10 days before it is due.`;
        } else if (["reading", "discussion"].includes(assignment.type) && riskyWeeks.has(assignment.weekStart)) {
          daysBefore = 4;
          action = `Complete ${assignment.title} early because it lands in a high-risk week.`;
        }

        return {
          id: `prep-${assignment.id}`,
          assignmentId: assignment.id,
          courseName: assignment.courseName,
          courseColor: assignment.courseColor,
          assignmentTitle: assignment.title,
          assignmentDate: assignment.date,
          actionDate: toISODate(addDays(dueDate, -daysBefore)),
          action,
        };
      }),
    )
    .sort((a, b) => a.actionDate.localeCompare(b.actionDate));
}
