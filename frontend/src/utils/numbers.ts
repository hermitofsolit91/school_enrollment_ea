export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(1);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `$${(value / 1e6).toFixed(1)}M`;
}
