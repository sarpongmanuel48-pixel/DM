import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminForCreatorAnyPlatform } from "@/lib/creator-auth";
import { ACCENT_COLOR_PRESETS, isValidHexColor } from "@/lib/creator-accent";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Curated presets first, full custom color for anyone who wants it —
 * matches Linktree's actual editor pattern (checked directly, not
 * assumed). Each preset is its own single-swatch form so a tap saves
 * immediately, the same requireAdminForCreatorAnyPlatform-gated
 * server-action pattern SaveIdentityForm.tsx uses, no client-side JS needed.
 */
export function AppearanceForm({ creatorId, accentColor }: { creatorId: string; accentColor: string }) {
  async function savePreset(hex: string) {
    "use server";
    await requireAdminForCreatorAnyPlatform(creatorId, await headers());
    if (!isValidHexColor(hex)) return;
    await prisma.creator.update({ where: { id: creatorId }, data: { accentColor: hex } });
  }

  async function saveCustom(formData: FormData) {
    "use server";
    await requireAdminForCreatorAnyPlatform(creatorId, await headers());
    const hex = String(formData.get("customColor") ?? "");
    if (!isValidHexColor(hex)) return;
    await prisma.creator.update({ where: { id: creatorId }, data: { accentColor: hex } });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-white p-5">
      <h2 className="text-[13.5px] font-semibold text-ink-900">Appearance</h2>
      <div className="flex flex-col gap-1.5">
        <Label>Accent color</Label>
        <p className="text-xs text-ink-500">Every button and price on your page uses this color.</p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          {ACCENT_COLOR_PRESETS.map((preset) => {
            const selected = accentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <form key={preset.hex} action={savePreset.bind(null, preset.hex)}>
                <button
                  type="submit"
                  title={preset.label}
                  aria-label={`Use ${preset.label} accent`}
                  aria-pressed={selected}
                  className="flex-none cursor-pointer rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    background: preset.hex,
                    border: selected ? "2px solid var(--ink-900)" : "2px solid #fff",
                    boxShadow: selected ? "0 0 0 1px var(--ink-900)" : "0 0 0 1px var(--hairline-strong)",
                  }}
                />
              </form>
            );
          })}

          <span className="mx-1 h-6 w-px flex-none" style={{ background: "var(--hairline)" }} />

          <form action={saveCustom} className="flex flex-none items-center gap-2">
            <input
              type="color"
              name="customColor"
              defaultValue={accentColor}
              aria-label="Custom accent color"
              className="cursor-pointer"
              style={{ width: 30, height: 30, padding: 0, border: "none", borderRadius: 9999, overflow: "hidden" }}
            />
            <Button type="submit" variant="utility">
              Use custom
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
