import { useMemo } from "react";
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
import { countriesToParam, type CountryName, NAME_TO_ISO, ISO_TO_NAME } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { valueBand } from "../utils/colorScale";
import { asRows, countryColor, field } from "./sectionHelpers";
import "../styles/dashboard.css";

interface LiteracySectionProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export default function LiteracySection({ selectedCountries, selectedYears }: LiteracySectionProps) {
  const countriesParam = countriesToParam(selectedCountries);
  const singleYear = selectedYears[selectedYears.length - 1] || 2023;
  
  const trendApi = useApi<any[]>(ENDPOINTS.trend(countriesParam, "unified_literacy"));
  const literacyApi = useApi<unknown>(ENDPOINTS.literacy(countriesParam, singleYear));
  const completionApi = useApi<unknown>(ENDPOINTS.completion(countriesParam, singleYear));

  // Transform literacy trend data
  const trendRows = useMemo(() => {
    if (!trendApi.data || !Array.isArray(trendApi.data)) return [];
    const yearMap: Record<number, any> = {};
    trendApi.data.forEach(item => {
      const yr = Number(item.year);
      if (!yearMap[yr]) yearMap[yr] = { year: yr };
      const iso = NAME_TO_ISO[item.country as CountryName] || item.iso3 || item.country;
      yearMap[yr][iso] = item.value;
    });
    return Object.values(yearMap)
      .filter(d => selectedYears.includes(d.year))
      .sort((a, b) => a.year - b.year);
  }, [trendApi.data, selectedYears]);
  
  const literacyRows = useMemo(() => asRows<Record<string, unknown>>(literacyApi.data), [literacyApi.data]);
  const completionRows = useMemo(() => asRows<Record<string, unknown>>(completionApi.data), [completionApi.data]);

  const rankingRows = useMemo(
    () => literacyRows.map((r) => ({
      country: String(r.country ?? "N/A"),
      value: field(r, ["literacy_rate_adult", "adult_literacy_rate", "value"]),
    })).sort((a, b) => b.value - a.value),
    [literacyRows],
  );

  const radarRows = useMemo(
    () => completionRows.map((r) => ({
      country: String(r.country ?? "N/A"),
      primary_enrollment: field(r, ["primary_enrollment_rate", "primary"]),
      adult_literacy: field(r, ["literacy_rate_adult", "adult_literacy_rate"]),
      completion_rate: field(r, ["primary_completion_rate", "completion_rate"]),
      secondary_enrollment: field(r, ["secondary_enrollment_rate", "secondary"]),
    })),
    [completionRows],
  );

  const literacyLeader = rankingRows[0];
  const selectedIsos = selectedCountries.map(c => NAME_TO_ISO[c]);

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>Literacy Rates Analysis</h2>
      </div>

      <div className="chart-main-area">
        <div className="flex flex-col gap-8">
          <div className="h-[360px] mb-12">
            <h3>Comprehensive Literacy Trend (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendRows}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                {selectedIsos.map((iso3) => (
                  <Line
                    key={iso3}
                    dataKey={iso3}
                    name={iso3}
                    stroke={countryColor(ISO_TO_NAME[iso3] || iso3)}
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <h3>Ranking ({singleYear})</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={rankingRows} margin={{ left: 24 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} />
                  <YAxis dataKey="country" type="category" width={95} tick={{ fill: '#64748b' }} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {rankingRows.map((entry) => {
                      const band = valueBand(entry.value);
                      const fill = band === "high" ? "#27AE60" : band === "mid" ? "#F39C12" : "#C0392B";
                      return <Cell key={entry.country} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
              <h3>Indicator Profile ({singleYear})</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarRows}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="country" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }} />
                  <Radar dataKey="primary_enrollment" stroke="#1B4F72" fill="#1B4F72" fillOpacity={0.2} name="Primary" />
                  <Radar dataKey="adult_literacy" stroke="#27AE60" fill="#27AE60" fillOpacity={0.2} name="Literacy" />
                  <Radar dataKey="completion_rate" stroke="#F39C12" fill="#F39C12" fillOpacity={0.2} name="Completion" />
                  <Legend iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Literacy Insights</div>
          <p className="explanation-text">
            {literacyLeader
              ? `${literacyLeader.country} leads the region at ${literacyLeader.value.toFixed(1)}%.`
              : "Regional literacy metrics."}
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">About the Chart</div>
          <p className="explanation-text">
            Data is dynamically synchronized with the sidebar filters.
          </p>
        </div>
      </div>
    </div>
  );
}
