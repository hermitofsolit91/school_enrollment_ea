import React, { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "../../hooks/useApi";
import { ENDPOINTS } from "../../constants/api";
import { NAME_TO_ISO, type CountryName } from "../../constants/countries";
import "../../styles/dashboard.css";

interface EnrollmentTrendsProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

const COLORS = [
  "#1B4F72", "#27AE60", "#F39C12", "#8E44AD", "#E74C3C", "#1ABC9C", "#D35400"
];

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const EnrollmentTrends: React.FC<EnrollmentTrendsProps> = ({
  selectedCountries,
  selectedYears,
}) => {
  const countriesParam = selectedCountries.map(c => NAME_TO_ISO[c]).join(",");
  const { data, loading, error } = useApi<any[]>(ENDPOINTS.trend(countriesParam, "primary_enrollment_rate"));

  // Transform flat backend data into Recharts-friendly format
  const transformedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    const yearMap: Record<number, any> = {};
    
    data.forEach(item => {
      const yr = Number(item.year);
      if (!yearMap[yr]) {
        yearMap[yr] = { year: yr };
      }
      const iso = NAME_TO_ISO[item.country as CountryName] || item.iso3 || item.country;
      yearMap[yr][iso] = item.value; // Using 'value' from backend
    });

    return Object.values(yearMap)
      .filter(d => selectedYears.includes(d.year))
      .sort((a, b) => a.year - b.year);
  }, [data, selectedYears]);

  if (loading) return <div className="text-center py-20 chart-main-area">Loading Enrollment Intelligence...</div>;
  if (error) return <div className="text-center py-20 chart-main-area text-red-500">{error}</div>;

  const selectedIsos = selectedCountries.map(c => NAME_TO_ISO[c]);

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>Enrollment Trends Analysis</h2>
      </div>

      <div className="chart-main-area">
        <h3 className="font-black text-xl text-primary mb-6 uppercase tracking-tighter">
          Primary Enrollment Performance
        </h3>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value) => (typeof value === "number" ? formatPercent(value) : "N/A")}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              {selectedIsos.map((iso3, idx) => (
                <Line
                  key={iso3}
                  type="monotone"
                  dataKey={iso3}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name={iso3}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Trend Intelligence</div>
          <p className="explanation-text">
            Analyzing primary school enrollment provides a clear metric for educational access. 
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">Global Context</div>
          <p className="explanation-text">
            Regional performance reflects broader socio-economic stability.
          </p>
        </div>
      </div>
    </div>
  );
};
