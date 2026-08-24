export function StorefrontFooter({ handle }: { handle: string }) {
  return (
    <footer
      className="mt-2 flex flex-col items-center gap-2 pt-5 text-center"
      style={{ borderTop: "1px solid var(--hairline)" }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">
        Made with <span className="text-ink-700">DM</span>
      </div>
      <div className="flex gap-3 text-[10.5px] text-ink-300">
        <span>dm.to/{handle}</span>
      </div>
    </footer>
  );
}
