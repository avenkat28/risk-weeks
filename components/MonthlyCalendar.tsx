"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AssignmentItem, PersonalCommitment } from "@/lib/types";

export function MonthlyCalendar({ assignments, commitments }: { assignments: AssignmentItem[]; commitments: PersonalCommitment[] }) {
  const firstRelevant = assignments[0]?.date || commitments[0]?.date;
  const [month, setMonth] = useState(() => firstRelevant ? new Date(`${firstRelevant}T12:00:00`) : new Date());
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    return Array.from({length: 42}, (_,i)=>new Date(month.getFullYear(), month.getMonth(), i - mondayOffset + 1));
  }, [month]);
  const dateKey = (date: Date) => {
    const shifted = new Date(date.getTime() - date.getTimezoneOffset()*60000);
    return shifted.toISOString().slice(0,10);
  };
  return <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-ink">Monthly calendar</h2><p className="mt-1 text-sm text-ink/60">Assignments and life commitments in one view.</p></div><div className="flex items-center gap-1"><button aria-label="Previous month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="rounded-lg p-2 hover:bg-paper"><ChevronLeft/></button><span className="min-w-36 text-center font-bold">{month.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</span><button aria-label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="rounded-lg p-2 hover:bg-paper"><ChevronRight/></button></div></div>
    <div className="mt-5 grid grid-cols-7 border-l border-t border-ink/10">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="border-b border-r border-ink/10 bg-paper p-2 text-center text-xs font-bold text-ink/50">{d}</div>)}
      {cells.map((date,i)=>{const key=dateKey(date); const due=assignments.filter(a=>a.date===key); const busy=commitments.filter(c=>c.date===key); return <div key={i} className={`min-h-24 border-b border-r border-ink/10 p-1.5 ${date.getMonth()!==month.getMonth()?"bg-paper/50 text-ink/30":""}`}><p className="text-xs font-semibold">{date.getDate()}</p><div className="mt-1 space-y-1">{due.slice(0,2).map(a=><div key={a.id} title={a.title} className={`truncate rounded px-1.5 py-1 text-[10px] font-semibold text-white ${a.completed?"opacity-40 line-through":""}`} style={{backgroundColor:a.courseColor}}>{a.title}</div>)}{busy.slice(0,2).map(c=><div key={c.id} title={c.title} className="truncate rounded bg-lemon px-1.5 py-1 text-[10px] font-semibold text-ink">{c.title}</div>)}{due.length+busy.length>4?<p className="text-[10px] text-ink/50">+{due.length+busy.length-4} more</p>:null}</div></div>})}
    </div><div className="mt-3 flex gap-4 text-xs text-ink/50"><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-moss"/>Assignment</span><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-lemon"/>Personal commitment</span></div>
  </section>;
}
