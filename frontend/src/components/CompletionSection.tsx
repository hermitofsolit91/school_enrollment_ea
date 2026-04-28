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
import { COUNTRY_NAMES, DEFAULT_COUNTRY_SELECTION, countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { interpolateColor } from "../utils/colorScale";
import { fmt } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector, { YEARS } from "./ui/YearSelector";
import { asRows, countryColor, field, yearInRange } from "./sectionHelpers";

export default function CompletionSection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);
  const [year, setYear] = useState(2023);

  const countriesParam = countriesToParam(countries);
  const snapApi = useApi<unknown>(ENDPOINTS.completion(countriesParam, year));
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));

  const snapRows = useMemo(() => asRows<Record<string, unknown>>(snapApi.data), [snapApi.data]);
  const trendRows = useMemo(
    () => asRows<Record<string, unknown>>(trendApi.data).filter((r) => yearInRange(Number(r.year), startYear, endYear)),
    [trendApi.data, startYear, endYear],
  );

  const grouped = useMemo(
    () =>
      snapRows.map((r) => ({
        country: String(r.country ?? "N/A"),
        primary: field(r, ["primary_completion_rate", "primary_completion"]),
        lowerSecondary: field(r, ["lower_secondary_completion", "lower_secondary"]),
      })),
    [snapRows],
  );

  const heatYears = YEARS.filter((y) => y >= startYear && y <= endYear);

  const heatMap = useMemo(() => {
    const table = new Map<string, Map<number, number>>();
    for (const row of trendRows) {
      const country = String(row.country ?? "");
      const y = Number(row.year);
      if (!country || Number.isNaN(y)) continue;
      const value = field(row, ["primary_completion_rate", "primary_completion"]);
      if (!table.has(country)) table.set(country, new Map());
      table.get(country)?.set(y, value);
    }
    return COUNTRY_NAMES.filter((c) => countries.includes(c)).map((country) => ({
      country,
      years: heatYears.map((y) => table.get(country)?.get(y) ?? null),
    }));
  }, [trendRows, countries, heatYears]);

  const topPrimaryCompletion = useMemo(
    () => [...grouped].sort((a, b) => b.primary - a.primary)[0],
    [grouped],
  );
  const largestCompletionGap = useMemo(
    () =>
      [...grouped]
        .map((r) => ({ country: r.country, gap: r.primary - r.lowerSecondary }))
        .sort((a, b) => b.gap - a.gap)[0],
    [grouped],
  );

  const loading = snapApi.loading || trendApi.loading;
  const error = snapApi.error ?? trendApi.error;

  return (
    <section id="completion" className="section reveal">
      <div className="section-head">
        <h2>School Completion Rates</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector
            mode="range"
            startYear={startYear}
            endYear={endYear}
            onRangeChange={(s, e) => {
              setStartYear(s);
              setEndYear(e);
              setYear(e);
            }}
          />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={10} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <article className="glass-card chart-card span-2">
            <h3>Primary vs Lower Secondary Completion - Selected Year</h3>
            <YearSelector mode="single" year={year} onYearChange={setYear} />
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={grouped}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="primary" fill="#1B4F72" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="lowerSecondary" fill="#F39C12" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Primary Completion Rate Over Time</h3>
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
                      dataKey={`${country}_primary_completion`}
                      stroke={countryColor(country)}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card heatmap-card">
            <h3>Completion Heatmap</h3>
            <div className="heatmap-table-wrap">
              <table className="heatmap-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    {heatYears.map((y) => (
                      <th key={y}>{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatMap.map((row) => (
                    <tr key={row.country}>
                      <td>{row.country}</td>
                      {row.years.map((v, i) => {
                        const n = v ?? 0;
                        const bg = interpolateColor(n, 30, 100);
                        return (
                          <td key={`${row.country}-${heatYears[i]}`} style={{ background: bg }} title={fmt(v, 1)}>
                            {v == null ? "N/A" : v.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>
              🎯 {topPrimaryCompletion
                ? `${topPrimaryCompletion.country} has the highest primary completion in ${year} at ${topPrimaryCompletion.primary.toFixed(1)}%.`
                : "No primary completion leader is available for this filter."}
            </p>
            <p>
              📚 {largestCompletionGap
                ? `${largestCompletionGap.country} shows the largest primary-to-lower-secondary completion drop at ${largestCompletionGap.gap.toFixed(1)} points.`
                : "No completion-gap statistic is available for this filter."}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
