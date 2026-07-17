import { BookOpen, Clock3 } from "lucide-react";
import { addDays, formatDisplayDate, toISODate } from "@/lib/dateUtils";
import type { AssignmentItem, PersonalCommitment } from "@/lib/types";

export function StudyPlan({ assignments, commitments }: { assignments: AssignmentItem[]; commitments: PersonalCommitment[] }) {
  const sessions = assignments.filter(a => !a.completed).flatMap(a => {
    const count = Math.max(1, Math.ceil(a.effortHours / 2));
    return Array.from({length: count}, (_, index) => {
      let date = toISODate(addDays(new Date(`${a.date}T12:00:00`), -(count - index)));
      let moves = 0;
      while (commitments.some(c => c.date === date) && moves < 3) { date = toISODate(addDays(new Date(`${date}T12:00:00`), -1)); moves++; }
      return { id: `${a.id}-${index}`, date, hours: Math.min(2, Math.max(.5, a.effortHours - index * 2)), assignment: a };
    });
  }).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12);
  const total = assignments.filter(a=>!a.completed).reduce((sum,a)=>sum+a.effortHours,0);
  return <section className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-mint">Personalized weekly study plan</p><h2 className="mt-1 text-2xl font-bold">Your next study sessions</h2><p className="mt-1 text-sm text-white/60">Built from due dates and effort estimates, avoiding days with commitments when possible.</p></div><div className="rounded-lg bg-white/10 px-4 py-2 text-center"><p className="text-2xl font-bold">{total}h</p><p className="text-xs text-white/60">remaining</p></div></div>
    <div className="mt-5 grid gap-2 md:grid-cols-2">{sessions.length ? sessions.map(s=><article key={s.id} className="flex items-center gap-3 rounded-lg bg-white/10 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-moss"><BookOpen size={18}/></span><div className="min-w-0"><p className="truncate font-semibold">{s.assignment.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-white/60"><Clock3 size={12}/>{formatDisplayDate(s.date)} · {s.hours}h · {s.assignment.courseName}</p></div></article>) : <p className="text-sm text-white/60">You’re all caught up. Completed assignments won’t appear here.</p>}</div>
  </section>;
}
