import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { apiClient } from "../../utils/api";
import type { MapDataPoint, ClusterData, Indicator } from "../../types";
import { INDICATOR_LABELS } from "../../types";
import { CLUSTER_COLORS, interpolateTealColor } from "../../utils/colorScale";
import { formatPercent } from "../../utils/numbers";

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface CountrySpotlight {
  iso3: string;
  country_name: string;
  flag_emoji: string;
  cluster: string;
  literacy_rate: number;
  completion_rate: number;
  govt_expenditure: number;
}

export const ChoroplethMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [clusterData, setClusterData] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [indicator, setIndicator] = useState<string>("primary_enrollment_rate");
  const [year, setYear] = useState(2020);
  const [mapMode, setMapMode] = useState<"value" | "cluster">("value");
  const [spotlight, setSpotlight] = useState<CountrySpotlight | null>(null);

  const indicators = [
    "primary_enrollment_rate",
    "secondary_enrollment_rate",
    "literacy_rate",
    "completion_rate",
    "govt_expenditure",
  ] as const;

  // Fetch map data
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMapData({ indicator, year });
        console.log("API Response: /api/map-data", data);
        if (data && data[0]) {
          console.log("First country lat/lng:", data[0].latitude, data[0].longitude);
        }
        setMapData(data);
        setError(null);
      } catch (err: any) {
        const message = err?.response?.status === 404
          ? "API endpoint not found (404) at /api/map-data - ensure backend is running"
          : err?.message || "Failed to load map data";
        setError(message);
        console.error("ChoroplethMap error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [indicator, year]);

  // Fetch cluster data (once)
  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const data = await apiClient.getClusteringData();
        console.log("API Response: /api/models/clustering", data);
        if (data && data[0]) {
          console.log("First cluster lat/lng:", data[0].latitude, data[0].longitude);
        }
        setClusterData(data);
      } catch (err: any) {
        const message = err?.response?.status === 404
          ? "API endpoint not found (404) at /api/models/clustering - ensure backend is running"
          : err?.message || "Failed to load cluster data";
        console.error("ChoroplethMap cluster error:", message, err);
      }
    };

    fetchClusterData();
  }, []);

  // Calculate min/max for color scaling
  const { minValue, maxValue } = useMemo(() => {
    if (mapData.length === 0) return { minValue: 0, maxValue: 100 };
    const values = mapData.map((d) => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [mapData]);

  const getCircleColor = (value: number): string => {
    return interpolateTealColor(value, minValue, maxValue);
  };

  const getRadius = (value: number): number => {
    return Math.max(10, Math.min(30, value / 10));
  };

  const getClusterColor = (cluster: string): string => {
    return CLUSTER_COLORS[cluster] || "#9FE1CB";
  };

  const handleCircleClick = async (point: MapDataPoint) => {
    try {
      const trends = await apiClient.getCountryTrends(point.iso3);
      setSpotlight({
        iso3: point.iso3,
        country_name: point.country_name,
        flag_emoji: point.flag_emoji,
        cluster: "High Performer", // TODO: get from trends
        literacy_rate: trends.literacy_rate_latest,
        completion_rate: trends.completion_rate_latest,
        govt_expenditure: trends.govt_expenditure_latest,
      });
    } catch (err) {
      console.error("Failed to load spotlight", err);
    }
  };

  if (loading)
    return <div className="text-center py-8 text-gray-500">Loading map...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="mb-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Indicator
          </label>
          <select
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
          >
            {indicators.map((ind) => (
              <option key={ind} value={ind}>
                {INDICATOR_LABELS[ind]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Year: {year}
          </label>
          <input
            type="range"
            min="2010"
            max="2023"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            View
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMapMode("value")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                mapMode === "value"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Value Map
            </button>
            <button
              onClick={() => setMapMode("cluster")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                mapMode === "cluster"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cluster Map
            </button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Panel */}
        <div className="lg:col-span-1 bg-teal-50 rounded-lg p-4 border border-teal-200">
          <h3 className="font-bold text-gray-900 mb-3">Reading the Map</h3>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">
              <strong>Circle Size:</strong> Larger circles indicate higher values
              for the selected indicator.
            </p>
            <p className="text-gray-700">
              <strong>Color:</strong> Darker teal = higher performance; lighter
              teal = lower.
            </p>
            <p className="text-gray-700">
              <strong>Interaction:</strong> Click any country circle to see
              detailed stats.
            </p>
            <p className="text-gray-700">
              <strong>Year Slider:</strong> Move left/right to view historical
              data.
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="h-[450px] rounded-lg border border-gray-300 shadow-md overflow-hidden">
            <MapContainer
              center={[1.5, 35]}
              zoom={5}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {mapMode === "value"
                ? mapData
                    .filter(
                      (point) =>
                        point.latitude !== undefined &&
                        point.latitude !== null &&
                        point.longitude !== undefined &&
                        point.longitude !== null &&
                        !isNaN(point.latitude) &&
                        !isNaN(point.longitude)
                    )
                    .map((point) => (
                      <CircleMarker
                        key={point.iso3}
                        center={[point.latitude, point.longitude]}
                        radius={getRadius(point.value)}
                        fillColor={getCircleColor(point.value)}
                        color={getCircleColor(point.value)}
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.6}
                        eventHandlers={{
                          click: () => handleCircleClick(point),
                        }}
                      >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">
                            {point.flag_emoji} {point.country_name}
                          </p>
                          <p className="text-gray-600">
                            {INDICATOR_LABELS[indicator as Indicator]}
                          </p>
                          <p className="font-semibold text-teal-700">
                            {formatPercent(point.value)}
                          </p>
                          <p className="text-xs text-gray-500">Year: {year}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                : clusterData
                    .filter(
                      (point) =>
                        point.latitude !== undefined &&
                        point.latitude !== null &&
                        point.longitude !== undefined &&
                        point.longitude !== null &&
                        !isNaN(point.latitude) &&
                        !isNaN(point.longitude)
                    )
                    .map((point) => (
                      <CircleMarker
                        key={point.iso3}
                        center={[point.latitude, point.longitude]}
                        radius={18}
                        fillColor={getClusterColor(point.cluster)}
                        color={getClusterColor(point.cluster)}
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.6}
                        eventHandlers={{
                          click: () =>
                            setSpotlight({
                              iso3: point.iso3,
                              country_name: point.country_name,
                              flag_emoji: point.flag_emoji,
                              cluster: point.cluster,
                              literacy_rate: 0,
                              completion_rate: 0,
                              govt_expenditure: 0,
                            }),
                        }}
                      >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">
                            {point.flag_emoji} {point.country_name}
                          </p>
                          <p className="text-gray-600">Cluster</p>
                          <p className="font-semibold">{point.cluster}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
            </MapContainer>
          </div>

          {/* Color Legend */}
          {mapMode === "value" && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-gray-600">Low</span>
              <div className="flex-1 flex gap-1 mx-3">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <div
                    key={t}
                    className="h-4 flex-1"
                    style={{
                      backgroundColor: interpolateTealColor(
                        minValue + (maxValue - minValue) * t,
                        minValue,
                        maxValue
                      ),
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-600">High</span>
            </div>
          )}

          {/* Cluster Legend */}
          {mapMode === "cluster" && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => (
                <div
                  key={cluster}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium text-gray-700">
                    {cluster}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Spotlight */}
        <div className="lg:col-span-1">
          {spotlight ? (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-300">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">{spotlight.flag_emoji}</span>
                {spotlight.country_name}
              </h3>

              <div className="mb-3 px-3 py-1 bg-teal-200 text-teal-900 rounded text-xs font-semibold inline-block">
                {spotlight.cluster}
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600 text-xs">Literacy Rate</p>
                  <p className="font-bold text-teal-700">
                    {formatPercent(spotlight.literacy_rate)}
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600 text-xs">Completion Rate</p>
                  <p className="font-bold text-teal-700">
                    {formatPercent(spotlight.completion_rate)}
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600 text-xs">Govt Expenditure</p>
                  <p className="font-bold text-teal-700">
                    ${(spotlight.govt_expenditure / 1e6).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 text-center">
              <p className="text-sm text-gray-600">
                Click a country circle to view detailed stats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
