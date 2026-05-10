import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "src", "content", "modernised");
const outPath = path.join(__dirname, "..", "Holism-and-Evolution-Modernised.docx");

function parseInline(text) {
  // Split on **bold** and *italic* markers and return TextRun array
  const runs = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index) }));
    }
    if (m[2]) {
      runs.push(new TextRun({ text: m[2], bold: true }));
    } else if (m[3]) {
      runs.push(new TextRun({ text: m[3], italics: true }));
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last) }));
  }
  return runs.length ? runs : [new TextRun({ text })];
}

function mdToParagraphs(md) {
  const paras = [];
  const blocks = md.replace(/\r\n/g, "\n").split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    paras.push(
      new Paragraph({
        children: parseInline(block.replace(/\n/g, " ")),
        spacing: { after: 160 },
      })
    );
  }
  return paras;
}

const children = [
  // Title page
  new Paragraph({
    text: "Holism and Evolution",
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Modernised Edition", size: 28 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "J. C. Smuts", size: 24, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 2000 },
  }),
];

for (let num = 1; num <= 12; num++) {
  const file = path.join(contentDir, `chapter-${String(num).padStart(2, "0")}.md`);
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title ?? `Chapter ${num}`;

  // Page break before each chapter (except the first)
  if (num > 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Chapter ${num}`, size: 22, color: "888888" })],
      spacing: { before: 400, after: 120 },
    }),
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 400 },
    })
  );

  children.push(...mdToParagraphs(content.trim()));
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Georgia", size: 24 },
        paragraph: { spacing: { line: 360 } },
      },
    },
  },
  sections: [{ children }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log(`Written: ${outPath}`);
