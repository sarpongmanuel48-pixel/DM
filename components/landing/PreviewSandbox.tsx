"use client";

import { useState } from "react";
import { PrimaryCta } from "./PrimaryCta";

const DEFAULT_LINES = ["My Notion template", "Coaching call", "Newsletter"];
const ROW_CAP = 4;

export function PreviewSandbox() {
  const [linksText, setLinksText] = useState("");

  const lines = linksText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const rows = (lines.length ? lines : DEFAULT_LINES).slice(0, ROW_CAP);

  return (
    <section style={{ background: "var(--l-surface-soft)", borderTop: "1px solid var(--l-hairline-soft)", borderBottom: "1px solid var(--l-hairline-soft)" }}>
      <div className="mx-auto max-w-[1160px] px-8 py-24">
        <h2
          className="m-0 mb-12 text-center font-bold"
          style={{ fontFamily: "var(--l-font-display)", fontSize: 36, letterSpacing: "-0.6px", color: "var(--l-ink)" }}
        >
          See it before you sign up.
        </h2>
        <div className="grid items-center justify-center gap-16" style={{ gridTemplateColumns: "320px minmax(0, 1fr)" }}>
          <div
            className="flex flex-col rounded-[28px] p-5"
            style={{ width: 320, height: 600, background: "var(--l-canvas)", boxShadow: "var(--l-shadow-float)" }}
          >
            <div className="flex justify-center pb-5">
              <div className="h-2 w-[68px] rounded-full" style={{ background: "var(--l-surface-card)" }} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="size-16 rounded-full" style={{ background: "var(--l-surface-card)" }} />
              <div className="h-[10px] w-[130px] rounded" style={{ background: "var(--l-stone)" }} />
              <div className="h-[10px] w-[90px] rounded" style={{ background: "var(--l-hairline-soft)" }} />
            </div>
            <div className="mt-7 flex flex-1 flex-col gap-2.5">
              {rows.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3.5"
                  style={{ border: "1px solid var(--l-hairline)", background: "var(--l-canvas)" }}
                >
                  <div className="size-5 flex-none rounded-md" style={{ background: "var(--l-surface-card)" }} />
                  <span className="overflow-hidden text-[13px] text-ellipsis whitespace-nowrap" style={{ color: "var(--l-ink)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <PrimaryCta className="mt-4 w-full">Claim your bio</PrimaryCta>
          </div>
          <div className="max-w-[440px]">
            <label className="mb-2.5 block text-xs font-medium" style={{ color: "var(--l-mute)" }}>
              Paste your bio links
            </label>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder={"My Notion template\nCoaching call\nNewsletter\nDiscord community"}
              className="h-[200px] w-full resize-none rounded-xl p-4 text-sm leading-relaxed outline-none"
              style={{ border: "1px solid var(--l-hairline)", color: "var(--l-ink)", background: "var(--l-canvas)" }}
            />
            <p className="mt-3 text-[13px]" style={{ color: "var(--l-mute)" }}>
              One per line. Your page updates as you type — nothing is saved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
