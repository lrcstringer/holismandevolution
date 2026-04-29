import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden min-h-[85vh]">
        <div className="absolute inset-8 border border-accent/10 pointer-events-none" />
        <div className="absolute inset-10 border border-accent/5 pointer-events-none" />

        <p className="text-accent text-xs tracking-[0.4em] uppercase mb-8">
          J. C. Smuts
        </p>

        <h1 className="font-heading font-bold text-ink tracking-wide leading-tight">
          <span className="block text-7xl md:text-9xl">Holism</span>
          <span className="block text-3xl md:text-4xl font-normal text-ink-secondary tracking-[0.25em] my-3">
            and
          </span>
          <span className="block text-7xl md:text-9xl">Evolution</span>
        </h1>

        <p className="text-accent text-xs tracking-[0.3em] uppercase mb-12">
          Centennial Updated Edition
        </p>

        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-20 bg-accent/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          <div className="h-px w-4 bg-accent/25" />
          <div className="w-2.5 h-2.5 rounded-full border border-accent/35" />
          <div className="h-px w-4 bg-accent/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          <div className="h-px w-20 bg-accent/25" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/book"
            className="px-10 py-3.5 bg-accent text-page font-semibold tracking-[0.2em] uppercase text-sm hover:bg-accent-hover transition-colors"
          >
            Read the Book
          </Link>
          <Link
            href="/resources"
            className="px-10 py-3.5 border border-accent text-accent tracking-[0.2em] uppercase text-sm hover:bg-accent/8 transition-colors"
          >
            Resources
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="bg-surface px-6 py-20 border-y border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl text-ink mb-8">
            About This Edition
          </h2>
          <p className="text-ink-secondary leading-relaxed mb-5">
            First published in 1926, &ldquo;
            <em className="text-ink">Holism and Evolution</em>&rdquo; by Jan
            Christiaan Smuts introduced the word &ldquo;holism&rdquo; to the
            English language and his theory that nature tends to produce
            organised wholes greater than the sum of their parts.
          </p>
          <p className="text-ink-secondary leading-relaxed">
            This centennial edition presents the original text (of the third
            edition) alongside a modernised version, making Smuts&apos;
            visionary philosophy accessible to the contemporary reader. The dual-pane reader lets you
            compare both versions in parallel, chapter by chapter.
          </p>
        </div>
      </section>

      {/* Navigation cards */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              href: "/book",
              title: "Read",
              description:
                "Compare the original text and the modernised version side by side across all twelve chapters.",
              label: "Open Reader →",
            },
            {
              href: "/resources",
              title: "Resources",
              description:
                "Supplementary materials, bibliography, historical context, and scholarly commentary.",
              label: "Explore →",
            },
            {
              href: "/discussion",
              title: "Discussion",
              description:
                "Engage with the ideas — themes, open questions, and conversations around Smuts' philosophy.",
              label: "Join →",
            },
          ].map(({ href, title, description, label }) => (
            <Link
              key={href}
              href={href}
              className="block p-7 border border-border hover:border-accent/40 bg-surface hover:bg-surface-hover transition-all group"
            >
              <h3 className="font-heading text-xl text-ink mb-3 group-hover:text-accent transition-colors">
                {title}
              </h3>
              <p className="text-ink-secondary text-sm leading-relaxed mb-5">
                {description}
              </p>
              <span className="text-accent text-sm tracking-wider">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-ink-muted text-xs tracking-widest uppercase">
          Holism &amp; Evolution · J. C. Smuts · Centennial Edition
        </p>
        <p className="text-ink-muted text-xs mt-2">
          <a href="mailto:info@holismandevolution.com" className="hover:text-accent transition-colors">
            info@holismandevolution.com
          </a>
        </p>
      </footer>
    </div>
  );
}
