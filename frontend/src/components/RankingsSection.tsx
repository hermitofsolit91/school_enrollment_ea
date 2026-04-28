import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ENDPOINTS } from "../constants/api";
import { COUNTRY_FLAGS, type CountryName, DEFAULT_COUNTRY_SELECTION } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { fmt } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { asRows, field } from "./sectionHelpers";

const METRICS = [
  ["primary_enrollment_rate", "Primary Enrollment Rate"],
  ["adult_literacy_rate", "Adult Literacy Rate"],
  ["secondary_enrollment_rate", "Secondary Enrollment"],
  ["tertiary_enrollment_rate", "Tertiary Enrollment"],
  ["primary_completion_rate", "Primary Completion Rate"],
  ["lower_secondary_completion", "Lower Secondary Completion"],
  ["out_of_school_primary", "Out of School Children"],
  ["govt_education_expenditure", "Govt Education Expenditure"],
] as const;

export default function RankingsSection() {
  const [metric, setMetric] = useState<(typeof METRICS)[number][0]>(METRICS[0][0]);
  const [year, setYear] = useState(2023);
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);

  const rankApi = useApi<unknown>(ENDPOINTS.ranking(metric, year));
  const prevApi = useApi<unknown>(ENDPOINTS.ranking(metric, Math.max(2010, year - 1)));

  const rows = useMemo(() => asRows<Record<string, unknown>>(rankApi.data), [rankApi.data]);
  const prevRows = useMemo(() => asRows<Record<string, unknown>>(prevApi.data), [prevApi.data]);

  const filtered = useMemo(() => {
    const prevMap = new Map(prevRows.map((r) => [String(r.country ?? ""), field(r, ["value", metric])]));
    return rows
      .map((r, idx) => {
        const country = String(r.country ?? "N/A");
        const value = field(r, ["value", metric]);
        return {
          rank: idx + 1,
          country,
          value,
          change: value - (prevMap.get(country) ?? value),
        };
      })
      .filter((r) => countries.includes(r.country as CountryName));
  }, [rows, prevRows, metric, countries]);

  const sortedRows = [...filtered].sort((a, b) => a.rank - b.rank);
  const metricLabel = METRICS.find(([key]) => key === metric)?.[1] ?? "Selected metric";
  const leader = sortedRows[0];
  const biggestImprover = useMemo(
    () => [...sortedRows].sort((a, b) => b.change - a.change)[0],
    [sortedRows],
  );

  const loading = rankApi.loading || prevApi.loading;
  const error = rankApi.error ?? prevApi.error;

  return (
    <section id="rankings" className="section reveal">
      <div className="section-head">
        <h2>Country Rankings</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <div className="metric-select">
            <label htmlFor="metric-select">Metric</label>
            <select
              id="metric-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value as (typeof METRICS)[number][0])}
            >
              {METRICS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <YearSelector mode="single" year={year} onYearChange={setYear} />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={8} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <article className="glass-card chart-card span-2">
            <h3>Animated Ranking Bars</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={sortedRows} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="country" width={110} />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#rankGradient)" radius={[0, 6, 6, 0]} isAnimationActive />
                  <defs>
                    <linearGradient id="rankGradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#1B4F72" />
                      <stop offset="100%" stopColor="#F39C12" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card span-2">
            <h3>Ranking Table</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Country</th>
                    <th>Value</th>
                    <th>Change from Previous Year</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row) => {
                    const badge = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : "";
                    const flag = COUNTRY_FLAGS[row.country as CountryName] ?? "";
                    return (
                      <tr key={row.country}>
                        <td>{row.rank}</td>
                        <td>
                          {badge} {flag} {row.country}
                        </td>
                        <td>{fmt(row.value, 2)}</td>
                        <td>{row.change >= 0 ? `↑ ${fmt(row.change, 2)}` : `↓ ${fmt(Math.abs(row.change), 2)}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>
              🏆 {leader
                ? `${leader.country} leads ${metricLabel.toLowerCase()} in ${year} with a value of ${fmt(leader.value, 2)}.`
                : "No ranking leader is available for this filter."}
            </p>
            <p>
              🔄 {biggestImprover
                ? `${biggestImprover.country} shows the strongest year-on-year shift at ${biggestImprover.change >= 0 ? `+${fmt(biggestImprover.change, 2)}` : fmt(biggestImprover.change, 2)}.`
                : "No year-on-year change statistic is available for this filter."}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
