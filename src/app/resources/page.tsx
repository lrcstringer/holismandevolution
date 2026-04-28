import { getManifest, PUBLIC_URL } from "@/lib/r2";

export const runtime = "edge";

const TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  image: "Image",
  other: "File",
};

export default async function ResourcesPage() {
  const manifest = await getManifest();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">
        Holism &amp; Evolution
      </p>
      <h1 className="font-heading text-5xl text-ink mb-4">Resources</h1>
      <div className="h-px w-16 bg-accent/25 mb-10" />

      {manifest.sections.length === 0 ? (
        <p className="text-ink-muted">Resources will be added here soon.</p>
      ) : (
        <div className="space-y-12">
          {manifest.sections.map((section) => (
            <div key={section.id}>
              <h2 className="font-heading text-2xl text-ink mb-5">{section.heading}</h2>
              <div className="space-y-3">
                {section.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={`${PUBLIC_URL}/${resource.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 border border-border hover:border-accent/40 hover:bg-surface transition-all group"
                  >
                    <span className="text-[10px] uppercase tracking-wider border border-border px-1.5 py-0.5 text-ink-muted shrink-0 mt-0.5 group-hover:border-accent/30 transition-colors">
                      {TYPE_LABEL[resource.type] ?? "File"}
                    </span>
                    <div>
                      <p className="text-accent text-sm font-medium group-hover:underline">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="text-ink-muted text-xs mt-0.5">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
