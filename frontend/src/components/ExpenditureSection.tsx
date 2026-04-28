import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
import { asRows, countryColor, field, yearInRange } from "./sectionHelpers";

export default function ExpenditureSection() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);

  const countriesParam = countriesToParam(countries);
  const expenditureApi = useApi<unknown>(ENDPOINTS.expenditure(countriesParam));
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));

  const spendRows = useMemo(
    () => asRows<Record<string, unknown>>(expenditureApi.data).filter((r) => yearInRange(Number(r.year), startYear, endYear)),
    [expenditureApi.data, startYear, endYear],
  );

  const latestYear = useMemo(
    () => spendRows.reduce((max, row) => Math.max(max, Number(row.year ?? 0)), 2010),
    [spendRows],
  );

  const rankRows = useMemo(
    () =>
      spendRows
        .filter((r) => Number(r.year) === latestYear)
        .map((r) => ({
          country: String(r.country ?? "N/A"),
          value: field(r, ["govt_education_expenditure", "expenditure"]),
        }))
        .sort((a, b) => b.value - a.value),
    [spendRows, latestYear],
  );

  const scatterRows = useMemo(() => {
    const trend = asRows<Record<string, unknown>>(trendApi.data);
    return spendRows.map((row) => {
      const country = String(row.country ?? "N/A");
      const year = Number(row.year ?? 0);
      const match = trend.find((t) => String(t.country ?? "") === country && Number(t.year ?? 0) === year);
      return {
        country,
        x: field(row, ["govt_education_expenditure", "expenditure"]),
        y: match ? field(match, ["primary_enrollment_rate", "primary_enrollment"]) : 0,
      };
    });
  }, [spendRows, trendApi.data]);

  const topSpender = rankRows[0];
  const strongestSpendEnrollmentPoint = useMemo(
    () => [...scatterRows].sort((a, b) => b.y - a.y)[0],
    [scatterRows],
  );

  const loading = expenditureApi.loading || trendApi.loading;
  const error = expenditureApi.error ?? trendApi.error;

  return (
    <section id="expenditure" className="section reveal">
      <div className="section-head">
        <h2>Government Education Expenditure</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector
            mode="range"
            startYear={startYear}
            endYear={endYear}
            onRangeChange={(s, e) => {
              setStartYear(s);
              setEndYear(e);
            }}
          />
        </div>
      </div>

      {loading && <LoadingSkeleton lines={9} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="chart-grid">
          <article className="glass-card chart-card span-2">
            <h3>Education Spending as % of GDP Over Time</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={spendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  {countries.map((country) => (
                    <Line
                      key={country}
                      dataKey={`${country}_expenditure`}
                      stroke={countryColor(country)}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Education Spending Ranking - Latest Year</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={rankRows} margin={{ left: 30 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="country" width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F39C12" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card chart-card">
            <h3>Education Spending vs Primary Enrollment</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="expenditure" />
                  <YAxis dataKey="y" name="primary enrollment" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={scatterRows} fill="#1B4F72" />
                  <ReferenceLine y={80} stroke="#27AE60" strokeDasharray="4 3" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card insight-card span-2">
            <p>
              💰 {topSpender
                ? `${topSpender.country} is the top education spender in ${latestYear} at ${topSpender.value.toFixed(2)}% of GDP.`
                : "No expenditure ranking statistic is available for this filter."}
            </p>
            <p>
              📈 {strongestSpendEnrollmentPoint
                ? `${strongestSpendEnrollmentPoint.country} reaches the strongest primary enrollment point in this range at ${strongestSpendEnrollmentPoint.y.toFixed(1)}%.`
                : "No spending-enrollment relationship statistic is available for this filter."}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
