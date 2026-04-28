const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
const KEY = import.meta.env.VITE_API_KEY ?? "";

export const HEADERS = {
  "X-API-Key": KEY,
  "Content-Type": "application/json",
};

function p(obj: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      params.append(k, String(v));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const EP = {
  status: `${BASE}/api/status`,
  summary: `${BASE}/api/summary`,
  enrollment: (countries?: string, year?: number) =>
    `${BASE}/api/enrollment${p({ countries, year })}`,
  literacy: (countries?: string, year?: number) =>
    `${BASE}/api/literacy${p({ countries, year })}`,
  trend: (countries: string) => `${BASE}/api/trend${p({ countries })}`,
  genderGap: (countries?: string, year?: number) =>
    `${BASE}/api/gender-gap${p({ countries, year })}`,
  outOfSchool: (countries?: string, year?: number) =>
    `${BASE}/api/out-of-school${p({ countries, year })}`,
  completion: (countries?: string, year?: number) =>
    `${BASE}/api/completion${p({ countries, year })}`,
  expenditure: (countries?: string) =>
    `${BASE}/api/expenditure${p({ countries })}`,
  ranking: (metric: string, year: number) =>
    `${BASE}/api/ranking?metric=${metric}&year=${year}`,
  correlation: `${BASE}/api/correlation`,
  publicInfo: `${BASE}/api/public-info`,
};

export const ENDPOINTS = EP;

export const API_BASE = BASE;
