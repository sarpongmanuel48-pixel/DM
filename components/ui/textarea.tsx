import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Matches qbx-textarea: 10px/12px padding, 15px text, vertical
        // resize, --surface-card bg, --radius-md, 88px min-height.
        "flex min-h-[88px] w-full resize-y rounded-md border border-input bg-[var(--surface-card)] px-3 py-2.5 text-[15px] leading-[1.5] transition-colors outline-none placeholder:text-muted-foreground hover:border-[var(--ink-300)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-[var(--surface-sunken)] disabled:text-[var(--text-faint)] disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
