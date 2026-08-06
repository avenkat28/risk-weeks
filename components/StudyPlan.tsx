import { BookOpen, ChevronDown, Clock3 } from "lucide-react";
import { addDays, formatDisplayDate, toISODate } from "@/lib/dateUtils";
import type { AssignmentItem, PersonalCommitment } from "@/lib/types";

function studyAction(assignment: AssignmentItem) {
  const actions: Partial<Record<AssignmentItem["type"], string>> = {
    reading: "Read the assigned material and write a short summary of the key ideas.",
    discussion: "Review the prompt, draft your response, and note one point to discuss.",
    homework: "Work through the assigned problems, then check and revise your answers.",
    lab: "Review the procedure, prepare your materials, and complete the lab work.",
    quiz: "Review your notes and practice the topics most likely to appear on the quiz.",
    paper: "Draft or revise the next section, then check it against the rubric.",
    project: "Complete the next project milestone and record any remaining blockers.",
    simulation: "Review the scenario, prepare your decisions, and complete the next stage.",
    presentation: "Build or revise your slides, then rehearse the presentation aloud.",
    exam: "Review one topic group and complete practice questions without notes.",
    midterm: "Review one topic group and complete practice questions without notes.",
    final: "Review one topic group and complete practice questions without notes.",
  };
  return actions[assignment.type] ?? "Make measurable progress and note the next step before stopping.";
}

export function StudyPlan({ assignments, commitments }: { assignments: AssignmentItem[]; commitments: PersonalCommitment[] }) {
  const sessions = assignments.filter(a => !a.completed).flatMap(a => {
    const count = Math.max(1, Math.ceil(a.effortHours / 2));
    return Array.from({length: count}, (_, index) => {
      let date = toISODate(addDays(new Date(`${a.date}T12:00:00`), -(count - index)));
      let moves = 0;
      while (commitments.some(c => c.date === date) && moves < 3) {
        date = toISODate(addDays(new Date(`${date}T12:00:00`), -1));
        moves++;
      }
      return { id: `${a.id}-${index}`, date, hours: Math.min(2, Math.max(.5, a.effortHours - index * 2)), assignment: a, part: index + 1, count };
    });
  }).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12);
  const total = assignments.filter(a=>!a.completed).reduce((sum,a)=>sum+a.effortHours,0);

  return <section className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-mint">Personalized weekly study plan</p><h2 className="mt-1 text-2xl font-bold">What to work on next</h2><p className="mt-1 text-sm text-white/60">Open a session to see exactly what needs to be done. Days with commitments are avoided when possible.</p></div><div className="rounded-lg bg-white/10 px-4 py-2 text-center"><p className="text-2xl font-bold">{total}h</p><p className="text-xs text-white/60">remaining</p></div></div>
    <div className="mt-5 space-y-2">{sessions.length ? sessions.map((session, index)=><details key={session.id} className="group rounded-lg bg-white/10 open:bg-white/15" open={index === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 marker:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-moss"><BookOpen size={18}/></span>
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{session.assignment.title}</p><p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-white/60"><Clock3 size={12}/>{formatDisplayDate(session.date)} · {session.hours}h · {session.assignment.courseName}</p></div>
        <ChevronDown className="shrink-0 text-white/50 transition group-open:rotate-180" size={18}/>
      </summary>
      <div className="border-t border-white/10 px-4 py-3 text-sm leading-6 text-white/80"><p className="font-semibold text-mint">What needs to be done</p><p className="mt-1">{studyAction(session.assignment)}</p>{session.count > 1 ? <p className="mt-2 text-xs text-white/50">Session {session.part} of {session.count} · Due {formatDisplayDate(session.assignment.date)}</p> : <p className="mt-2 text-xs text-white/50">Due {formatDisplayDate(session.assignment.date)}</p>}</div>
    </details>) : <p className="text-sm text-white/60">You’re all caught up. Completed assignments won’t appear here.</p>}</div>
  </section>;
}
