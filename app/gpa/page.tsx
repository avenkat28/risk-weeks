import { Calculator } from "lucide-react";
import { GpaCalculator } from "@/components/GpaCalculator";
import { Header } from "@/components/Header";

export default function GpaPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-mint text-moss">
            <Calculator size={22} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">GPA Calculator</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-5xl">
            Forecast how this semester changes your GPA.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-ink/60">
            Add your current GPA, completed credits, and expected grades for new courses. RiskWeeks calculates your
            projected cumulative GPA as you plan.
          </p>
        </div>
        <GpaCalculator />
      </main>
    </>
  );
}
