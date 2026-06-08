# RiskWeeks

RiskWeeks is a student planning app that turns all of a student's syllabi into one semester risk dashboard. Students can paste syllabus text or upload PDF files for every class they are taking, then RiskWeeks extracts dated coursework, groups assignments by week, highlights cross-class deadline clusters, and suggests prep actions before workload spikes arrive.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React components
- Client-side PDF text extraction with `pdfjs-dist`
- Browser `localStorage` persistence
- No authentication, database, paid APIs, or AI APIs

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

The app is designed to deploy directly to Vercel.

## MVP Parser and PDF Flow

The parser in `lib/syllabusParser.ts` reads syllabus text line by line and uses deterministic regex plus keyword detection to find dates, assignment types, titles, and grade weights. PDF text extraction happens locally in the browser through `lib/pdfText.ts`; no syllabus files are sent to an API.

Risk scoring lives in `lib/riskScoring.ts`. Multiple course analyses are combined in `lib/analysis.ts` so the dashboard can show risk across the whole semester.

Use the sample semester on the input page to generate a dashboard with multiple classes, cross-course pileups, high-risk weeks, and a critical final stretch.

## Calendar Export

Every extracted assignment becomes a schedule item. If the parser finds a time like `2:00 PM`, RiskWeeks creates a timed calendar event; if the syllabus says `TBD` or no time is found, it creates an all-day event.

The dashboard supports direct Google Calendar event links and `.ics` downloads for Apple Calendar, Outlook, and other calendar apps. The full semester schedule can also be downloaded as one `.ics` file.

## GPA Calculator

The `/gpa` page lets students enter their current cumulative GPA and completed credits, then add planned or current courses with credit values and expected letter grades. The calculator shows projected cumulative GPA, term GPA, total credits, and GPA change. Calculator state is saved in browser `localStorage`.
