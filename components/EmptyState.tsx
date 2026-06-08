import { ClipboardList, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  message,
  icon: Icon = ClipboardList,
  action,
}: {
  title: string;
  message: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-mint text-moss">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
