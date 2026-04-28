import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ENDPOINTS } from "../constants/api";
import { DEFAULT_COUNTRY_SELECTION, countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { pct } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { asRows, countryColor, field } from "./sectionHelpers";

export default function GenderGapSection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [year, setYear] = useState(2023);
  const countriesParam = countriesToParam(countries);

  const snapshotApi = useApi<unknown>(ENDPOINTS.genderGap(countriesParam, year));
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));

  const rows = useMemo(() => asRows<Record<string, unknown>>(snapshotApi.data), [snapshotApi.data]);
  const ranking = useMemo(
    () =>
      [...rows]
        .map((r) => ({
          country: String(r.country ?? "N/A"),
          male: field(r, ["male", "youth_male_literacy"]),
          female: field(r, ["female", "youth_female_literacy"]),
          gap: field(r, ["gender_gap", "gap"]),
        }))
        .sort((a, b) => b.gap - a.gap),
    [rows],
  );
  const trendRows = useMemo(() => asRows<Record<string, unknown>>(trendApi.data), [trendApi.data]);

  const largest = ranking[0];
  const parity = [...ranking].sort((a, b) => Math.abs(a.gap) - Math.abs(b.gap))[0];

  const loading = snapshotApi.loading || trendApi.loading;
  const error = snapshotApi.error ?? trendApi.error;

  return (
    <section id="gender-gap" className="section reveal">
      <div className="section-head">
        <h2>Gender Gap in Education</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector mode="single" year={year} onYearChange={setYear} />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={8} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <article className="glass-card chart-card span-2">
            <h3>Male vs Female Youth Literacy - Selected Year</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={ranking} layout="vertical" margin={{ left: 32 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[-100, 100]} />
                  <YAxis type="category" dataKey="country" width={95} />
                  <Tooltip />
                  <Bar dataKey="female" fill="#E56B8A" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="male" fill="#2E86C1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Gender Literacy Gap Trend Over Time</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  {countries.map((country) => (
                    <Line
                      key={country}
                      dataKey={`${country}_gender_gap`}
                      stroke={countryColor(country)}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Gender Gap Ranking - Selected Year</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ranking}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#C0392B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>⚠️ {largest ? `${largest.country} has the largest gender gap at ${pct(largest.gap)} in ${year}.` : "N/A"}</p>
            <p>✅ {parity ? `${parity.country} has achieved near gender parity at ${pct(parity.gap)}.` : "N/A"}</p>
          </article>
        </div>
      )}
    </section>
  );
}
