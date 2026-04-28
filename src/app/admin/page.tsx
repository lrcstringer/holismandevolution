"use client";

import { useRef, useState } from "react";
import type { Manifest, Section, ResourceItem } from "@/types/resources";

const PUBLIC_URL = "https://resources.holismandevolution.com";

function inferType(filename: string): ResourceItem["type"] {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  return "other";
}

async function apiFetch(method: string, path: string, password: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: {
      "x-admin-password": password,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addingSectionName, setAddingSectionName] = useState<string | null>(null);
  const newSectionRef = useRef<HTMLInputElement>(null);

  async function login() {
    setBusy(true);
    setError("");
    try {
      const m = await apiFetch("GET", "/api/admin/manifest", pw);
      setManifest(m);
      setAuthed(true);
    } catch {
      setError("Incorrect password");
    } finally {
      setBusy(false);
    }
  }

  async function persist(next: Manifest) {
    setBusy(true);
    setError("");
    try {
      await apiFetch("PUT", "/api/admin/manifest", pw, next);
      setManifest(next);
    } catch {
      setError("Save failed — changes not persisted");
    } finally {
      setBusy(false);
    }
  }

  async function confirmAddSection() {
    const heading = (addingSectionName ?? "").trim() || "Untitled Section";
    setAddingSectionName(null);
    await persist({
      sections: [
        ...(manifest?.sections ?? []),
        { id: crypto.randomUUID(), heading, resources: [] },
      ],
    });
  }

  function deleteSection(id: string) {
    if (!confirm("Delete this section and all its resources?")) return;
    persist({ sections: (manifest?.sections ?? []).filter((s) => s.id !== id) });
  }

  function renameSection(id: string, heading: string) {
    persist({
      sections: (manifest?.sections ?? []).map((s) =>
        s.id === id ? { ...s, heading } : s
      ),
    });
  }

  function deleteResource(sectionId: string, resourceId: string) {
    persist({
      sections: (manifest?.sections ?? []).map((s) =>
        s.id === sectionId
          ? { ...s, resources: s.resources.filter((r) => r.id !== resourceId) }
          : s
      ),
    });
  }

  async function uploadResource(
    sectionId: string,
    title: string,
    description: string,
    file: File
  ) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": pw },
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const { key } = await res.json();

      const resource: ResourceItem = {
        id: crypto.randomUUID(),
        title: title.trim() || file.name,
        description: description.trim(),
        key,
        type: inferType(file.name),
        uploadedAt: new Date().toISOString(),
      };

      const next: Manifest = {
        sections: (manifest?.sections ?? []).map((s) =>
          s.id === sectionId ? { ...s, resources: [...s.resources, resource] } : s
        ),
      };
      await apiFetch("PUT", "/api/admin/manifest", pw, next);
      setManifest(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-80 space-y-4">
          <h1 className="font-heading text-2xl text-ink text-center">Resources Admin</h1>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            autoFocus
            className="w-full border border-border px-3 py-2 text-ink focus:outline-none focus:border-accent"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={login}
            disabled={busy}
            className="w-full bg-accent text-page py-2 text-sm tracking-widest uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {busy ? "…" : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-accent text-xs tracking-[0.3em] uppercase mb-1">Admin</p>
          <h1 className="font-heading text-4xl text-ink">Resources</h1>
        </div>
        <div className="flex items-center gap-3">
          {busy && <span className="text-ink-muted text-sm">Saving…</span>}
          {addingSectionName === null ? (
            <button
              onClick={() => {
                setAddingSectionName("");
                setTimeout(() => newSectionRef.current?.focus(), 0);
              }}
              disabled={busy}
              className="bg-accent text-page px-4 py-2 text-sm tracking-wider uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              + Add Section
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={newSectionRef}
                value={addingSectionName}
                onChange={(e) => setAddingSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddSection();
                  if (e.key === "Escape") setAddingSectionName(null);
                }}
                placeholder="Section name"
                className="border border-accent px-3 py-2 text-sm text-ink focus:outline-none w-48"
              />
              <button
                onClick={confirmAddSection}
                disabled={busy}
                className="bg-accent text-page px-3 py-2 text-sm tracking-wider uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setAddingSectionName(null)}
                className="text-sm text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm mb-6 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="underline ml-4 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-8">
        {(manifest?.sections ?? []).map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            busy={busy}
            onRename={(h) => renameSection(section.id, h)}
            onDelete={() => deleteSection(section.id)}
            onUpload={(t, d, f) => uploadResource(section.id, t, d, f)}
            onDeleteResource={(rid) => deleteResource(section.id, rid)}
          />
        ))}
        {manifest?.sections.length === 0 && (
          <p className="text-ink-muted text-center py-16 border border-border">
            No sections yet. Click &ldquo;+ Add Section&rdquo; to begin.
          </p>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  busy,
  onRename,
  onDelete,
  onUpload,
  onDeleteResource,
}: {
  section: Section;
  busy: boolean;
  onRename: (heading: string) => void;
  onDelete: () => void;
  onUpload: (title: string, desc: string, file: File) => void;
  onDeleteResource: (id: string) => void;
}) {
  const [heading, setHeading] = useState(section.heading);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function handleUpload() {
    if (!file) return;
    onUpload(title, desc, file);
    setTitle("");
    setDesc("");
    setFile(null);
    setShowForm(false);
  }

  return (
    <div className="border border-border">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface">
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          onBlur={() => heading !== section.heading && onRename(heading)}
          className="flex-1 font-heading text-xl text-ink bg-transparent focus:outline-none border-b border-transparent focus:border-accent pb-0.5"
        />
        <button
          onClick={onDelete}
          className="text-ink-muted hover:text-red-600 text-xs uppercase tracking-wider transition-colors shrink-0"
        >
          Delete Section
        </button>
      </div>

      <div className="divide-y divide-border">
        {section.resources.map((r) => (
          <div key={r.id} className="flex items-start gap-4 px-5 py-4">
            <span className="text-[10px] uppercase tracking-wider border border-border px-1.5 py-0.5 text-ink-muted shrink-0 mt-0.5">
              {r.type}
            </span>
            <div className="flex-1 min-w-0">
              <a
                href={`${PUBLIC_URL}/${r.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-sm font-medium hover:underline"
              >
                {r.title}
              </a>
              {r.description && (
                <p className="text-ink-muted text-xs mt-0.5">{r.description}</p>
              )}
            </div>
            <button
              onClick={() => onDeleteResource(r.id)}
              className="text-ink-muted hover:text-red-600 text-xs transition-colors shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
        {section.resources.length === 0 && !showForm && (
          <p className="px-5 py-4 text-ink-muted text-sm italic">No resources yet.</p>
        )}
      </div>

      {showForm ? (
        <div className="border-t border-border px-5 py-5 bg-surface space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional — defaults to filename)"
            className="w-full border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent resize-none"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-ink-secondary w-full"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || busy}
              className="bg-accent text-page px-4 py-2 text-sm tracking-wider uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={() => setShowForm(true)}
            className="text-accent text-sm hover:underline"
          >
            + Add Resource
          </button>
        </div>
      )}
    </div>
  );
}
