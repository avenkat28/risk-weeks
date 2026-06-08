import Link from "next/link";
import { ArrowRight, Calculator, CalendarCheck, ClipboardList, Eye, FileText, Gauge, Route } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section className="border-y border-ink/10 bg-white/75">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">Why it matters</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">The syllabus problem is a timing problem.</h2>
              <p className="mt-4 leading-7 text-ink/70">
                Most students read the first page, note the grading scale, and move on. The real risk hides in the
                schedule: two quizzes near a paper, a project milestone beside an exam, or a weighted final deliverable
                appearing after a quiet month.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">What changes</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">RiskWeeks turns dates into decisions.</h2>
              <p className="mt-4 leading-7 text-ink/70">
                Paste the syllabus text and get a semester dashboard: extracted deadlines, weekly risk scores, danger
                week explanations, grade impact, and prep actions timed before the crunch begins.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">From syllabus pile to weekly plan.</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["01", "Add each class", "Paste text or upload syllabus PDFs."],
              ["02", "Extract deadlines", "RiskWeeks detects dates, work types, and weights per course."],
              ["03", "See danger weeks", "Clusters and major assessments rise to the top."],
              ["04", "Plan before the pileup", "Prep actions give hard weeks a runway."],
            ].map(([step, title, text]) => (
              <article key={step} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold text-moss">{step}</p>
                <h3 className="mt-3 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">Core tools</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">A cleaner way to read the semester.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <FeatureCard
              icon={ClipboardList}
              title="Extract deadlines"
              description="Detect dates, assignment types, titles, and grade weights from pasted syllabus text."
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Identify risk weeks"
              description="Group coursework by week and flag clusters, exams, major projects, and high-weight items."
            />
            <FeatureCard
              icon={Route}
              title="Plan ahead"
              description="Generate review and planning dates so the hardest weeks get attention before they arrive."
            />
            <FeatureCard
              icon={Calculator}
              title="Forecast GPA"
              description="Add current GPA, credits, and expected grades to estimate your cumulative GPA."
            />
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white/70">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1fr]">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">Dashboard preview</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Understand the semester in 10 seconds.</h2>
              <p className="mt-4 leading-7 text-ink/60">
                RiskWeeks found 36 deadlines across 3 classes. The command center highlights cross-course collisions,
                early prep actions, and the assignments that matter most to your grade.
              </p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: FileText, label: "Deadlines", value: "18" },
                  { icon: Gauge, label: "Risk weeks", value: "3" },
                  { icon: Eye, label: "Grade-critical", value: "6" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-paper p-4">
                    <item.icon className="text-moss" size={18} aria-hidden="true" />
                    <p className="mt-3 text-2xl font-bold text-ink">{item.value}</p>
                    <p className="text-xs font-semibold uppercase text-ink/50">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Critical", "Apr 12 - Apr 18", "Paper, presentation, and final exam overlap."],
                  ["High", "Feb 9 - Feb 15", "Midterm plus a 10% paper proposal."],
                  ["Medium", "Mar 16 - Mar 22", "Project milestone with lab work."],
                ].map(([level, range, reason]) => (
                  <div key={range} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3">
                    <div>
                      <p className="font-semibold text-ink">{range}</p>
                      <p className="text-sm text-ink/50">{reason}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${level === "Critical" ? "bg-poppy text-white" : level === "High" ? "bg-coral/20 text-poppy" : "bg-lemon/40 text-amber-800"}`}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-lg bg-ink px-5 py-10 text-center text-white shadow-soft sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-mint">Ready before week one</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold">Turn your syllabus into a semester command center.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70">
              Upload or paste each syllabus, review the extracted deadlines, and see where your attention should go first.
            </p>
            <Link
              href="/input"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-lemon px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"
            >
              Analyze a Syllabus
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
