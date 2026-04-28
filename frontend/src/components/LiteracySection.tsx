import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ENDPOINTS } from "../constants/api";
import { DEFAULT_COUNTRY_SELECTION, countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { valueBand } from "../utils/colorScale";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { asRows, countryColor, field, yearInRange } from "./sectionHelpers";

export default function LiteracySection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);
  const [singleYear, setSingleYear] = useState(2023);

  const countriesParam = countriesToParam(countries);
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));
  const literacyApi = useApi<unknown>(ENDPOINTS.literacy(countriesParam, singleYear));
  const completionApi = useApi<unknown>(ENDPOINTS.completion(countriesParam, singleYear));

  const trendRows = useMemo(
    () => asRows<Record<string, unknown>>(trendApi.data).filter((r) => yearInRange(Number(r.year), startYear, endYear)),
    [trendApi.data, startYear, endYear],
  );
  const literacyRows = useMemo(
    () => asRows<Record<string, unknown>>(literacyApi.data),
    [literacyApi.data],
  );
  const completionRows = useMemo(
    () => asRows<Record<string, unknown>>(completionApi.data),
    [completionApi.data],
  );

  const rankingRows = useMemo(
    () =>
      literacyRows
        .map((r) => ({
          country: String(r.country ?? "N/A"),
          value: field(r, ["adult_literacy_rate", "literacy_rate_adult", "value"]),
        }))
        .sort((a, b) => b.value - a.value),
    [literacyRows],
  );

  const radarRows = useMemo(
    () =>
      completionRows.map((r) => ({
        country: String(r.country ?? "N/A"),
        primary_enrollment: field(r, ["primary_enrollment_rate", "primary"]),
        adult_literacy: field(r, ["adult_literacy_rate", "literacy_rate_adult"]),
        completion_rate: field(r, ["primary_completion_rate", "completion_rate"]),
        secondary_enrollment: field(r, ["secondary_enrollment_rate", "secondary"]),
      })),
    [completionRows],
  );

  const literacyLeader = rankingRows[0];
  const widestYouthGap = useMemo(
    () =>
      literacyRows
        .map((r) => {
          const male = field(r, ["literacy_rate_youth_male", "youth_male_literacy"]);
          const female = field(r, ["literacy_rate_youth_female", "youth_female_literacy"]);
          return {
            country: String(r.country ?? "N/A"),
            gap: Math.abs(male - female),
          };
        })
        .sort((a, b) => b.gap - a.gap)[0],
    [literacyRows],
  );

  const loading = trendApi.loading || literacyApi.loading || completionApi.loading;
  const error = trendApi.error ?? literacyApi.error ?? completionApi.error;

  return (
    <section id="literacy" className="section reveal">
      <div className="section-head">
        <h2>Literacy Rates Analysis</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector
            mode="range"
            startYear={startYear}
            endYear={endYear}
            onRangeChange={(s, e) => {
              setStartYear(s);
              setEndYear(e);
              setSingleYear(e);
            }}
          />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={10} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <article className="glass-card chart-card span-2">
            <h3>Adult Literacy Rate Over Time (%)</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={trendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {countries.map((country) => (
                    <Line
                      key={country}
                      dataKey={`${country}_adult_literacy`}
                      name={country}
                      stroke={countryColor(country)}
                      strokeWidth={2.5}
                      dot={false}
                      type="monotone"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Adult Literacy Ranking - Selected Year</h3>
            <YearSelector mode="single" year={singleYear} onYearChange={setSingleYear} />
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={rankingRows} margin={{ left: 24 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={95} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {rankingRows.map((entry) => {
                      const band = valueBand(entry.value);
                      const fill = band === "high" ? "#27AE60" : band === "mid" ? "#F39C12" : "#C0392B";
                      return <Cell key={entry.country} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Youth Literacy: Male vs Female Over Time</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  {countries.slice(0, 4).map((country) => (
                    <LineChartFragment key={country} country={country} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card span-2">
            <h3>Multi-Indicator Education Profile - Selected Year</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarRows}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="country" />
                  <PolarRadiusAxis />
                  <Tooltip />
                  <Radar dataKey="primary_enrollment" stroke="#1B4F72" fill="#1B4F72" fillOpacity={0.2} />
                  <Radar dataKey="adult_literacy" stroke="#27AE60" fill="#27AE60" fillOpacity={0.2} />
                  <Radar dataKey="completion_rate" stroke="#F39C12" fill="#F39C12" fillOpacity={0.2} />
                  <Radar dataKey="secondary_enrollment" stroke="#8E44AD" fill="#8E44AD" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>
              📖 {literacyLeader
                ? `${literacyLeader.country} has the highest reported adult literacy in ${singleYear} at ${literacyLeader.value.toFixed(1)}%.`
                : "No adult literacy leader is available for this filter."}
            </p>
            <p>
              ⚖️ {widestYouthGap
                ? `${widestYouthGap.country} records the widest youth literacy gender gap at ${widestYouthGap.gap.toFixed(1)} percentage points.`
                : "No youth gender gap statistic is available for this filter."}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}

function LineChartFragment({ country }: { country: string }) {
  return (
    <>
                      <Line key={`${country}-m`} dataKey={`${country}_youth_male`} stroke={countryColor(country)} dot={false} />
                      <Line
                        key={`${country}-f`}
                        dataKey={`${country}_youth_female`}
                        stroke={countryColor(country)}
                        strokeDasharray="6 4"
                        dot={false}
                      />
    </>
  );
}
