/**
 * Storefront pages live at the bare root (`dm.to/[handle]`), so any word
 * that's also a real top-level route in this app must be blocked as a
 * handle choice — otherwise a creator picking e.g. "dashboard" would make
 * their own page unreachable (Next.js resolves the static /dashboard route
 * before the dynamic /[handle] one). Checked by the live availability
 * check on the handle field (2C) and re-validated server-side on claim.
 */
export const RESERVED_HANDLES = new Set([
  "dashboard",
  "onboarding",
  "sign-up",
  "sign-in",
  "api",
  "connect",
  "importing",
  "handle",
  "done",
  "home",
  "editor",
  "offers",
  "analytics",
  "settings",
  "terms",
  "privacy",
  "favicon.ico",
]);

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;

export function isValidHandleFormat(handle: string): boolean {
  return HANDLE_PATTERN.test(handle);
}

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}
