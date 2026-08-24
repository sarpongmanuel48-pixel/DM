// 4B — skeleton while offers sync in. Next.js shows this automatically
// while the page's data-fetching Server Component is pending.
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={{ background: "var(--canvas-soft)", ...style }} />;
}

export default function StorefrontLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-canvas px-5 pt-7">
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <Bone className="rounded-full" style={{ width: 84, height: 84 }} />
        <Bone className="rounded" style={{ width: 150, height: 19, marginTop: 2 }} />
        <Bone className="rounded" style={{ width: 104, height: 12 }} />
        <div className="mt-1 flex flex-col items-center gap-1.5">
          <Bone className="rounded" style={{ width: 250, height: 11 }} />
          <Bone className="rounded" style={{ width: 190, height: 11 }} />
        </div>
      </div>

      <div className="mt-5 w-full max-w-md overflow-hidden rounded-xl border border-hairline bg-white">
        <Bone style={{ height: 132 }} />
        <div className="flex flex-col gap-2.5 p-4">
          <Bone className="rounded-full" style={{ width: 86, height: 18 }} />
          <Bone className="rounded" style={{ width: 196, height: 19 }} />
          <Bone className="rounded" style={{ width: "100%", height: 11 }} />
          <div className="mt-1 flex items-center justify-between">
            <Bone className="rounded" style={{ width: 64, height: 16 }} />
            <Bone className="rounded-full" style={{ width: 78, height: 38 }} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex w-full max-w-md flex-col gap-2.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-hairline bg-white p-3.5" style={{ opacity: i === 1 ? 0.72 : 1 }}>
            <Bone className="flex-none rounded-md" style={{ width: 46, height: 46 }} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Bone className="rounded" style={{ width: 150, height: 13 }} />
              <Bone className="rounded" style={{ width: 104, height: 10 }} />
            </div>
            <Bone className="flex-none rounded-full" style={{ width: 62, height: 32 }} />
          </div>
        ))}
      </div>

      <div className="mt-6 mb-8 flex items-center gap-2 text-[11.5px] text-ink-400">
        <span
          className="inline-block rounded-full"
          style={{ width: 13, height: 13, border: "2px solid var(--hairline-strong)", borderTopColor: "var(--ink-400)", animation: "dm-spin 0.8s linear infinite" }}
        />
        loading offers
      </div>
      <style>{`@keyframes dm-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
