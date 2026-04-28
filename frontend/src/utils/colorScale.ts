// Teal color scale for dashboard
export const TEAL_SCALE = {
  low: "#9FE1CB",      // light teal
  mid: "#1D9E75",      // mid teal
  high: "#085041",     // dark teal
};

// Cluster colors
export const CLUSTER_COLORS: Record<string, string> = {
  "High Performer": "#1D9E75",   // teal
  "Mid Tier": "#F59E0B",         // amber
  "Needs Attention": "#FB6B5F",  // coral
};

export const CLUSTER_BG_COLORS: Record<string, string> = {
  "High Performer": "#D1FAE5",   // light teal
  "Mid Tier": "#FEF3C7",         // light amber
  "Needs Attention": "#FFEBE8",  // light coral
};

// Legacy function - kept for compatibility
export function interpolateColor(value: number, min: number, max: number): string {
  if (Number.isNaN(value)) return "#ffffff";
  const t = max === min ? 0.5 : Math.max(0, Math.min(1, (value - min) / (max - min)));

  const start = { r: 192, g: 57, b: 43 };
  const mid = { r: 255, g: 255, b: 255 };
  const end = { r: 27, g: 79, b: 114 };

  if (t <= 0.5) {
    const u = t * 2;
    const r = Math.round(start.r + (mid.r - start.r) * u);
    const g = Math.round(start.g + (mid.g - start.g) * u);
    const b = Math.round(start.b + (mid.b - start.b) * u);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const u = (t - 0.5) * 2;
  const r = Math.round(mid.r + (end.r - mid.r) * u);
  const g = Math.round(mid.g + (end.g - mid.g) * u);
  const b = Math.round(mid.b + (end.b - mid.b) * u);
  return `rgb(${r}, ${g}, ${b})`;
}

// New teal interpolation
export function interpolateTealColor(value: number, min: number, max: number): string {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  };

  const [r1, g1, b1] = hexToRgb(TEAL_SCALE.low);
  const [r2, g2, b2] = hexToRgb(TEAL_SCALE.high);

  const r = Math.round(r1 + (r2 - r1) * normalized);
  const g = Math.round(g1 + (g2 - g1) * normalized);
  const b = Math.round(b1 + (b2 - b1) * normalized);

  return rgbToHex(r, g, b);
}

export function valueBand(value: number | null | undefined): "low" | "mid" | "high" {
  if (value == null || Number.isNaN(value)) return "low";
  if (value < 60) return "low";
  if (value < 80) return "mid";
  return "high";
}
