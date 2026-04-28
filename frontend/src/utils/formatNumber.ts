export function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(decimals)}K`;
  return n.toFixed(decimals);
}

export const pct = (n: number | null | undefined): string =>
  n == null || Number.isNaN(n) ? "N/A" : `${n.toFixed(1)}%`;

export const num = (n: number | null | undefined): string =>
  n == null || Number.isNaN(n) ? "N/A" : n.toLocaleString();
