import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface ChecklistItem {
  label: string;
  done: boolean;
  href?: string;
}

// 4D — "Three things worth doing now", shown on a first-run dashboard.
export function OnboardingChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-white">
      <div className="border-b border-hairline p-4.5 text-[13.5px] font-semibold text-ink-900">
        Three things worth doing now
      </div>
      {items.map((item, i) => (
        <div
          key={item.label}
          className="flex items-center gap-3.5 p-4.5"
          style={{ borderTop: i > 0 ? "1px solid var(--hairline)" : undefined }}
        >
          <span
            className="flex flex-none items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              background: item.done ? "var(--success-soft)" : "transparent",
              color: "var(--success)",
              border: item.done ? undefined : "1.5px solid var(--hairline-strong)",
            }}
          >
            {item.done && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l5 5L19 7" />
              </svg>
            )}
          </span>
          <div
            className="min-w-0 flex-1 text-[13.5px]"
            style={{
              color: item.done ? "var(--ink-500)" : "var(--ink-900)",
              fontWeight: item.done ? 400 : 600,
              textDecoration: item.done ? "line-through" : undefined,
            }}
          >
            {item.label}
          </div>
          {item.done ? (
            <span className="font-mono text-[11.5px] text-ink-300">done</span>
          ) : item.href ? (
            <Link href={item.href} className={buttonVariants({ variant: "utility" })}>
              Open editor
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}
