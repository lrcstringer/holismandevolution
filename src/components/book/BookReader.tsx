"use client";

import { useState, useEffect, useCallback } from "react";
import ChapterSidebar from "./ChapterSidebar";
import DualPane from "./DualPane";
import type { Chapter } from "@/lib/chapters";

interface Props {
  chapters: Chapter[];
}

export default function BookReader({ chapters }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(chapters.length - 1, index)));
    },
    [chapters.length]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "[") goTo(activeIndex - 1);
      if (e.key === "]") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, goTo]);

  const active = chapters[activeIndex];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Chapter navigation bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="text-ink-muted hover:text-ink transition-colors p-1.5 hover:bg-surface-hover rounded"
          title="Toggle chapter list"
          aria-label="Toggle chapter list"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="text-ink-muted hover:text-ink disabled:opacity-25 transition-colors text-xl leading-none px-1"
          aria-label="Previous chapter"
        >
          ‹
        </button>

        <div className="flex-1 text-center">
          {active.label === undefined ? (
            <span className="text-accent text-xs tracking-[0.2em] uppercase mr-2 font-heading">
              Ch {active.number}
            </span>
          ) : active.label ? (
            <span className="text-accent text-xs tracking-[0.2em] uppercase mr-2 font-heading">
              {active.label}
            </span>
          ) : null}
          <span className="text-ink text-sm font-heading">{active.title}</span>
          <span className="text-ink-muted text-xs ml-3 opacity-60">
            {activeIndex + 1} / {chapters.length}
          </span>
        </div>

        <button
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === chapters.length - 1}
          className="text-ink-muted hover:text-ink disabled:opacity-25 transition-colors text-xl leading-none px-1"
          aria-label="Next chapter"
        >
          ›
        </button>
      </div>

      {/* Main reading area */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <ChapterSidebar
            chapters={chapters}
            activeIndex={activeIndex}
            onSelect={goTo}
          />
        )}
        <DualPane
          originalMd={active.originalMd}
          modernisedMd={active.modernisedMd}
          chapterKey={active.number}
        />
      </div>
    </div>
  );
}
