/**
 * Single source of truth for a creator's `--creator-accent` — the color
 * their storefront/live-preview CTAs and prices render in, per
 * `Creator.accentColor`. `DEFAULT_ACCENT_COLOR` matches the `#e2680c`
 * app/globals.css's own header comment documents as the value the design
 * handoff's original per-creator accent token was fixed to when DM first
 * built the storefront — using it here means a creator who's never
 * touched Appearance sees exactly the same color as before this field
 * existed, not a new default.
 */
export const DEFAULT_ACCENT_COLOR = "#e2680c";

export const ACCENT_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Coral", hex: "#e2680c" },
  { label: "Indigo", hex: "#4f46e5" },
  { label: "Blue", hex: "#2354e6" },
  { label: "Green", hex: "#16a34a" },
  { label: "Purple", hex: "#6b57e0" },
  { label: "Pink", hex: "#e0529e" },
  { label: "Amber", hex: "#e0a015" },
  { label: "Slate", hex: "#1c2238" },
];

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}
