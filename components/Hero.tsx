import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Gauge, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:py-20">
      <div className="flex flex-col justify-center">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-moss/20 bg-white px-3 py-1.5 text-xs font-semibold text-moss shadow-sm">
          <Sparkles size={14} aria-hidden="true" />
          Semester planning from all your syllabi
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
          RiskWeeks shows the weeks that can wreck your semester.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
          Find your semester&apos;s danger weeks before they happen. Paste or upload your syllabi and get one dashboard for
          cross-class deadline clusters, grade-critical work, and prep actions.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/input"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-moss px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ink"
          >
            Analyze a Syllabus Free
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <span className="text-sm font-medium text-ink/50">No account. PDFs are read locally in your browser.</span>
        </div>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {["Deadlines", "Danger weeks", "Prep plan"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-semibold text-ink/70">
              <CheckCircle2 className="text-moss" size={17} aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 bg-ink px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-mint">Semester Command Center</p>
          <p className="mt-1 text-lg font-bold">Your semester at a glance</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-ink/10 bg-paper p-4">
          {[
            ["18", "deadlines"],
            ["3", "danger weeks"],
            ["65%", "weighted"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-white p-3">
              <p className="text-xl font-bold text-ink">{value}</p>
              <p className="text-[11px] font-semibold uppercase text-ink/50">{label}</p>
            </div>
          ))}
        </div>
        <div className="p-5">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <p className="text-sm font-semibold text-ink">Example danger week</p>
            <p className="text-xs text-ink/50">April 12 - April 18</p>
          </div>
          <span className="rounded-full bg-poppy px-3 py-1 text-xs font-semibold text-white">Critical</span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {[3, 6, 4, 9, 7, 2, 1].map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-moss"
                style={{
                  height: `${28 + value * 8}px`,
                  backgroundColor: value > 7 ? "#C64737" : value > 5 ? "#EC7063" : value > 3 ? "#F7D56B" : "#DFF5E8",
                }}
              />
              <span className="text-[10px] font-medium text-ink/50">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {[
            { icon: CalendarDays, label: "Research paper", detail: "25% of grade" },
            { icon: Gauge, label: "Final presentation", detail: "15% of grade" },
            { icon: Clock, label: "Final exam", detail: "Review starts 7 days before" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-paper p-3">
              <item.icon className="text-moss" size={18} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-ink/50">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
