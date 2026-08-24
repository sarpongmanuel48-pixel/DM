"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface EditorLink {
  id: string;
  label: string;
  url: string;
}

export function LinksEditor({ companyId, links: initial }: { companyId: string; links: EditorLink[] }) {
  const router = useRouter();
  const [links, setLinks] = useState(initial);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function addLink() {
    if (!label || !url) return;
    const res = await fetch(`/api/dashboard/${companyId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    if (res.ok) {
      const created = (await res.json()) as EditorLink;
      setLinks((prev) => [...prev, created]);
      setLabel("");
      setUrl("");
      router.refresh();
    }
  }

  async function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2.5">
      {links.map((link) => (
        <div key={link.id} className="flex items-center gap-3 rounded-md border border-hairline p-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink-900">{link.label}</div>
            <div className="truncate text-[11px] text-ink-400">{link.url}</div>
          </div>
          <button type="button" onClick={() => removeLink(link.id)} className="qbx-iconbtn qbx-iconbtn--ghost qbx-iconbtn--sm flex-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. YouTube)"
          className="qbx-input"
          style={{ flex: "0 0 40%" }}
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="qbx-input"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addLink} className="qbx-btn qbx-btn--utility flex-none">
          Add
        </button>
      </div>
    </div>
  );
}
