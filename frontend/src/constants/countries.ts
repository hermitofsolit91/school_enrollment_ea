export const ALL_COUNTRIES_LABEL = "All Countries";

export const COUNTRIES = [
  { name: "Uganda", iso: "UGA", flag: "🇺🇬", color: "#2E86C1" },
  { name: "Kenya", iso: "KEN", flag: "🇰🇪", color: "#27AE60" },
  { name: "Tanzania", iso: "TZA", flag: "🇹🇿", color: "#F39C12" },
  { name: "Rwanda", iso: "RWA", flag: "🇷🇼", color: "#8E44AD" },
  { name: "Burundi", iso: "BDI", flag: "🇧🇮", color: "#E74C3C" },
  { name: "Ethiopia", iso: "ETH", flag: "🇪🇹", color: "#1ABC9C" },
  { name: "South Sudan", iso: "SSD", flag: "🇸🇸", color: "#D35400" },
] as const;

export type CountryName = (typeof COUNTRIES)[number]["name"];

export const COUNTRY_OPTIONS = [...COUNTRIES];
export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name) as CountryName[];

export const COUNTRY_COLORS = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.color]),
) as Record<CountryName, string>;

export const COUNTRY_FLAGS = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.flag]),
) as Record<CountryName, string>;

export const NAME_TO_ISO = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.iso]),
) as Record<CountryName, string>;

export const ISO_TO_NAME = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso, c.name]),
) as Record<string, CountryName>;

export const DEFAULT_COUNTRY_SELECTION = [...COUNTRY_NAMES] as CountryName[];

export function normalizeSelectedCountries(selected: string[]): CountryName[] {
  const set = new Set(selected.filter((c): c is CountryName => COUNTRY_NAMES.includes(c as CountryName)));
  return COUNTRY_NAMES.filter((c) => set.has(c));
}

export function isAllCountriesSelected(selected: string[]): boolean {
  return normalizeSelectedCountries(selected).length === COUNTRY_NAMES.length;
}

export function countriesToParam(selected: string[]): string {
  const normalized = normalizeSelectedCountries(selected);
  if (normalized.length === COUNTRY_NAMES.length) {
    return "all";
  }
  return normalized.join(",");
}
