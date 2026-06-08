"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { combineCourseAnalyses } from "@/lib/analysis";
import { extractPdfText } from "@/lib/pdfText";
import { sampleCourseSyllabi } from "@/lib/sampleSyllabus";
import { parseSyllabus } from "@/lib/syllabusParser";
import { saveAnalysis } from "@/lib/storage";

const courseColors = ["#2F6F4E", "#2563EB", "#C64737", "#7C3AED", "#D97706", "#0891B2"];

type CourseDraft = {
  id: string;
  name: string;
  color: string;
  text: string;
  sourceType: "paste" | "pdf" | "sample";
  fileName?: string;
  isExtracting: boolean;
  error: string;
};

function createCourseDraft(index: number): CourseDraft {
  return {
    id: `course-${Date.now()}-${index}`,
    name: "",
    color: courseColors[index % courseColors.length],
    text: "",
    sourceType: "paste",
    isExtracting: false,
    error: "",
  };
}

export function SyllabusInputForm() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDraft[]>([createCourseDraft(0)]);
  const [semesterStart, setSemesterStart] = useState("");
  const [semesterEnd, setSemesterEnd] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateCourse(id: string, patch: Partial<CourseDraft>) {
    setCourses((current) => current.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function addCourse() {
    setCourses((current) => [...current, createCourseDraft(current.length)]);
    setError("");
  }

  function deleteCourse(id: string) {
    setCourses((current) => (current.length === 1 ? current : current.filter((course) => course.id !== id)));
  }

  function useSampleSyllabi() {
    setCourses(
      sampleCourseSyllabi.map((sample, index) => ({
        id: `sample-course-${index}`,
        name: sample.name,
        color: sample.color,
        text: sample.text,
        sourceType: "sample",
        isExtracting: false,
        error: "",
      })),
    );
    setSemesterStart("2026-01-12");
    setSemesterEnd("2026-05-08");
    setError("");
  }

  async function handlePdfUpload(course: CourseDraft, file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      updateCourse(course.id, { error: "Upload a PDF syllabus file." });
      return;
    }

    updateCourse(course.id, { isExtracting: true, error: "", fileName: file.name });

    try {
      const text = await extractPdfText(file);
      updateCourse(course.id, {
        text,
        sourceType: "pdf",
        fileName: file.name,
        isExtracting: false,
        error: text.trim() ? "" : "No readable text was found in this PDF.",
      });
    } catch {
      updateCourse(course.id, {
        isExtracting: false,
        error: "Could not read this PDF. Try copying the syllabus text instead.",
      });
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const readyCourses = courses.filter((course) => course.text.trim());
    if (readyCourses.length === 0) {
      setError("Add at least one syllabus by pasting text or uploading a PDF.");
      setIsSubmitting(false);
      return;
    }

    const analyses = readyCourses.map((course, index) =>
      parseSyllabus(course.text, {
        courseId: course.id,
        courseName: course.name || `Course ${index + 1}`,
        courseColor: course.color,
        semesterStart,
        semesterEnd,
        sourceType: course.sourceType,
        fileName: course.fileName,
      }),
    );

    const analysis = combineCourseAnalyses(analyses, semesterStart || null, semesterEnd || null);
    saveAnalysis(analysis);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div className="border-b border-ink/10 bg-ink px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Create your semester dashboard</h2>
            <p className="mt-1 text-sm text-white/70">Add every class you are taking. Paste text or upload PDFs.</p>
          </div>
          <button
            type="button"
            onClick={useSampleSyllabi}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-lemon"
          >
            <FileText size={17} aria-hidden="true" />
            Use Sample Semester
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-ink">Semester start</span>
            <input
              type="date"
              value={semesterStart}
              onChange={(event) => setSemesterStart(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Semester end</span>
            <input
              type="date"
              value={semesterEnd}
              onChange={(event) => setSemesterEnd(event.target.value)}
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
        </div>

        <div className="space-y-4">
          {courses.map((course, index) => (
            <section key={course.id} className="rounded-lg border border-ink/10 bg-paper p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <label className="mt-7">
                    <span className="sr-only">Course color</span>
                    <input
                      type="color"
                      value={course.color}
                      onChange={(event) => updateCourse(course.id, { color: event.target.value })}
                      className="h-9 w-9 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
                    />
                  </label>
                  <label className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-ink">Class {index + 1}</span>
                    <input
                      value={course.name}
                      onChange={(event) => updateCourse(course.id, { name: event.target.value, error: "" })}
                      placeholder="Biology 101"
                      className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-moss"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCourse(course.id)}
                  disabled={courses.length === 1}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-poppy/20 bg-white px-3 text-sm font-semibold text-poppy transition hover:bg-poppy hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[0.72fr_1fr]">
                <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-white p-4 text-center transition hover:border-moss">
                  {course.isExtracting ? (
                    <Loader2 className="animate-spin text-moss" size={26} aria-hidden="true" />
                  ) : (
                    <Upload className="text-moss" size={26} aria-hidden="true" />
                  )}
                  <span className="mt-3 text-sm font-semibold text-ink">
                    {course.isExtracting ? "Reading PDF..." : "Upload syllabus PDF"}
                  </span>
                  <span className="mt-1 max-w-xs text-xs leading-5 text-ink/50">
                    {course.fileName || "PDF text is extracted locally in your browser."}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(event) => void handlePdfUpload(course, event.target.files?.[0])}
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-ink">Syllabus text</span>
                  <textarea
                    value={course.text}
                    onChange={(event) =>
                      updateCourse(course.id, {
                        text: event.target.value,
                        sourceType: course.sourceType === "pdf" ? "pdf" : "paste",
                        error: "",
                      })
                    }
                    placeholder="Paste this class's schedule, assignment table, or deadline section here..."
                    rows={8}
                    className="mt-2 min-h-[150px] w-full resize-y rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-moss"
                  />
                </label>
              </div>
              {course.error ? <p className="mt-3 text-sm font-medium text-poppy">{course.error}</p> : null}
            </section>
          ))}
        </div>

        <button
          type="button"
          onClick={addCourse}
          className="inline-flex items-center gap-2 rounded-lg border border-moss/25 bg-mint px-4 py-2 text-sm font-semibold text-moss transition hover:bg-moss hover:text-white"
        >
          <Plus size={16} aria-hidden="true" />
          Add Another Class
        </button>

        {error ? <p className="text-sm font-medium text-poppy">{error}</p> : null}

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting || courses.some((course) => course.isExtracting)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <Sparkles size={17} aria-hidden="true" />
            Generate Semester Dashboard
          </button>
          <p className="text-sm text-ink/50">
            RiskWeeks combines every class into one risk map so cross-course pileups are visible.
          </p>
        </div>
      </div>
    </form>
  );
}
