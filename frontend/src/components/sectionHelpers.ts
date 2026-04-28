import { COUNTRY_COLORS, COUNTRY_NAMES, type CountryName } from "../constants/countries";

export function asRows<T = Record<string, unknown>>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

export function countryColor(country?: string): string {
  if (!country) return "#1B4F72";
  if (COUNTRY_NAMES.includes(country as CountryName)) {
    return COUNTRY_COLORS[country as CountryName];
  }
  return "#1B4F72";
}

export function yearInRange(year: unknown, startYear: number, endYear: number): boolean {
  if (typeof year !== "number") return false;
  return year >= startYear && year <= endYear;
}

export function maybeNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function field(row: Record<string, unknown>, candidates: string[], fallback = 0): number {
  for (const key of candidates) {
    const n = maybeNumber(row[key]);
    if (n != null) return n;
  }
  return fallback;
}
