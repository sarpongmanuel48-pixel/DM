// Kept out of component bodies — the React Compiler's purity rule flags
// Date.now() called directly during render.
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
