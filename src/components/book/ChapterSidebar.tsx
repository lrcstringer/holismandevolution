"use client";

import { useRef, useEffect } from "react";
import type { Chapter } from "@/lib/chapters";

interface Props {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function ChapterSidebar({
  chapters,
  activeIndex,
  onSelect,
}: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-muted font-heading">
          Chapters
        </p>
      </div>

      <ul className="py-2 flex-1">
        {chapters.map((ch, i) => {
          const isActive = i === activeIndex;
          return (
            <li key={ch.number}>
              <button
                ref={isActive ? activeRef : null}
                onClick={() => onSelect(i)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors border-l-2 ${
                  isActive
                    ? "bg-surface-hover border-accent"
                    : "border-transparent hover:bg-surface-hover hover:border-accent/30"
                }`}
              >
                <span
                  className={`text-xs pt-0.5 shrink-0 font-mono tabular-nums w-5 ${
                    isActive ? "text-accent" : "text-ink-muted"
                  }`}
                >
                  {ch.label === undefined
                    ? String(ch.number).padStart(2, "0")
                    : "·"}
                </span>
                <span
                  className={`text-sm leading-snug font-heading ${
                    isActive ? "text-ink" : "text-ink-secondary"
                  }`}
                >
                  {ch.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-3 border-t border-border shrink-0">
        <p className="text-xs text-ink-muted leading-relaxed">
          <kbd className="bg-page border border-border px-1 py-0.5 rounded text-[10px] font-mono">
            [
          </kbd>{" "}
          /{" "}
          <kbd className="bg-page border border-border px-1 py-0.5 rounded text-[10px] font-mono">
            ]
          </kbd>{" "}
          to navigate
        </p>
      </div>
    </aside>
  );
}
