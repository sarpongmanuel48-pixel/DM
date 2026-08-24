"use client";

import { useState } from "react";

export function CopyButton({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
