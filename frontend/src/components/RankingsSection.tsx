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
import { type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { fmt } from "../utils/formatNumber";
import { asRows, field } from "./sectionHelpers";
import "../styles/dashboard.css";

const METRICS = [
  ["primary_enrollment_rate", "Primary Enrollment Rate"],
  ["unified_literacy", "Comprehensive Literacy Rate"],
  ["secondary_enrollment_rate", "Secondary Enrollment"],
  ["tertiary_enrollment_rate", "Tertiary Enrollment"],
  ["primary_completion_rate", "Primary Completion Rate"],
  ["lower_secondary_completion", "Lower Secondary Completion"],
  ["out_of_school_primary", "Out of School Children"],
  ["govt_education_expenditure", "Govt Education Expenditure"],
] as const;

interface RankingsSectionProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export default function RankingsSection({ selectedCountries, selectedYears }: RankingsSectionProps) {
  const [metric, setMetric] = useState<(typeof METRICS)[number][0]>(METRICS[0][0]);
  const year = selectedYears[selectedYears.length - 1] || 2023;

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
      .filter((r) => selectedCountries.includes(r.country as CountryName));
  }, [rows, prevRows, metric, selectedCountries]);

  const sortedRows = [...filtered].sort((a, b) => a.rank - b.rank);
  const metricLabel = METRICS.find(([key]) => key === metric)?.[1] ?? "Selected metric";
  const leader = sortedRows[0];
  const biggestImprover = useMemo(
    () => [...sortedRows].sort((a, b) => b.change - a.change)[0],
    [sortedRows],
  );

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>Country Rankings Analysis</h2>
      </div>

      <div className="chart-main-area">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
             <select
                id="metric-select-global"
                value={metric}
                onChange={(e) => setMetric(e.target.value as (typeof METRICS)[number][0])}
                className="chart-select-professional"
              >
                {METRICS.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
          </div>

          <div className="chart-container">
            <h3 className="mb-4">{metricLabel} Performance ({year})</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedRows} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#64748b' }} />
                <YAxis type="category" dataKey="country" width={110} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Rankings Leader</div>
          <p className="explanation-text">
            {leader
              ? `${leader.country} leads the region in ${metricLabel.toLowerCase()} for ${year} with a score of ${fmt(leader.value, 2)}.`
              : "Rankings help visualize relative performance across diverse metrics."}
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">Dynamic Shifts</div>
          <p className="explanation-text">
            {biggestImprover
              ? `${biggestImprover.country} shows the most significant shift at ${biggestImprover.change >= 0 ? `+${fmt(biggestImprover.change, 2)}` : fmt(biggestImprover.change, 2)} units.`
              : "Tracking shifts over time reveals the impact of educational policies."}
          </p>
        </div>
        
        <div className="explanation-block mt-auto">
          <p className="explanation-text text-sm font-semibold text-primary">
            Settings: Following global year ({year}).
          </p>
        </div>
      </div>
    </div>
  );
}
