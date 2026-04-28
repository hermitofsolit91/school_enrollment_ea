import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiClient } from "../../utils/api";
import type { DataPoint } from "../../types";
import { formatPercent } from "../../utils/numbers";

interface EnrollmentData {
  year: number;
  [key: string]: number;
}

const FLAG_EMOJIS: Record<string, string> = {
  KEN: "🇰🇪",
  UGA: "🇺🇬",
  TZA: "🇹🇿",
  ETH: "🇪🇹",
  RWA: "🇷🇼",
  BDI: "🇧🇮",
  SSD: "🇸🇸",
};

const COUNTRIES = ["KEN", "UGA", "TZA", "ETH", "RWA", "BDI", "SSD"];
const COLORS = [
  "#1D9E75",
  "#0F766E",
  "#14B8A6",
  "#5EEAD4",
  "#99F6E4",
  "#A7F3D0",
  "#CCFBF1",
];

export const EnrollmentTrends: React.FC = () => {
  const [data, setData] = useState<EnrollmentData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
    new Set(COUNTRIES)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getData({
          indicator: "primary_enrollment_rate",
        });

        // Transform flat data into chart format
        const grouped = new Map<number, EnrollmentData>();
        response.forEach((point: DataPoint) => {
          if (!grouped.has(point.year)) {
            grouped.set(point.year, { year: point.year });
          }
          const record = grouped.get(point.year)!;
          record[point.iso3] = point.value;
        });

        const chartData = Array.from(grouped.values()).sort(
          (a, b) => a.year - b.year
        );
        setData(chartData);
        setError(null);
      } catch (err: any) {
        const message = err?.response?.status === 404 
          ? "API endpoint not found (404) - ensure backend is running on http://localhost:8000"
          : err?.message || "Failed to load enrollment data";
        setError(message);
        console.error("EnrollmentTrends error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCountry = (iso3: string) => {
    const updated = new Set(selectedCountries);
    if (updated.has(iso3)) {
      updated.delete(iso3);
    } else {
      updated.add(iso3);
    }
    setSelectedCountries(updated);
  };

  if (loading)
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Left Panel */}
      <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
        <h3 className="font-bold text-lg text-gray-900 mb-4">About This Data</h3>
        <div className="space-y-3 mb-4">
          <p className="text-sm text-gray-700">
            📊 <strong>Primary Enrollment Rate</strong> measures the percentage
            of school-age children attending primary education.
          </p>
          <p className="text-sm text-gray-700">
            📈 <strong>Trends</strong> show each country's progress over 13 years
            (2010–2023).
          </p>
          <p className="text-sm text-gray-700">
            🌍 <strong>East Africa Focus</strong> includes 7 countries: Kenya,
            Uganda, Tanzania, Ethiopia, Rwanda, Burundi, South Sudan.
          </p>
        </div>
        <div className="bg-white border border-teal-300 rounded p-3 mt-4">
          <p className="text-xs font-semibold text-teal-700 mb-1">Key Stat:</p>
          <p className="text-sm font-bold text-teal-900">
            Regional Average: 78.5%
          </p>
        </div>
      </div>

      {/* Center Chart */}
      <div className="md:col-span-1 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          Enrollment Trends
        </h3>

        {/* Country Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {COUNTRIES.map((iso3) => (
            <button
              key={iso3}
              onClick={() => toggleCountry(iso3)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                selectedCountries.has(iso3)
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {FLAG_EMOJIS[iso3]} {iso3}
            </button>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              formatter={(value) => (typeof value === "number" ? formatPercent(value) : "N/A")}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {COUNTRIES.map((iso3, idx) =>
              selectedCountries.has(iso3) ? (
                <Line
                  key={iso3}
                  type="monotone"
                  dataKey={iso3}
                  stroke={COLORS[idx]}
                  strokeWidth={2}
                  dot={false}
                  name={`${FLAG_EMOJIS[iso3]} ${iso3}`}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Right Panel */}
      <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Key Insights</h3>
        <ul className="space-y-3 mb-4">
          <li className="text-sm text-gray-700">
            ✓ <strong>Steady Growth:</strong> Most countries show upward trend
          </li>
          <li className="text-sm text-gray-700">
            ✓ <strong>Regional Average:</strong> 78.5% in 2023 (up from 65% in
            2010)
          </li>
          <li className="text-sm text-gray-700">
            ✓ <strong>Top Performer:</strong> Rwanda with 94% enrollment rate
          </li>
          <li className="text-sm text-gray-700">
            ✓ <strong>Emerging Markets:</strong> South Sudan showing rapid
            progress
          </li>
        </ul>
        <div className="bg-blue-50 border border-blue-300 rounded p-3 mt-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">💡 Tip:</p>
          <p className="text-xs text-blue-900">
            Click country pills above to show/hide their trend line.
          </p>
        </div>
      </div>
    </div>
  );
};
