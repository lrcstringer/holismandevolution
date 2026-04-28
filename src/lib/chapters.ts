import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Chapter {
  number: number;
  title: string;
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

export function getAllChapters(): Chapter[] {
  return Array.from({ length: 12 }, (_, i) => {
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
}
