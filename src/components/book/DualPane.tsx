"use client";

import { useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  originalMd: string;
  modernisedMd: string;
  chapterKey: number;
}

function splitBlocks(md: string): string[] {
  return md
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export default function DualPane({ originalMd, modernisedMd, chapterKey }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const leftBlocks = useMemo(() => splitBlocks(originalMd), [originalMd]);
  const rightBlocks = useMemo(() => splitBlocks(modernisedMd), [modernisedMd]);
  const count = Math.max(leftBlocks.length, rightBlocks.length);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapterKey]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-2 shrink-0 border-b border-border">
        <div className="px-6 py-2.5 bg-surface border-r border-border flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent/40" />
          <span className="text-xs tracking-[0.2em] uppercase text-ink-muted font-heading">
            Original English
          </span>
          <span className="ml-auto text-xs text-ink-muted opacity-50">1926</span>
        </div>
        <div className="px-6 py-2.5 bg-surface flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-dim/40" />
          <span className="text-xs tracking-[0.2em] uppercase text-ink-muted font-heading">
            Modernised English
          </span>
          <span className="ml-auto text-xs text-ink-muted opacity-50">
            Centennial Ed.
          </span>
        </div>
      </div>

      {/* Single scroll — grid rows keep matching blocks level */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-2 border-b border-border/20 last:border-b-0"
          >
            <div className="chapter-prose px-8 py-5 border-r border-border/20">
              {leftBlocks[i] && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {leftBlocks[i]}
                </ReactMarkdown>
              )}
            </div>
            <div className="chapter-prose px-8 py-5">
              {rightBlocks[i] && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {rightBlocks[i]}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
