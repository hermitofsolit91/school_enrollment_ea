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
import { asRows, field } from "./sectionHelpers";
import "../styles/dashboard.css";

interface CompletionSectionProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export default function CompletionSection({ selectedCountries, selectedYears }: CompletionSectionProps) {
  const countriesParam = countriesToParam(selectedCountries);
  const year = selectedYears[selectedYears.length - 1] || 2023;
  
  const snapApi = useApi<unknown>(ENDPOINTS.completion(countriesParam, year));

  const snapRows = useMemo(() => asRows<Record<string, unknown>>(snapApi.data), [snapApi.data]);

  const grouped = useMemo(
    () =>
      snapRows.map((r) => ({
        country: String(r.country ?? "N/A"),
        primary: field(r, ["primary_completion_rate", "primary_completion"]),
        lowerSecondary: field(r, ["lower_secondary_completion", "lower_secondary"]),
      })),
    [snapRows],
  );

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

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>School Completion Rates</h2>
      </div>

      <div className="chart-main-area">
        <div className="chart-container">
          <h3 className="mb-4">Primary vs Lower Secondary Completion ({year})</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="primary" fill="#1B4F72" radius={[6, 6, 0, 0]} name="Primary" />
              <Bar dataKey="lowerSecondary" fill="#F39C12" radius={[6, 6, 0, 0]} name="Lower Secondary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Completion Analysis</div>
          <p className="explanation-text">
            {topPrimaryCompletion
              ? `${topPrimaryCompletion.country} leads the region in primary completion at ${topPrimaryCompletion.primary.toFixed(1)}%.`
              : "Completion rates signify the internal efficiency of the education system."}
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">The Transition Gap</div>
          <p className="explanation-text">
            {largestCompletionGap
              ? `${largestCompletionGap.country} faces a significant ${largestCompletionGap.gap.toFixed(1)} point drop between levels.`
              : "The gap between primary and secondary completion highlights transition challenges."}
          </p>
        </div>
        
        <div className="explanation-block mt-auto">
          <p className="explanation-text text-sm font-semibold text-primary">
            Settings: Using global year filter ({year}).
          </p>
        </div>
      </div>
    </div>
  );
}
