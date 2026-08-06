import { BookOpen, CalendarDays, ChevronDown, Clock3, Users } from "lucide-react";
import { addDays, formatDisplayDate, formatWeekRange, getWeekStart, toISODate } from "@/lib/dateUtils";
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

function weekKey(date: string) {
  return toISODate(getWeekStart(new Date(`${date}T12:00:00`)));
}

export function StudyPlan({ assignments, commitments }: { assignments: AssignmentItem[]; commitments: PersonalCommitment[] }) {
  const remainingAssignments = assignments.filter((assignment) => !assignment.completed);
  const sessions = remainingAssignments.flatMap((assignment) => {
    const count = Math.max(1, Math.ceil(assignment.effortHours / 2));
    return Array.from({ length: count }, (_, index) => {
      let date = toISODate(addDays(new Date(`${assignment.date}T12:00:00`), -(count - index)));
      let moves = 0;
      while (commitments.some((commitment) => commitment.date === date) && moves < 3) {
        date = toISODate(addDays(new Date(`${date}T12:00:00`), -1));
        moves++;
      }
      return {
        id: `${assignment.id}-${index}`,
        date,
        hours: Math.min(2, Math.max(.5, assignment.effortHours - index * 2)),
        assignment,
        part: index + 1,
        count,
      };
    });
  });

  const allWeekKeys = new Set([
    ...remainingAssignments.map((assignment) => weekKey(assignment.date)),
    ...sessions.map((session) => weekKey(session.date)),
    ...commitments.map((commitment) => weekKey(commitment.date)),
  ]);
  const weeks = [...allWeekKeys].sort().map((start) => ({
    start,
    end: toISODate(addDays(new Date(`${start}T12:00:00`), 6)),
    deadlines: remainingAssignments.filter((assignment) => weekKey(assignment.date) === start).sort((a, b) => a.date.localeCompare(b.date)),
    sessions: sessions.filter((session) => weekKey(session.date) === start).sort((a, b) => a.date.localeCompare(b.date)),
    commitments: commitments.filter((commitment) => weekKey(commitment.date) === start).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
  }));
  const total = remainingAssignments.reduce((sum, assignment) => sum + assignment.effortHours, 0);

  return <section className="rounded-lg border border-ink/10 bg-ink p-5 text-white shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wide text-mint">Personalized weekly study plan</p><h2 className="mt-1 text-2xl font-bold">What to work on each week</h2><p className="mt-1 text-sm text-white/60">Open a week to see its deadlines, commitments, and specific study tasks.</p></div>
      <div className="rounded-lg bg-white/10 px-4 py-2 text-center"><p className="text-2xl font-bold">{total}h</p><p className="text-xs text-white/60">remaining</p></div>
    </div>

    <div className="mt-5 space-y-3">{weeks.length ? weeks.map((week, index) => <details key={week.start} className="group overflow-hidden rounded-lg bg-white/10 open:bg-white/15" open={index === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint font-bold text-moss">{index + 1}</span>
        <div className="min-w-0 flex-1"><p className="font-bold">Week {index + 1}</p><p className="mt-1 text-xs text-white/60">{formatWeekRange(week.start, week.end)} · {week.deadlines.length} deadline{week.deadlines.length === 1 ? "" : "s"} · {week.sessions.length} study session{week.sessions.length === 1 ? "" : "s"}</p></div>
        <ChevronDown className="shrink-0 text-white/50 transition group-open:rotate-180" size={19}/>
      </summary>

      <div className="space-y-5 border-t border-white/10 p-4">
        {week.deadlines.length ? <div><h3 className="flex items-center gap-2 text-sm font-bold text-mint"><CalendarDays size={15}/>Assignments due</h3><div className="mt-2 grid gap-2 md:grid-cols-2">{week.deadlines.map((assignment) => <article key={assignment.id} className="rounded-lg bg-white/10 p-3"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{assignment.title}</p><span className="rounded-full bg-white/10 px-2 py-1 text-[11px] capitalize text-white/70">{assignment.type}</span></div><p className="mt-2 text-xs text-white/60">{formatDisplayDate(assignment.date)}{assignment.startTime ? ` · ${assignment.startTime}` : " · All-day"} · {assignment.courseName}</p></article>)}</div></div> : null}

        {week.sessions.length ? <div><h3 className="flex items-center gap-2 text-sm font-bold text-mint"><BookOpen size={15}/>Studying to do</h3><div className="mt-2 space-y-2">{week.sessions.map((session) => <article key={session.id} className="rounded-lg bg-white/10 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{session.assignment.title}</p><span className="flex items-center gap-1 text-xs font-semibold text-white/70"><Clock3 size={13}/>{session.hours}h on {formatDisplayDate(session.date)}</span></div><p className="mt-2 text-sm leading-6 text-white/75">{studyAction(session.assignment)}</p><p className="mt-1 text-xs text-white/45">Session {session.part} of {session.count} · Due {formatDisplayDate(session.assignment.date)}</p></article>)}</div></div> : null}

        {week.commitments.length ? <div><h3 className="flex items-center gap-2 text-sm font-bold text-lemon"><Users size={15}/>Personal commitments</h3><div className="mt-2 flex flex-wrap gap-2">{week.commitments.map((commitment) => <span key={commitment.id} className="rounded-lg bg-lemon px-3 py-2 text-xs font-semibold text-ink">{formatDisplayDate(commitment.date)} · {commitment.startTime}–{commitment.endTime} · {commitment.title}</span>)}</div></div> : null}
      </div>
    </details>) : <p className="text-sm text-white/60">You’re all caught up. Completed assignments won’t appear here.</p>}</div>
  </section>;
}
