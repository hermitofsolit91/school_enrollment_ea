import { useMemo } from "react";
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
import { countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { pct } from "../utils/formatNumber";
import { asRows, field } from "./sectionHelpers";
import "../styles/dashboard.css";

interface GenderGapSectionProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export default function GenderGapSection({ selectedCountries, selectedYears }: GenderGapSectionProps) {
  const countriesParam = countriesToParam(selectedCountries);
  const year = selectedYears[selectedYears.length - 1] || 2023;

  const snapshotApi = useApi<unknown>(ENDPOINTS.genderGap(countriesParam, year));

  const rows = useMemo(() => asRows<Record<string, unknown>>(snapshotApi.data), [snapshotApi.data]);
  const ranking = useMemo(
    () =>
      [...rows]
        .map((r) => ({
          country: String(r.country ?? "N/A"),
          male: field(r, ["literacy_rate_youth_male", "male"]),
          female: field(r, ["literacy_rate_youth_female", "female"]),
          gap: field(r, ["gap", "gender_gap"]),
        }))
        .sort((a, b) => b.gap - a.gap),
    [rows],
  );

  const largest = ranking[0];
  const parity = [...ranking].sort((a, b) => Math.abs(a.gap) - Math.abs(b.gap))[0];

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>Gender Gap in Education</h2>
      </div>

      <div className="chart-main-area">
        <div className="chart-container">
          <h3 className="mb-4">Gender Literacy Gap Ranking ({year})</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranking} layout="vertical" margin={{ left: 32 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis type="number" domain={[-100, 100]} tick={{ fill: '#64748b' }} />
              <YAxis type="category" dataKey="country" width={95} tick={{ fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="female" fill="#E56B8A" radius={[0, 6, 6, 0]} name="Female Literacy" />
              <Bar dataKey="male" fill="#2E86C1" radius={[0, 6, 6, 0]} name="Male Literacy" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Gender Disparity</div>
          <p className="explanation-text">
            {largest ? `${largest.country} has the largest gender gap at ${pct(largest.gap)} in ${year}.` : "Gender parity is a key goal for inclusive development."}
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">Progress Indicators</div>
          <p className="explanation-text">
            {parity ? `${parity.country} has achieved near gender parity at ${pct(parity.gap)}.` : "Tracking gaps helps identify where targeted interventions are needed."}
          </p>
        </div>
        
        <div className="explanation-block mt-auto">
           <p className="explanation-text text-sm font-semibold text-primary">
            Sync: Following sidebar filters.
          </p>
        </div>
      </div>
    </div>
  );
}
