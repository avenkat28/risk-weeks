"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CommitmentType, PersonalCommitment } from "@/lib/types";

const types: CommitmentType[] = ["appointment", "work", "club", "interview", "trip", "party", "other"];

export function CommitmentManager({ commitments, onChange }: { commitments: PersonalCommitment[]; onChange: (items: PersonalCommitment[]) => void }) {
  function add() {
    const today = new Date();
    const date = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    onChange([...commitments, { id: `commitment-${Date.now()}`, title: "New commitment", type: "appointment", date, startTime: "09:00", endTime: "10:00" }]);
  }
  function update(id: string, patch: Partial<PersonalCommitment>) {
    onChange(commitments.map((item) => item.id === id ? { ...item, ...patch } : item));
  }
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-ink">Personal commitments</h2><p className="mt-1 text-sm text-ink/60">Block out time the study plan should work around.</p></div>
        <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/>Add commitment</button>
      </div>
      {commitments.length === 0 ? <p className="mt-5 rounded-lg bg-paper p-5 text-sm text-ink/60">No commitments yet. Add work, appointments, trips, or anything else competing for your time.</p> :
        <div className="mt-5 space-y-3">{commitments.map(item => <div key={item.id} className="grid gap-2 rounded-lg bg-paper p-3 sm:grid-cols-[1.2fr_.7fr_.8fr_.6fr_.6fr_auto]">
          <input aria-label="Commitment title" value={item.title} onChange={e => update(item.id,{title:e.target.value})} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"/>
          <select aria-label="Commitment type" value={item.type} onChange={e => update(item.id,{type:e.target.value as CommitmentType})} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm capitalize">{types.map(type=><option key={type}>{type}</option>)}</select>
          <input aria-label="Commitment date" type="date" value={item.date} onChange={e => update(item.id,{date:e.target.value})} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"/>
          <input aria-label="Start time" type="time" value={item.startTime} onChange={e => update(item.id,{startTime:e.target.value})} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"/>
          <input aria-label="End time" type="time" value={item.endTime} onChange={e => update(item.id,{endTime:e.target.value})} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"/>
          <button aria-label={`Delete ${item.title}`} onClick={()=>onChange(commitments.filter(c=>c.id!==item.id))} className="grid h-10 place-items-center rounded-lg text-poppy hover:bg-poppy hover:text-white"><Trash2 size={16}/></button>
        </div>)}</div>}
    </section>
  );
}
