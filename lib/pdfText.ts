import type { TextItem } from "pdfjs-dist/types/src/display/api";

type PositionedText = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && item !== null && "str" in item && "transform" in item;
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function getPositionedText(item: TextItem): PositionedText | null {
  const text = normalizeText(item.str);
  if (!text) return null;

  const transform = item.transform;
  const x = Number(transform[4]);
  const y = Number(transform[5]);
  const height = Number(item.height || Math.abs(Number(transform[3])) || 10);
  const width = Number(item.width || text.length * 5);

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { text, x, y, width, height };
}

function groupIntoRows(items: PositionedText[]) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: PositionedText[][] = [];

  sorted.forEach((item) => {
    const tolerance = Math.max(3, item.height * 0.45);
    const existingRow = rows.find((row) => Math.abs(row[0].y - item.y) <= tolerance);

    if (existingRow) {
      existingRow.push(item);
    } else {
      rows.push([item]);
    }
  });

  return rows.map((row) => row.sort((a, b) => a.x - b.x));
}

function rowToText(row: PositionedText[]) {
  return row.reduce((line, item, index) => {
    if (index === 0) return item.text;

    const previous = row[index - 1];
    const gap = item.x - (previous.x + previous.width);
    const separator = gap > 42 ? " | " : " ";

    return `${line}${separator}${item.text}`;
  }, "");
}

export async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const positionedItems = content.items
      .filter(isTextItem)
      .map(getPositionedText)
      .filter((item): item is PositionedText => item !== null);
    const pageText = groupIntoRows(positionedItems).map(rowToText).filter(Boolean).join("\n").trim();

    if (pageText) {
      pages.push(`Page ${pageNumber}\n${pageText}`);
    }
  }

  return pages.join("\n\n");
}
