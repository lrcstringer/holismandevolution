import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Chapter {
  number: number;
  title: string;
  label?: string; // undefined = "Ch N"; "" = no label; other string = custom label
  originalMd: string;
  modernisedMd: string;
}

const contentDir = path.join(process.cwd(), "src", "content");

function readChapter(
  version: "original" | "modernised",
  num: number
): { title: string; body: string } {
  const file = path.join(
    contentDir,
    version,
    `chapter-${String(num).padStart(2, "0")}.md`
  );
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: (data.title as string) ?? `Chapter ${num}`,
    body: content.trim(),
  };
}

function readFrontSection(filename: string): {
  title: string;
  label: string;
  body: string;
} {
  const file = path.join(contentDir, "front", filename);
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: (data.title as string) ?? "",
    label: (data.label as string) ?? "",
    body: content.trim(),
  };
}

export function getAllChapters(): Chapter[] {
  const frontFiles: Array<{ file: string; number: number }> = [
    { file: "epigraph.md", number: -3 },
    { file: "preface-third.md", number: -2 },
    { file: "preface-first.md", number: -1 },
  ];

  const front: Chapter[] = frontFiles.map(({ file, number }) => {
    const sec = readFrontSection(file);
    return {
      number,
      title: sec.title,
      label: sec.label,
      originalMd: sec.body,
      modernisedMd: "",
    };
  });

  const chapters: Chapter[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const orig = readChapter("original", num);
    const mod = readChapter("modernised", num);
    return {
      number: num,
      title: orig.title,
      originalMd: orig.body,
      modernisedMd: mod.body,
    };
  });

  return [...front, ...chapters];
}
