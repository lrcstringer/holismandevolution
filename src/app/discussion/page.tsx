"use client";

import { Comments } from "@hyvor/hyvor-talk-react";

export default function DiscussionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">
        Holism &amp; Evolution
      </p>
      <h1 className="font-heading text-5xl text-ink mb-4">Discussion</h1>
      <div className="h-px w-16 bg-accent/25 mb-10" />

      <Comments website-id={15352} page-id="discussion" />
    </div>
  );
}
