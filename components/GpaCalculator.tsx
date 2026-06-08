"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type PlannedCourse = {
  id: string;
  name: string;
  credits: string;
  grade: string;
};

const gpaStorageKey = "riskweeks.gpa.v1";

const gradePoints: Record<string, number> = {
  "A": 4,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1,
  "D-": 0.7,
  "F": 0,
};

function createCourse(index: number): PlannedCourse {
  return {
    id: `planned-${Date.now()}-${index}`,
    name: "",
    credits: "4",
    grade: "A",
  };
}

function clampGpa(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(4, Math.max(0, value));
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function GpaCalculator() {
  const [currentGpa, setCurrentGpa] = useState("3.50");
  const [completedCredits, setCompletedCredits] = useState("32");
  const [courses, setCourses] = useState<PlannedCourse[]>([createCourse(0)]);

  useEffect(() => {
    const saved = window.localStorage.getItem(gpaStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        currentGpa?: string;
        completedCredits?: string;
        courses?: PlannedCourse[];
      };
      setCurrentGpa(parsed.currentGpa ?? "3.50");
      setCompletedCredits(parsed.completedCredits ?? "32");
      setCourses(parsed.courses?.length ? parsed.courses : [createCourse(0)]);
    } catch {
      // Ignore invalid saved calculator state.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(gpaStorageKey, JSON.stringify({ currentGpa, completedCredits, courses }));
  }, [currentGpa, completedCredits, courses]);

  const projection = useMemo(() => {
    const existingCredits = Math.max(0, parseNumber(completedCredits));
    const existingPoints = clampGpa(parseNumber(currentGpa)) * existingCredits;
    const planned = courses.map((course) => {
      const credits = Math.max(0, parseNumber(course.credits));
      const points = gradePoints[course.grade] ?? 0;
      return { ...course, credits, points, qualityPoints: credits * points };
    });
    const plannedCredits = planned.reduce((sum, course) => sum + course.credits, 0);
    const plannedPoints = planned.reduce((sum, course) => sum + course.qualityPoints, 0);
    const totalCredits = existingCredits + plannedCredits;
    const projectedGpa = totalCredits > 0 ? (existingPoints + plannedPoints) / totalCredits : 0;
    const termGpa = plannedCredits > 0 ? plannedPoints / plannedCredits : 0;

    return {
      existingCredits,
      plannedCredits,
      totalCredits,
      projectedGpa,
      termGpa,
    };
  }, [completedCredits, courses, currentGpa]);

  function updateCourse(id: string, patch: Partial<PlannedCourse>) {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function addCourse() {
    setCourses((current) => [...current, createCourse(current.length)]);
  }

  function deleteCourse(id: string) {
    setCourses((current) => (current.length === 1 ? current : current.filter((course) => course.id !== id)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1fr]">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Current GPA</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Enter your current cumulative GPA and completed credits, then add the courses you are planning or currently
          taking.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <label>
            <span className="text-sm font-semibold text-ink">Current GPA</span>
            <input
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={currentGpa}
              onChange={(event) => setCurrentGpa(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Completed credits</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={completedCredits}
              onChange={(event) => setCompletedCredits(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
        </div>

        <div className="mt-6 rounded-lg bg-ink p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-mint">Projected cumulative GPA</p>
          <p className="mt-2 text-5xl font-bold">{projection.projectedGpa.toFixed(2)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-white/60">Term GPA</p>
              <p className="mt-1 text-xl font-bold">{projection.termGpa.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-white/60">Total credits</p>
              <p className="mt-1 text-xl font-bold">{projection.totalCredits.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">New courses</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              Add credits and expected grades to see how this semester could move your cumulative GPA.
            </p>
          </div>
          <button
            type="button"
            onClick={addCourse}
            className="inline-flex items-center gap-2 rounded-lg border border-moss/25 bg-mint px-4 py-2 text-sm font-semibold text-moss transition hover:bg-moss hover:text-white"
          >
            <Plus size={16} aria-hidden="true" />
            Add Course
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {courses.map((course, index) => (
            <div key={course.id} className="grid gap-3 rounded-lg bg-paper p-3 md:grid-cols-[1fr_0.45fr_0.45fr_auto]">
              <label>
                <span className="text-xs font-semibold uppercase text-ink/50">Course</span>
                <input
                  value={course.name}
                  onChange={(event) => updateCourse(course.id, { name: event.target.value })}
                  placeholder={`Course ${index + 1}`}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-ink/50">Credits</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={course.credits}
                  onChange={(event) => updateCourse(course.id, { credits: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase text-ink/50">Grade</span>
                <select
                  value={course.grade}
                  onChange={(event) => updateCourse(course.id, { grade: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-moss"
                >
                  {Object.keys(gradePoints).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => deleteCourse(course.id)}
                disabled={courses.length === 1}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-poppy/20 bg-white px-3 text-poppy transition hover:bg-poppy hover:text-white disabled:cursor-not-allowed disabled:opacity-40 md:mt-[18px]"
                aria-label={`Delete ${course.name || `Course ${index + 1}`}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-mint p-4">
            <p className="text-xs font-bold uppercase text-moss">Current credits</p>
            <p className="mt-2 text-2xl font-bold text-ink">{projection.existingCredits.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-lemon/40 p-4">
            <p className="text-xs font-bold uppercase text-amber-800">New credits</p>
            <p className="mt-2 text-2xl font-bold text-ink">{projection.plannedCredits.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-coral/15 p-4">
            <p className="text-xs font-bold uppercase text-poppy">GPA change</p>
            <p className="mt-2 text-2xl font-bold text-ink">
              {(projection.projectedGpa - clampGpa(parseNumber(currentGpa))).toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
