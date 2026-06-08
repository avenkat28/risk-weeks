"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertOctagon, CalendarDays, Gauge, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import { AssignmentEditor } from "@/components/AssignmentEditor";
import { AssignmentSchedule } from "@/components/AssignmentSchedule";
import { DangerWeekCard } from "@/components/DangerWeekCard";
import { EmptyState } from "@/components/EmptyState";
import { GradeImpactTable } from "@/components/GradeImpactTable";
import { Header } from "@/components/Header";
import { PrepPlan } from "@/components/PrepPlan";
import { SummaryCard } from "@/components/SummaryCard";
import { WeekRiskCard } from "@/components/WeekRiskCard";
import { rebuildAnalysis } from "@/lib/analysis";
import { formatWeekRange } from "@/lib/dateUtils";
import { loadAnalysis, saveAnalysis } from "@/lib/storage";
import type { AssignmentItem, SyllabusAnalysis } from "@/lib/types";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<SyllabusAnalysis | null>(null);
  const [draftAssignments, setDraftAssignments] = useState<AssignmentItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedAnalysis = loadAnalysis();
    setAnalysis(savedAnalysis);
    setDraftAssignments(savedAnalysis?.assignments ?? []);
    setLoaded(true);
  }, []);

  const topWeeks = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.weeks].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [analysis]);

  if (!loaded) return null;

  if (!analysis) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <EmptyState
            title="Your semester command center is waiting"
            message="Analyze a syllabus first. RiskWeeks will save your dashboard in this browser so you can review it later."
            icon={Gauge}
            action={
              <Link className="inline-flex rounded-lg bg-moss px-5 py-3 text-sm font-semibold text-white" href="/input">
                Analyze a Syllabus
              </Link>
            }
          />
        </main>
      </>
    );
  }

  const highRiskWeeks = analysis.weeks.filter((week) => week.level === "High").length;
  const criticalWeeks = analysis.weeks.filter((week) => week.level === "Critical").length;
  const dangerWeekCount = highRiskWeeks + criticalWeeks;
  const highestWeek = topWeeks[0];
  const highOrCriticalWeeks = topWeeks.filter((week) => week.level === "High" || week.level === "Critical");

  function handleRecalculate() {
    if (!analysis) return;
    const nextAnalysis = rebuildAnalysis(analysis, draftAssignments);
    setAnalysis(nextAnalysis);
    setDraftAssignments(nextAnalysis.assignments);
    saveAnalysis(nextAnalysis);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-soft">
          <div className="grid gap-6 p-5 text-white sm:p-7 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-mint">Semester Command Center</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{analysis.courseName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                RiskWeeks found {analysis.assignments.length} deadlines across {analysis.weeks.length} weeks. Review
                the extracted deadlines, then use the map to prep before the pileup.
              </p>
            </div>
            <div className="flex items-start gap-3 lg:justify-end">
              <div className="rounded-lg bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-white/60">Danger weeks</p>
                <p className="mt-1 text-3xl font-bold">{dangerWeekCount}</p>
              </div>
              <Link
                className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-lemon"
                href="/input"
              >
                Analyze Another
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={ListChecks} label="Total Deadlines" value={analysis.assignments.length} />
          <SummaryCard icon={Gauge} label="High-Risk Weeks" value={highRiskWeeks} tone="danger" />
          <SummaryCard icon={AlertOctagon} label="Critical Weeks" value={criticalWeeks} tone="critical" />
          <SummaryCard
            icon={CalendarDays}
            label="Highest-Risk Week"
            value={highestWeek ? highestWeek.score : 0}
            detail={highestWeek ? formatWeekRange(highestWeek.weekStart, highestWeek.weekEnd) : "No weeks found"}
          />
        </section>

        <section className="mt-7 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Classes in this dashboard</h2>
              <p className="mt-1 text-sm text-ink/60">RiskWeeks is combining these syllabi into one semester view.</p>
            </div>
            <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss">
              {analysis.courses.length} class{analysis.courses.length === 1 ? "" : "es"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.courses.map((course) => (
              <span
                key={course.id}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-2 text-sm font-semibold text-ink/70"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: course.color }} aria-hidden="true" />
                {course.name}
                <span className="font-medium text-ink/45">{course.assignmentCount} deadlines</span>
              </span>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <AssignmentEditor
            assignments={draftAssignments}
            courses={analysis.courses}
            onAssignmentsChange={setDraftAssignments}
            onRecalculate={handleRecalculate}
          />
        </div>

        {analysis.assignments.length > 0 ? (
          <div className="mt-8">
            <AssignmentSchedule assignments={analysis.assignments} />
          </div>
        ) : null}

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">Your semester at a glance</h2>
              <p className="mt-1 text-sm text-ink/60">Scan weekly workload, risk level, and the deadlines inside each week.</p>
            </div>
          </div>
          {analysis.weeks.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {analysis.weeks.map((week) => (
                <WeekRiskCard key={week.weekStart} week={week} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assignments found"
              message="RiskWeeks needs dated lines to build the map. Try schedule text with formats like 2/15, February 15, Due: March 3, or Exam: April 20."
              icon={CalendarDays}
            />
          )}
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-ink">Danger weeks</h2>
              <p className="mt-1 text-sm text-ink/60">The top weeks to protect on your calendar.</p>
            </div>
            {highOrCriticalWeeks.length > 0 ? (
              <div className="space-y-4">
                {highOrCriticalWeeks.map((week, index) => (
                  <DangerWeekCard key={week.weekStart} week={week} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No high-risk weeks found"
                message="Nice. RiskWeeks did not detect a High or Critical week yet. Add missing deadlines or grade weights if the syllabus left anything out."
                icon={ShieldCheck}
              />
            )}
          </div>
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-ink">Prep before the pileup</h2>
              <p className="mt-1 text-sm text-ink/60">Suggested start dates based on assignment type and risk.</p>
            </div>
            {analysis.recommendations.length > 0 ? (
              <PrepPlan recommendations={analysis.recommendations} />
            ) : (
              <EmptyState
                title="No prep plan yet"
                message="Prep actions appear after RiskWeeks detects dated assignments."
                icon={Sparkles}
              />
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-ink">Grade-critical deadlines</h2>
            <p className="mt-1 text-sm text-ink/60">Weighted work sorted by the assignments that move your grade most.</p>
          </div>
          <GradeImpactTable assignments={analysis.assignments} />
        </section>
      </main>
    </>
  );
}
