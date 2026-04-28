import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import { apiClient } from "../../utils/api";
import type {
  RegressionResult,
  GenderGapResult,
  ForecastData,
} from "../../types";
import { CLUSTER_COLORS } from "../../utils/colorScale";
import { formatPercent, formatNumber } from "../../utils/numbers";

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ClusterCountryGroup {
  cluster: "High Performer" | "Mid Tier" | "Needs Attention";
  countries: Array<{
    iso3: string;
    country_name: string;
    flag_emoji: string;
    latitude?: number;
    longitude?: number;
  }>;
}

export const ModelResults: React.FC = () => {
  const [regressionData, setRegressionData] = useState<RegressionResult | null>(
    null
  );
  const [genderGapData, setGenderGapData] = useState<GenderGapResult | null>(
    null
  );
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [clusterData, setClusterData] = useState<ClusterCountryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [regression, genderGap, forecast, clusters] = await Promise.all([
          apiClient.getRegressionResults(),
          apiClient.getGenderGapData(),
          apiClient.getForecastData(),
          apiClient.getClusteringData(),
        ]);

        setRegressionData(regression);
        setGenderGapData(genderGap);
        setForecastData(forecast);

        console.log("API Response: /api/models/clustering", clusters);
        if (clusters && Array.isArray(clusters) && clusters[0]) {
          console.log("First cluster item lat/lng:", clusters[0].latitude, clusters[0].longitude);
        }

        const clusterArray = Array.isArray(clusters)
          ? clusters
          : clusters
          ? Object.values(clusters)
          : [];

        // Group clusters
        const grouped: Record<string, ClusterCountryGroup> = {
          "High Performer": { cluster: "High Performer", countries: [] },
          "Mid Tier": { cluster: "Mid Tier", countries: [] },
          "Needs Attention": { cluster: "Needs Attention", countries: [] },
        };

        clusterArray.forEach((c: any) => {
          grouped[c.cluster]?.countries.push({
            iso3: c.iso3,
            country_name: c.country_name,
            flag_emoji: c.flag_emoji,
            latitude: c.latitude,
            longitude: c.longitude,
          });
        });

        setClusterData(Object.values(grouped));
      } catch (err: any) {
        console.error(
          "ModelResults fetch error - Status:",
          err?.response?.status,
          "Message:",
          err?.message,
          "URL:",
          err?.response?.config?.url,
          "Check http://localhost:8000/docs for available endpoints"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading)
    return <div className="text-center py-8 text-gray-500">Loading models...</div>;

  // Prepare regression chart data
  const regressionChartData = regressionData
    ? Object.entries(regressionData.coefficients).map(([key, value]) => ({
        name: key,
        value,
      }))
    : [];

  // Prepare scatter plot data
  const scatterData = regressionData
    ? regressionData.predictions.map((p) => ({
        actual: p.actual,
        predicted: p.predicted,
      }))
    : [];

  // Prepare gender gap data
  const genderChartData = genderGapData
    ? genderGapData.countries.map((c) => ({
        iso3: c.iso3,
        Male: c.male_literacy,
        Female: c.female_literacy,
      }))
    : [];

  // Prepare forecast data for chart
  const forecastChartData =
    forecastData.length > 0
      ? (() => {
          const allYears = new Set<number>();
          forecastData.forEach((f) => {
            f.historical?.forEach((h) => allYears.add(h.year));
            f.forecast?.forEach((fc) => allYears.add(fc.year));
          });

          return Array.from(allYears)
            .sort((a, b) => a - b)
            .map((year) => {
              const point: Record<string, any> = { year };
              forecastData.forEach((f) => {
                const historical = f.historical?.find((h) => h.year === year);
                const forecast = f.forecast?.find((fc) => fc.year === year);
                const value = historical || forecast;
                if (value) {
                  point[f.iso3] = value.value;
                }
              });
              return point;
            });
        })()
      : [];

  return (
    <div className="space-y-8">
      {/* Clustering Section */}
      <section className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Country Performance Clusters
        </h2>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>What this means:</strong> Countries are grouped into three
            performance tiers based on their education metrics. "High Performers"
            show strong enrollment and literacy rates. "Mid Tier" countries have
            moderate progress. "Needs Attention" indicates areas needing
            investment and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {clusterData.map((group) => (
            <div
              key={group.cluster}
              className="rounded-lg border-2 p-4"
              style={{
                borderColor: CLUSTER_COLORS[group.cluster],
                backgroundColor: CLUSTER_COLORS[group.cluster] + "15",
              }}
            >
              <h3
                className="font-bold text-lg mb-3"
                style={{ color: CLUSTER_COLORS[group.cluster] }}
              >
                {group.cluster}
              </h3>
              <div className="space-y-2">
                {group.countries.map((country) => (
                  <div
                    key={country.iso3}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-lg">{country.flag_emoji}</span>
                    <span className="font-medium text-gray-800">
                      {country.country_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mini Cluster Map */}
        <div className="h-64 rounded-lg border border-gray-300 overflow-hidden">
          <MapContainer
            center={[1.5, 35]}
            zoom={5}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {clusterData
              .flatMap((group) => group.countries)
              .filter(
                (country) =>
                  country.latitude !== undefined &&
                  country.latitude !== null &&
                  country.longitude !== undefined &&
                  country.longitude !== null &&
                  !isNaN(country.latitude) &&
                  !isNaN(country.longitude)
              )
              .map((country) => (
                <CircleMarker
                  key={country.iso3}
                  center={[country.latitude!, country.longitude!]}
                  radius={15}
                  fillColor={CLUSTER_COLORS[
                    clusterData.find((group) =>
                      group.countries.some((c) => c.iso3 === country.iso3)
                    )?.cluster || "High Performer"
                  ]}
                  color={
                    CLUSTER_COLORS[
                      clusterData.find((group) =>
                        group.countries.some((c) => c.iso3 === country.iso3)
                      )?.cluster || "High Performer"
                    ]
                  }
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                />
              ))}
          </MapContainer>
        </div>
      </section>

      {/* Regression Section */}
      <section className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Predicting Primary Completion Rates
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>What this means:</strong> Our model uses historical data to
            predict student completion rates. The R² value shows how well our
            predictions match actual outcomes (1.0 = perfect). The chart shows
            which factors most influence completion rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Model Performance</p>
            <p className="text-3xl font-bold text-blue-700">
              {regressionData
                ? (regressionData.r_squared * 100).toFixed(1)
                : "—"}
              %
            </p>
            <p className="text-xs text-gray-600 mt-1">R² Score</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Feature Importance
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={regressionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot */}
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Predictions vs Actuals
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="actual" name="Actual" tick={{ fontSize: 11 }} />
            <YAxis dataKey="predicted" name="Predicted" tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Predictions" data={scatterData} fill="#06b6d4" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {/* Gender Gap Section */}
      <section className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Youth Literacy Gender Gap
        </h2>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>What this means:</strong> We measure gender parity in
            literacy rates. Teal badges indicate narrowing gaps (good progress);
            coral badges indicate widening gaps (need attention).
          </p>
        </div>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iso3" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => (typeof value === "number" ? formatPercent(value) : "N/A")} />
              <Legend />
              <Bar dataKey="Male" fill="#1D9E75" />
              <Bar dataKey="Female" fill="#F472B6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gap Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {genderGapData?.countries.map((country) => (
            <div key={country.iso3} className="text-center">
              <p className="text-2xl mb-2">{country.flag_emoji}</p>
              <div
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  country.gap_direction === "narrowing"
                    ? "bg-teal-100 text-teal-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                Gap: {formatNumber(country.gap)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {country.gap_direction === "narrowing"
                  ? "Narrowing ✓"
                  : "Widening ⚠"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Forecast Section */}
      <section className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Enrollment Forecast to 2030
        </h2>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>What this means:</strong> Solid lines show historical
            enrollment rates. Dashed lines are projections through 2030 based on
            current trends. This helps governments plan infrastructure and
            resources.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={forecastChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              label={{ value: "Year", position: "insideBottomRight", offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{ value: "Enrollment Rate (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip formatter={(value) => (typeof value === "number" ? formatPercent(value) : "N/A")} />
            <Legend />
            {forecastData.map((f, idx) => (
              <Line
                key={f.iso3}
                type="monotone"
                dataKey={f.iso3}
                stroke={["#1D9E75", "#0F766E", "#14B8A6", "#5EEAD4", "#99F6E4", "#A7F3D0", "#CCFBF1"][idx]}
                strokeWidth={2}
                dot={false}
                name={`${f.flag_emoji} ${f.iso3}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};
