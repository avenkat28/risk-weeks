"use client";

import { Plus, RefreshCw, Trash2 } from "lucide-react";
import type { AssignmentItem, AssignmentType, CourseSyllabus } from "@/lib/types";
import { assignmentTypes } from "@/lib/types";

type AssignmentEditorProps = {
  assignments: AssignmentItem[];
  courses: CourseSyllabus[];
  onAssignmentsChange: (assignments: AssignmentItem[]) => void;
  onRecalculate: () => void;
};

type ValidationErrors = Record<string, string>;

function isValidDate(value: string) {
  if (!value) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateAssignments(assignments: AssignmentItem[]) {
  return assignments.reduce<ValidationErrors>((errors, assignment) => {
    if (!isValidDate(assignment.date)) {
      errors[assignment.id] = "Enter a valid due date.";
    }
    return errors;
  }, {});
}

function addOneHour(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${String((hour + 1) % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function createBlankAssignment(course: CourseSyllabus | undefined): AssignmentItem {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 10);
  const fallbackCourse = course ?? {
    id: "manual-course",
    name: "Manual Course",
    color: "#2F6F4E",
    sourceType: "paste" as const,
    assignmentCount: 0,
  };

  return {
    id: `manual-${Date.now()}`,
    courseId: fallbackCourse.id,
    courseName: fallbackCourse.name,
    courseColor: fallbackCourse.color,
    title: "New deadline",
    type: "homework",
    date: localDate,
    timeStatus: "all-day",
    startTime: null,
    endTime: null,
    weekStart: localDate,
    riskPoints: 0,
    gradeWeight: null,
    effortHours: 3,
    completed: false,
    sourceText: "Manually added deadline",
  };
}

export function AssignmentEditor({ assignments, courses, onAssignmentsChange, onRecalculate }: AssignmentEditorProps) {
  const errors = validateAssignments(assignments);
  const hasErrors = Object.keys(errors).length > 0;
  const courseLookup = new Map(courses.map((course) => [course.id, course]));

  function updateAssignment(id: string, patch: Partial<AssignmentItem>) {
    onAssignmentsChange(assignments.map((assignment) => (assignment.id === id ? { ...assignment, ...patch } : assignment)));
  }

  function deleteAssignment(id: string) {
    onAssignmentsChange(assignments.filter((assignment) => assignment.id !== id));
  }

  function addAssignment() {
    onAssignmentsChange([...assignments, createBlankAssignment(courses[0])]);
  }

  function updateCourse(assignment: AssignmentItem, courseId: string) {
    const course = courseLookup.get(courseId);
    updateAssignment(assignment.id, {
      courseId,
      courseName: course?.name ?? assignment.courseName,
      courseColor: course?.color ?? assignment.courseColor,
    });
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Review Extracted Deadlines</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Review your extracted deadlines. You can edit anything RiskWeeks got wrong.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addAssignment}
            className="inline-flex items-center gap-2 rounded-lg border border-moss/25 bg-mint px-4 py-2 text-sm font-semibold text-moss transition hover:bg-moss hover:text-white"
          >
            <Plus size={16} aria-hidden="true" />
            Add Assignment
          </button>
          <button
            type="button"
            onClick={onRecalculate}
            disabled={hasErrors}
            className="inline-flex items-center gap-2 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Recalculate Dashboard
          </button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-ink/20 bg-paper p-6 text-center">
          <p className="font-semibold text-ink">No assignments found yet.</p>
          <p className="mt-2 text-sm text-ink/60">Add a deadline manually to build a risk dashboard from scratch.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-lg border border-ink/10 bg-paper p-3">
              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.72fr_0.62fr_0.5fr_0.48fr_0.52fr_auto]">
                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Title</span>
                  <input
                    value={assignment.title}
                    onChange={(event) => updateAssignment(assignment.id, { title: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Course</span>
                  <select
                    value={assignment.courseId}
                    onChange={(event) => updateCourse(assignment, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Type</span>
                  <select
                    value={assignment.type}
                    onChange={(event) =>
                      updateAssignment(assignment.id, { type: event.target.value as AssignmentType })
                    }
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm capitalize outline-none transition focus:border-moss"
                  >
                    {assignmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Date</span>
                  <input
                    type="date"
                    value={assignment.date}
                    onChange={(event) => updateAssignment(assignment.id, { date: event.target.value })}
                    className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-moss ${
                      errors[assignment.id] ? "border-poppy" : "border-ink/15"
                    }`}
                  />
                  {errors[assignment.id] ? <p className="mt-1 text-xs font-medium text-poppy">{errors[assignment.id]}</p> : null}
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Weight</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={assignment.gradeWeight ?? ""}
                    placeholder="%"
                    onChange={(event) =>
                      updateAssignment(assignment.id, {
                        gradeWeight: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Time</span>
                  <input
                    type="time"
                    value={assignment.startTime ?? ""}
                    onChange={(event) =>
                      updateAssignment(assignment.id, {
                        timeStatus: event.target.value ? "timed" : "all-day",
                        startTime: event.target.value || null,
                        endTime: event.target.value ? addOneHour(event.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold uppercase text-ink/50">Effort</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min="0.5"
                      max="100"
                      step="0.5"
                      value={assignment.effortHours}
                      onChange={(event) => updateAssignment(assignment.id, { effortHours: Number(event.target.value) })}
                      className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 pr-7 text-sm outline-none transition focus:border-moss"
                    />
                    <span className="absolute right-2 top-2 text-sm text-ink/40">h</span>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => deleteAssignment(assignment.id)}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-poppy/20 bg-white px-3 text-poppy transition hover:bg-poppy hover:text-white lg:mt-[18px]"
                  aria-label={`Delete ${assignment.title}`}
                  title="Delete assignment"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-ink/50">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: assignment.courseColor }}
                  aria-hidden="true"
                />
                {assignment.courseName}
                <span>·</span>
                <span>{assignment.startTime ? `Scheduled ${assignment.startTime}` : "All-day if time is TBD"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasErrors ? <p className="mt-3 text-sm font-medium text-poppy">Fix invalid dates before recalculating.</p> : null}
    </section>
  );
}
