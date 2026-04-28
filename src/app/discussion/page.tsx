export default function DiscussionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">
        Holism &amp; Evolution
      </p>
      <h1 className="font-heading text-5xl text-ink mb-4">Discussion</h1>
      <div className="h-px w-16 bg-accent/25 mb-10" />

      <div className="space-y-8 text-ink-secondary leading-relaxed">
        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">
            Key Themes
          </h2>
          <p>
            Holism, mechanism, life, mind, personality, evolution, and
            purposiveness — the central themes of Smuts&apos; work and their
            relevance to contemporary science and philosophy.
          </p>
        </div>

        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">
            Open Questions
          </h2>
          <p>
            Questions raised by the text that remain live in modern physics,
            biology, cognitive science, and philosophy of mind.
          </p>
        </div>

        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">
            Join the Conversation
          </h2>
          <p>
            A community discussion forum is planned for this space. Check back
            soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
