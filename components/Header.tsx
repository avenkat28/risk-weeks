import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-moss text-white">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <span>RiskWeeks</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-ink/70">
          <Link className="hover:text-ink" href="/input">
            Analyze
          </Link>
          <Link className="hover:text-ink" href="/dashboard">
            Dashboard
          </Link>
          <Link className="hover:text-ink" href="/gpa">
            GPA
          </Link>
        </nav>
      </div>
    </header>
  );
}
