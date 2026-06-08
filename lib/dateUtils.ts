const monthIndex: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

export function parseDateFromParts(month: string, day: string, year: string | undefined, fallbackYear: number) {
  const monthNumber = monthIndex[month.toLowerCase()];
  if (monthNumber === undefined) return null;
  const parsedDay = Number(day);
  const parsedYear = year ? Number(year) : fallbackYear;
  if (!Number.isFinite(parsedDay) || parsedDay < 1 || parsedDay > 31) return null;
  return new Date(parsedYear, monthNumber, parsedDay);
}

export function parseSlashDate(month: string, day: string, year: string | undefined, fallbackYear: number) {
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const parsedYear = year ? Number(year) : fallbackYear;
  if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) return null;
  return new Date(parsedYear, parsedMonth - 1, parsedDay);
}

export function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function toISODate(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

export function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatWeekRange(weekStart: string, weekEnd: string) {
  return `${formatDisplayDate(weekStart)} - ${formatDisplayDate(weekEnd)}`;
}
