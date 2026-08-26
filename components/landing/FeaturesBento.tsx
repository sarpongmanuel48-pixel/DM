function TileHeading({ title, body, dark }: { title: string; body: string; dark?: boolean }) {
  return (
    <div>
      <h3
        className="m-0 font-bold"
        style={{ fontFamily: "var(--l-font-display)", fontSize: 24, lineHeight: 1.2, color: dark ? "#fff" : "var(--l-ink)" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-normal" style={{ color: dark ? "rgba(255,255,255,0.6)" : "var(--l-mute)" }}>
        {body}
      </p>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-[1160px] px-8 pt-8 pb-24">
      <div className="grid grid-cols-3 gap-4" style={{ gridAutoRows: 200 }}>
        <div
          className="col-span-2 flex flex-col justify-between rounded-xl p-8"
          style={{ background: "var(--l-gradient-dark)" }}
        >
          <div className="flex gap-2">
            <div className="size-11 rounded-full" style={{ border: "1.5px solid #fff" }} />
            <div className="size-11 rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.35)" }} />
          </div>
          <TileHeading title="Auto-sync" body="Products stay current on their own" dark />
        </div>

        <div className="flex flex-col justify-between rounded-xl p-8" style={{ background: "var(--l-canvas)", boxShadow: "var(--l-shadow-card)" }}>
          <div className="flex gap-1.5">
            <div className="h-10 w-[18px] rounded-full" style={{ background: "var(--l-ink)" }} />
            <div className="h-10 w-[18px] rounded-full" style={{ border: "1.5px solid var(--l-ink)" }} />
            <div className="h-10 w-[18px] rounded-full" style={{ border: "1.5px solid var(--l-stone)" }} />
          </div>
          <TileHeading title="Your colors" body="Not a DM template" />
        </div>

        <div className="flex flex-col justify-between rounded-xl p-8" style={{ background: "var(--l-canvas)", boxShadow: "var(--l-shadow-card)" }}>
          <div
            className="flex size-[42px] items-center justify-center rounded-full"
            style={{ border: "1.5px solid var(--l-ink)" }}
          >
            <div className="size-[10px] rounded-full" style={{ background: "var(--l-ink)" }} />
          </div>
          <TileHeading title="One handle" body="Every product, one link" />
        </div>

        <div className="col-span-2 flex flex-col justify-between rounded-xl p-8" style={{ background: "var(--l-canvas)", boxShadow: "var(--l-shadow-card)" }}>
          <div className="flex h-12 items-end gap-2">
            <div className="w-4 rounded" style={{ height: "40%", border: "1.5px solid var(--l-ink)" }} />
            <div className="w-4 rounded" style={{ height: "70%", border: "1.5px solid var(--l-ink)" }} />
            <div className="w-4 rounded" style={{ height: "100%", background: "var(--l-ink)" }} />
            <div className="w-4 rounded" style={{ height: "55%", border: "1.5px solid var(--l-ink)" }} />
          </div>
          <TileHeading title="Analytics" body="See what gets clicked" />
        </div>
      </div>
    </section>
  );
}
