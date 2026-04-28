export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">
        Holism &amp; Evolution
      </p>
      <h1 className="font-heading text-5xl text-ink mb-4">Resources</h1>
      <div className="h-px w-16 bg-accent/25 mb-10" />

      <div className="space-y-8 text-ink-secondary leading-relaxed">
        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">Bibliography</h2>
          <p>
            Primary sources, academic references, and recommended reading on
            holism, philosophy of science, and evolution will be listed here.
          </p>
        </div>

        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">
            Historical Context
          </h2>
          <p>
            Background on Jan Christiaan Smuts, the intellectual climate of the
            1920s, and the reception of holism in philosophy and science.
          </p>
        </div>

        <div className="border border-border p-6">
          <h2 className="font-heading text-xl text-ink mb-3">Commentary</h2>
          <p>
            Scholarly commentary, annotations, and editorial notes on key
            passages across all twelve chapters.
          </p>
        </div>
      </div>
    </div>
  );
}
