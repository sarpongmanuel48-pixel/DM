"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DisconnectButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="qbx-btn qbx-btn--utility">
        Disconnect
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-500">Your page stays live with frozen prices.</span>
      <button
        type="button"
        disabled={pending}
        className="qbx-btn qbx-btn--danger qbx-btn--sm"
        onClick={() =>
          startTransition(async () => {
            await fetch("/api/whop/disconnect", { method: "POST" });
            router.refresh();
          })
        }
      >
        {pending ? "Disconnecting…" : "Confirm disconnect"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-xs text-ink-400">
        Cancel
      </button>
    </div>
  );
}
