import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { LeftPanel, RightPanel } from "./SectionWithPanels";
import { asRows, countryColor, field, yearInRange } from "./sectionHelpers";

export default function EnrollmentSection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);
  const [singleYear, setSingleYear] = useState(2023);

  const countriesParam = countriesToParam(countries);

  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));
  const enrollmentApi = useApi<unknown>(ENDPOINTS.enrollment(countriesParam, singleYear));

  const trendRows = useMemo(() => {
    return asRows<Record<string, unknown>>(trendApi.data).filter((r) =>
      yearInRange(Number(r.year), startYear, endYear),
    );
  }, [trendApi.data, startYear, endYear]);

  const enrollmentRows = useMemo(
    () => asRows<Record<string, unknown>>(enrollmentApi.data),
    [enrollmentApi.data],
  );

  const comparisonRows = useMemo(
    () => enrollmentRows.map((r) => ({
      country: String(r.country ?? "N/A"),
      primary: field(r, ["primary", "primary_enrollment_rate"]),
      secondary: field(r, ["secondary", "secondary_enrollment_rate"]),
      tertiary: field(r, ["tertiary", "tertiary_enrollment_rate"]),
    })),
    [enrollmentRows],
  );

  const topPrimary = useMemo(
    () => [...comparisonRows].sort((a, b) => b.primary - a.primary)[0],
    [comparisonRows],
  );
  const steepestDrop = useMemo(
    () =>
      [...comparisonRows]
        .map((r) => ({ country: r.country, drop: r.primary - r.secondary }))
        .sort((a, b) => b.drop - a.drop)[0],
    [comparisonRows],
  );

  const loading = trendApi.loading || enrollmentApi.loading;
  const error = trendApi.error ?? enrollmentApi.error;

  return (
    <section id="enrollment" className="section reveal">
      <div className="section-head">
        <h2>School Enrollment Trends</h2>
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
        <div className="section-with-panels">
          <LeftPanel
            title="About This Data"
            statHighlight="7 Countries · 13 Years of Data · World Bank Source"
          >
            <p>
              School enrollment rates measure the percentage of school-age children actually enrolled in primary, secondary, and tertiary education. These rates reveal patterns of educational access and transition between education levels.
            </p>
            <p>
              Data comes from the World Bank Open Data platform, spanning 2010–2023 across Uganda, Kenya, Tanzania, Rwanda, Burundi, Ethiopia, and South Sudan. Enrollment patterns vary significantly by country and education level.
            </p>
            <p>
              Use the country and year selectors above to filter the visualizations and explore regional trends, enrollment disparities, and the primary-to-secondary transition challenges.
            </p>
          </LeftPanel>

          <div className="chart-grid">
            <article className="glass-card chart-card span-2">
              <h3>Primary Enrollment Rate Over Time (%)</h3>
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
                        dataKey={`${country}_primary`}
                        name={country}
                        stroke={countryColor(country)}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-card chart-card">
              <h3>Enrollment by Level - Selected Year</h3>
              <YearSelector mode="single" year={singleYear} onYearChange={setSingleYear} />
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonRows}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="primary" fill="#1B4F72" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="secondary" fill="#F39C12" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="tertiary" fill="#27AE60" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-card chart-card">
              <h3>Enrollment Drop-off: Primary → Secondary</h3>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendRows}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    {countries.map((country) => (
                      <Area
                        key={country}
                        dataKey={`${country}_drop_off`}
                        name={country}
                        stroke={countryColor(country)}
                        fill={countryColor(country)}
                        fillOpacity={0.2}
                        connectNulls
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-card chart-card span-2">
              <h3>Primary vs Secondary Enrollment - Latest Year Comparison</h3>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={comparisonRows} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="country" width={90} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="primary" fill="#2E86C1" radius={[0, 6, 6, 0]} />
                    <Bar dataKey="secondary" fill="#F39C12" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <RightPanel
            title="Key Insights"
            insights={[
              topPrimary
                ? `${topPrimary.country} leads with ${topPrimary.primary.toFixed(1)}% primary enrollment in ${singleYear}.`
                : "Loading primary enrollment data...",
              steepestDrop
                ? `${steepestDrop.country} shows the largest primary-to-secondary transition drop (${steepestDrop.drop.toFixed(1)} percentage points).`
                : "Loading transition data...",
              "Tertiary enrollment significantly lags behind primary and secondary levels across all countries.",
              "Global trends show consistent improvements in primary enrollment over the 2010–2023 period.",
            ]}
            howToUse="💡 Use the country selector to compare specific nations, and the year range slider to track trends over time."
          />
        </div>
      )}
    </section>
  );
}
