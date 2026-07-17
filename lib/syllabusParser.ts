import { getWeekStart, parseDateFromParts, parseSlashDate, toISODate } from "./dateUtils";
import { buildPrepRecommendations, scoreAssignment, scoreWeeks } from "./riskScoring";
import type { AssignmentItem, AssignmentType, CourseSyllabus, SyllabusAnalysis } from "./types";

const assignmentKeywords: AssignmentType[] = [
  "reading",
  "discussion",
  "homework",
  "lab",
  "quiz",
  "paper",
  "project",
  "simulation",
  "presentation",
  "exam",
  "midterm",
  "final",
];

const monthPattern =
  "(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)";

const ordinalSuffixPattern = "(?:st|nd|rd|th)?";
const monthDateRegex = new RegExp(`${monthPattern}\\s+(\\d{1,2})${ordinalSuffixPattern}(?:,?\\s+(\\d{4}))?`, "i");
const monthDateGlobalRegex = new RegExp(`${monthPattern}\\s+\\d{1,2}${ordinalSuffixPattern}(?:,?\\s+\\d{4})?`, "gi");
const slashDateRegex = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;
const slashDateGlobalRegex = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g;
const percentRegex = /\b(\d{1,2}(?:\.\d+)?)\s?%/;
const tbdTimeRegex = /\b(?:time\s*)?tbd\b/i;
const amPmTimeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const twentyFourHourTimeRegex = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const weekStartRegex = new RegExp(`^Week\\s+\\d+\\s*\\(\\s*${monthPattern}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*\\)`, "i");

export type ParseOptions = {
  courseName?: string;
  courseId?: string;
  courseColor?: string;
  semesterStart?: string;
  semesterEnd?: string;
  sourceType?: CourseSyllabus["sourceType"];
  fileName?: string;
};

function normalizeYear(year: string | undefined, fallbackYear: number) {
  if (!year) return undefined;
  if (year.length === 2) return String(2000 + Number(year));
  return year;
}

function fallbackYearFromOptions(options: ParseOptions) {
  if (options.semesterStart) return new Date(`${options.semesterStart}T12:00:00`).getFullYear();
  return new Date().getFullYear();
}

function detectType(line: string): AssignmentType {
  const lowered = line.toLowerCase();
  const found = assignmentKeywords.find((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(lowered));
  return found ?? "other";
}

function detectDate(line: string, fallbackYear: number) {
  const monthMatch = line.match(monthDateRegex);
  if (monthMatch) {
    return parseDateFromParts(monthMatch[1], monthMatch[2], normalizeYear(monthMatch[3], fallbackYear), fallbackYear);
  }

  const slashMatch = line.match(slashDateRegex);
  if (slashMatch) {
    return parseSlashDate(slashMatch[1], slashMatch[2], normalizeYear(slashMatch[3], fallbackYear), fallbackYear);
  }

  return null;
}

function cleanTitle(line: string) {
  return line
    .replace(weekStartRegex, "")
    .replace(/^\s*(due|exam|assignment|deadline|week\s+\d+)\s*[:\-]\s*/i, "")
    .replace(/^page\s+\d+\s*/i, "")
    .replace(monthDateGlobalRegex, "")
    .replace(slashDateGlobalRegex, "")
    .replace(amPmTimeRegex, "")
    .replace(twentyFourHourTimeRegex, "")
    .replace(tbdTimeRegex, "")
    .replace(percentRegex, "")
    .replace(/\s+\|\s+/g, " ")
    .replace(/\b(?:due|by)\b\s*$/i, "")
    .replace(/\b(?:due|by)\b\s*[-–—:]?\s*/i, "")
    .replace(/^\s*[:|\-–—]+\s*/, "")
    .replace(/^\s*\(\s*\)\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function addOneHour(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${padTime((hour + 1) % 24)}:${padTime(minute)}`;
}

function detectTime(line: string): Pick<AssignmentItem, "timeStatus" | "startTime" | "endTime"> {
  if (tbdTimeRegex.test(line)) {
    return { timeStatus: "tbd", startTime: null, endTime: null };
  }

  const amPmMatch = line.match(amPmTimeRegex);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2] ?? "0");
    const meridiem = amPmMatch[3].toLowerCase();

    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const startTime = `${padTime(hour)}:${padTime(minute)}`;
    return { timeStatus: "timed", startTime, endTime: addOneHour(startTime) };
  }

  const twentyFourHourMatch = line.match(twentyFourHourTimeRegex);
  if (twentyFourHourMatch) {
    const startTime = `${padTime(Number(twentyFourHourMatch[1]))}:${twentyFourHourMatch[2]}`;
    return { timeStatus: "timed", startTime, endTime: addOneHour(startTime) };
  }

  return { timeStatus: "all-day", startTime: null, endTime: null };
}

function findDateStarts(line: string) {
  const starts: number[] = [];
  const regexes = [new RegExp(monthDateGlobalRegex), new RegExp(slashDateGlobalRegex)];

  regexes.forEach((regex) => {
    let match = regex.exec(line);
    while (match) {
      starts.push(match.index);
      match = regex.exec(line);
    }
  });

  return Array.from(new Set(starts)).sort((a, b) => a - b);
}

function splitMultiDateLine(line: string) {
  const dateStarts = findDateStarts(line);
  if (dateStarts.length <= 1) return [line];

  return dateStarts
    .map((start, index) => {
      const end = dateStarts[index + 1] ?? line.length;
      const prefix = start === 0 ? "" : line.slice(0, start).trim();
      const segment = line.slice(start, end).trim();

      if (!prefix || index > 0) return segment;
      return `${prefix} ${segment}`;
    })
    .filter(Boolean);
}

function normalizeSyllabusLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, " | ").trim())
    .filter(Boolean)
    .flatMap(splitMultiDateLine);
}

function getScheduleStartIndex(lines: string[]) {
  const scheduleIndex = lines.findIndex((line) => /class schedule|topic outline/i.test(line));
  return scheduleIndex === -1 ? null : scheduleIndex;
}

function isModuleRangeStart(line: string) {
  return new RegExp(`^${monthPattern}\\s+\\d{1,2}\\s*[–-]`, "i").test(line);
}

function isWeekBlockStart(line: string) {
  return weekStartRegex.test(line);
}

function containsWeekBlockStart(line: string) {
  return new RegExp(`\\bWeek\\s+\\d+\\s*\\(\\s*${monthPattern}\\s+\\d{1,2}${ordinalSuffixPattern}\\s*\\)`, "i").test(line);
}

function splitEmbeddedWeekBlocks(lines: string[]) {
  const weekMarkerRegex = new RegExp(`\\bWeek\\s+\\d+\\s*\\(\\s*${monthPattern}\\s+\\d{1,2}${ordinalSuffixPattern}\\s*\\)`, "gi");

  return lines.flatMap((line) => {
    const starts: number[] = [];
    let match = weekMarkerRegex.exec(line);

    while (match) {
      starts.push(match.index);
      match = weekMarkerRegex.exec(line);
    }

    if (starts.length <= 1) return [line];

    return starts.map((start, index) => line.slice(start, starts[index + 1] ?? line.length).trim()).filter(Boolean);
  });
}

function findModuleEndDate(lines: string[], startIndex: number, fallbackYear: number) {
  for (let index = startIndex + 1; index < Math.min(lines.length, startIndex + 8); index += 1) {
    const date = detectDate(lines[index], fallbackYear);
    if (date) return date;
  }

  return null;
}

function extractScheduledItems(blockText: string) {
  const itemRegex =
    /(Module\s+\d+\s+Discussion Board|Module\s+\d+\s+Homework|Exam\s+(?:I{1,3}|IV|V|VI{0,3}|IX|X)|Read\s+Mankiw,\s*Chs?\.\s*[\d,\s]+|TRACE Survey)/gi;
  const items: string[] = [];
  let match = itemRegex.exec(blockText);

  while (match) {
    items.push(match[1].replace(/\s+/g, " ").trim());
    match = itemRegex.exec(blockText);
  }

  return Array.from(new Set(items));
}

function formatSyntheticDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getSyntheticWeight(item: string) {
  return /^Exam\s+/i.test(item) ? " 20%" : "";
}

function getSyntheticTime(item: string) {
  if (/homework|discussion|exam/i.test(item)) return " 11:59 pm";
  return "";
}

function buildModuleScheduleLines(lines: string[], fallbackYear: number) {
  const scheduleStartIndex = getScheduleStartIndex(lines);
  if (scheduleStartIndex === null) return [];

  const syntheticLines: string[] = [];

  for (let index = scheduleStartIndex + 1; index < lines.length; index += 1) {
    if (!isModuleRangeStart(lines[index])) continue;

    const dueDate = findModuleEndDate(lines, index, fallbackYear);
    if (!dueDate) continue;

    let nextModuleIndex = lines.length;
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      if (isModuleRangeStart(lines[nextIndex])) {
        nextModuleIndex = nextIndex;
        break;
      }
    }

    const blockText = lines.slice(index, nextModuleIndex).join(" ");
    const scheduledItems = extractScheduledItems(blockText);
    const dueDateText = formatSyntheticDate(dueDate);

    scheduledItems.forEach((item) => {
      syntheticLines.push(`${item} due ${dueDateText}${getSyntheticTime(item)}${getSyntheticWeight(item)}`);
    });
  }

  return syntheticLines;
}

function addDaysToDate(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function detectWeeklyDueRules(lines: string[]) {
  const text = lines.join(" ");
  return {
    homework: /Homework Due:\s*Friday\s+11:59/i.test(text)
      ? { dayOfWeek: 5, time: "11:59 pm" }
      : { dayOfWeek: 0, time: "11:59 pm" },
    discussion: /Discussion Board Post\/Interactives:\s*Sunday\s+by\s+11:59/i.test(text)
      ? { dayOfWeek: 0, time: "11:59 pm" }
      : { dayOfWeek: 0, time: "11:59 pm" },
    simulation: /Simulation submission\s*:\s*Sunday\s+11:30pm/i.test(text)
      ? { dayOfWeek: 0, time: "11:30 pm" }
      : { dayOfWeek: 0, time: "11:59 pm" },
  };
}

function nextDayOfWeek(date: Date, dayOfWeek: number) {
  const diff = (dayOfWeek - date.getDay() + 7) % 7;
  return addDaysToDate(date, diff);
}

function stripWeekPrefix(line: string) {
  return line.replace(weekStartRegex, "").replace(/^\s*[-–—:|]+\s*/, "").trim();
}

function normalizeScheduledTitle(title: string) {
  return title.replace(/\s+/g, " ").replace(/\s*[-–—:]\s*/g, " - ").trim();
}

function splitScheduleItemLine(line: string) {
  const markerRegex = /\b(?:Reading\s*[-–—:]|Homework(?:\s+Assignment)?\s*[-–—:]|Simulation(?:\s+\d+|\s*[-–—:]|\s*:)|Discussion(?:\s+Board)?|Project\s*[-–—:]|Paper\s*[-–—:]|Presentation\s*[-–—:]|Exam\s+\w+|Final\s*[-–—])/gi;
  const starts: number[] = [];
  let match = markerRegex.exec(line);

  while (match) {
    starts.push(match.index);
    match = markerRegex.exec(line);
  }

  if (starts.length <= 1) return [line];

  return starts
    .map((start, index) => line.slice(start, starts[index + 1] ?? line.length).trim())
    .filter(Boolean);
}

function isReadingLine(line: string) {
  return /\bReading\s*[-–—:]/i.test(line);
}

function isHomeworkLine(line: string) {
  return /\bHomework(?:\s+Assignment)?\b/i.test(line);
}

function isSimulationLine(line: string) {
  return /\bSimulation\b/i.test(line);
}

function isDiscussionLine(line: string) {
  return /\bDiscussion\b/i.test(line);
}

function isExamLine(line: string) {
  return /\b(?:Exam|Final)\b/i.test(line);
}

function buildWeeklyBlockScheduleLines(lines: string[], fallbackYear: number) {
  const dueRules = detectWeeklyDueRules(lines);
  const syntheticLines: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!containsWeekBlockStart(lines[index])) continue;

    const weekStart = detectDate(lines[index], fallbackYear);
    if (!weekStart) continue;

    let nextWeekIndex = lines.length;
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      if (containsWeekBlockStart(lines[nextIndex])) {
        nextWeekIndex = nextIndex;
        break;
      }
    }

    const blockLines = [stripWeekPrefix(lines[index]), ...lines.slice(index + 1, nextWeekIndex)]
      .map(normalizeScheduledTitle)
      .filter(Boolean);

    blockLines.flatMap(splitScheduleItemLine).forEach((line) => {
      if (isReadingLine(line)) {
        syntheticLines.push(`${line} due ${formatSyntheticDate(weekStart)}`);
        return;
      }

      if (isHomeworkLine(line)) {
        const dueDate = nextDayOfWeek(weekStart, dueRules.homework.dayOfWeek);
        syntheticLines.push(`${line} due ${formatSyntheticDate(dueDate)} ${dueRules.homework.time}`);
        return;
      }

      if (isSimulationLine(line)) {
        const dueDate = nextDayOfWeek(weekStart, dueRules.simulation.dayOfWeek);
        syntheticLines.push(`${line} due ${formatSyntheticDate(dueDate)} ${dueRules.simulation.time}`);
        return;
      }

      if (isDiscussionLine(line)) {
        const dueDate = nextDayOfWeek(weekStart, dueRules.discussion.dayOfWeek);
        syntheticLines.push(`${line} due ${formatSyntheticDate(dueDate)} ${dueRules.discussion.time}`);
        return;
      }

      if (isExamLine(line)) {
        const explicitDate = detectDate(line, fallbackYear);
        syntheticLines.push(`${line} due ${formatSyntheticDate(explicitDate ?? weekStart)} 11:59 pm`);
      }
    });
  }

  return syntheticLines;
}

export function parseSyllabus(text: string, options: ParseOptions = {}): SyllabusAnalysis {
  const fallbackYear = fallbackYearFromOptions(options);
  const courseId = options.courseId || `course-${Date.now()}`;
  const courseName = options.courseName?.trim() || "Untitled Course";
  const courseColor = options.courseColor || "#2F6F4E";
  const normalizedLines = splitEmbeddedWeekBlocks(normalizeSyllabusLines(text));
  const scheduleStartIndex = getScheduleStartIndex(normalizedLines);
  const inferredScheduleLines = buildModuleScheduleLines(normalizedLines, fallbackYear);
  const inferredWeeklyBlockLines = buildWeeklyBlockScheduleLines(normalizedLines, fallbackYear);
  const firstWeekBlockIndex = normalizedLines.findIndex(containsWeekBlockStart);
  const lines =
    inferredWeeklyBlockLines.length > 0
      ? [...normalizedLines.slice(0, firstWeekBlockIndex), ...inferredWeeklyBlockLines]
      : scheduleStartIndex === null
      ? normalizedLines
      : [...normalizedLines.slice(0, scheduleStartIndex), ...inferredScheduleLines];

  const assignments: AssignmentItem[] = lines.flatMap((line, index) => {
    const detectedDate = detectDate(line, fallbackYear);
    if (!detectedDate) return [];

    const type = detectType(line);
    const gradeWeightMatch = line.match(percentRegex);
    const gradeWeight = gradeWeightMatch ? Number(gradeWeightMatch[1]) : null;
    const weekStart = getWeekStart(detectedDate);
    const title = cleanTitle(line) || `${type[0].toUpperCase()}${type.slice(1)} deadline`;
    const riskPoints = scoreAssignment(type, gradeWeight);
    const time = detectTime(line);

    const item: AssignmentItem = {
      id: `${courseId}-assignment-${index}-${toISODate(detectedDate)}`,
      courseId,
      courseName,
      courseColor,
      title,
      type,
      date: toISODate(detectedDate),
      ...time,
      weekStart: toISODate(weekStart),
      riskPoints,
      gradeWeight,
      effortHours: Math.max(1, Math.round(riskPoints * 0.75)),
      completed: false,
      sourceText: line,
    };

    return [item];
  });

  const weeks = scoreWeeks(assignments);

  return {
    courseName,
    courses: [
      {
        id: courseId,
        name: courseName,
        color: courseColor,
        sourceType: options.sourceType || "paste",
        fileName: options.fileName,
        assignmentCount: assignments.length,
      },
    ],
    generatedAt: new Date().toISOString(),
    semesterStart: options.semesterStart || null,
    semesterEnd: options.semesterEnd || null,
    assignments,
    weeks,
    recommendations: buildPrepRecommendations(weeks),
  };
}
