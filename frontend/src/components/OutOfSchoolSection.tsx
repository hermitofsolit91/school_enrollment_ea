import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ENDPOINTS } from "../constants/api";
import { DEFAULT_COUNTRY_SELECTION, countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { fmt } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { asRows, countryColor, field } from "./sectionHelpers";

export default function OutOfSchoolSection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [year, setYear] = useState(2023);
  const countriesParam = countriesToParam(countries);

  const snapApi = useApi<unknown>(ENDPOINTS.outOfSchool(countriesParam, year));
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));

  const rows = useMemo(() => asRows<Record<string, unknown>>(snapApi.data), [snapApi.data]);
  const trendRows = useMemo(() => asRows<Record<string, unknown>>(trendApi.data), [trendApi.data]);

  const chartRows = useMemo(
    () =>
      rows.map((r) => ({
        country: String(r.country ?? "N/A"),
        female: field(r, ["female", "female_out_of_school"]),
        male: field(r, ["male", "male_out_of_school"]),
      })),
    [rows],
  );

  const donut = useMemo(() => {
    const female = chartRows.reduce((sum, row) => sum + row.female, 0);
    const male = chartRows.reduce((sum, row) => sum + row.male, 0);
    return [
      { name: "Female", value: female, color: "#E56B8A" },
      { name: "Male", value: male, color: "#2E86C1" },
    ];
  }, [chartRows]);

  const total = donut[0].value + donut[1].value;
  const femaleShare = total > 0 ? (donut[0].value / total) * 100 : 0;
  const highestBurden = useMemo(
    () =>
      [...chartRows]
        .map((row) => ({ country: row.country, total: row.female + row.male }))
        .sort((a, b) => b.total - a.total)[0],
    [chartRows],
  );

  const loading = snapApi.loading || trendApi.loading;
  const error = snapApi.error ?? trendApi.error;

  return (
    <section id="out-of-school" className="section reveal">
      <div className="section-head">
        <h2>Out-of-School Children</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector mode="single" year={year} onYearChange={setYear} />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={10} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <div className="kpi-banner span-2">Total out-of-school children in East Africa for {year}: {fmt(total, 1)}M</div>

          <article className="glass-card chart-card span-2">
            <h3>Out-of-School Children by Country - Selected Year</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="female" stackId="a" fill="#E56B8A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="male" stackId="a" fill="#2E86C1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Female Proportion of Out-of-School Children</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" outerRadius={90} innerRadius={52}>
                    {donut.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Out-of-School Children Trend Over Time</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  {countries.map((country) => (
                    <Line
                      key={country}
                      dataKey={`${country}_out_of_school`}
                      stroke={countryColor(country)}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>
              👧 In {year}, girls account for about {femaleShare.toFixed(1)}% of reported out-of-school children across the selected countries.
            </p>
            <p>
              📍 {highestBurden
                ? `${highestBurden.country} has the largest out-of-school burden at roughly ${fmt(highestBurden.total, 1)} children.`
                : "No out-of-school burden statistic is available for this filter."}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
