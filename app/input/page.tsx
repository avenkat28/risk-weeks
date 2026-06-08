import { Header } from "@/components/Header";
import { SyllabusInputForm } from "@/components/SyllabusInputForm";
import { Lock, ScanLine, WandSparkles } from "lucide-react";

export default function InputPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">Syllabus Analyzer</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-5xl">
              Upload every syllabus. See the risky weeks before classes get loud.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-ink/60">
              RiskWeeks reads pasted text or PDF syllabi, detects assignment deadlines, and combines all your classes
              into one semester risk map.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: ScanLine, title: "Detect", text: "Dates, assignment types, and grade weights." },
              { icon: WandSparkles, title: "Score", text: "Clusters, exams, and major deliverables." },
              { icon: Lock, title: "Private", text: "No upload, no account, no external API." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint text-moss">
                  <item.icon size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-ink/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SyllabusInputForm />
      </main>
    </>
  );
}
