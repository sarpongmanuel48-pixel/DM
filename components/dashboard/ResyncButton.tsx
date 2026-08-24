"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ResyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [justSynced, setJustSynced] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className="qbx-btn qbx-btn--utility"
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/sync", { method: "POST" });
          setJustSynced(true);
          router.refresh();
          setTimeout(() => setJustSynced(false), 2000);
        });
      }}
    >
      {pending ? "Syncing…" : justSynced ? "Synced" : "Re-sync now"}
    </button>
  );
}
