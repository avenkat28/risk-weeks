export type AssignmentType =
  | "reading"
  | "discussion"
  | "homework"
  | "lab"
  | "quiz"
  | "paper"
  | "project"
  | "simulation"
  | "presentation"
  | "exam"
  | "midterm"
  | "final"
  | "other";

export const assignmentTypes: AssignmentType[] = [
  "reading",
  "discussion",
  "homework",
  "lab",
  "quiz",
  "paper",
  "project",
  "simulation",
  "presentation",
  "exam",
  "midterm",
  "final",
  "other",
];

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AssignmentItem = {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  type: AssignmentType;
  date: string;
  timeStatus: "all-day" | "timed" | "tbd";
  startTime: string | null;
  endTime: string | null;
  weekStart: string;
  riskPoints: number;
  gradeWeight: number | null;
  sourceText: string;
};

export type CourseSyllabus = {
  id: string;
  name: string;
  color: string;
  sourceType: "paste" | "pdf" | "sample";
  fileName?: string;
  assignmentCount: number;
};

export type WeekRisk = {
  weekStart: string;
  weekEnd: string;
  assignments: AssignmentItem[];
  score: number;
  level: RiskLevel;
  reasons: string[];
};

export type PrepRecommendation = {
  id: string;
  assignmentId: string;
  courseName: string;
  courseColor: string;
  assignmentTitle: string;
  assignmentDate: string;
  actionDate: string;
  action: string;
};

export type SyllabusAnalysis = {
  courseName: string;
  courses: CourseSyllabus[];
  generatedAt: string;
  semesterStart: string | null;
  semesterEnd: string | null;
  assignments: AssignmentItem[];
  weeks: WeekRisk[];
  recommendations: PrepRecommendation[];
};
