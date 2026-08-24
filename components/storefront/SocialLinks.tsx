// 1.4 — social/other links, secondary weight, below the offers. Known
// platforms render as icon-only circles (matching 1A); anything else falls
// back to a labeled pill so arbitrary custom links still work.
function platformIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("youtube")) {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10.5 9.2l5 2.8-5 2.8z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (l.includes("x") || l.includes("twitter")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-6.9 7.9L22.7 22h-6.4l-4.6-6.4L6 22H2.9l7.3-8.3L1.6 2h6.5l4.3 6z" />
      </svg>
    );
  }
  if (l.includes("instagram")) {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    );
  }
  if (l.includes("tiktok")) {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
        <path d="M9 9.5a4 4 0 1 0 4 4V2.5c.6 2.7 2.4 4.3 5.5 4.6" />
      </svg>
    );
  }
  return null;
}

export function SocialLinks({ links }: { links: Array<{ id: string; label: string; url: string }> }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {links.map((link) => {
        const icon = platformIcon(link.label);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-full border no-underline"
            style={{
              borderColor: "var(--hairline)",
              background: "#fff",
              color: "var(--ink-700)",
              width: icon ? 42 : "auto",
              height: 42,
              padding: icon ? undefined : "0 16px",
              gap: 6,
            }}
            title={link.label}
          >
            {icon ?? <span className="text-xs font-medium">{link.label}</span>}
          </a>
        );
      })}
    </div>
  );
}
