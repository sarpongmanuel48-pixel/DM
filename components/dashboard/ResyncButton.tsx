"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ResyncButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [justSynced, setJustSynced] = useState(false);

  return (
    <Button
      type="button"
      variant="utility"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(`/api/dashboard/${companyId}/sync`, { method: "POST" });
          setJustSynced(true);
          router.refresh();
          setTimeout(() => setJustSynced(false), 2000);
        });
      }}
    >
      {pending ? "Syncing…" : justSynced ? "Synced" : "Re-sync now"}
    </Button>
  );
}
