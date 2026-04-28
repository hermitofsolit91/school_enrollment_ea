import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import type { CountryTrends } from "../../types";
import { apiClient } from "../../utils/api";
import { formatPercent, formatCurrency } from "../../utils/numbers";

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

const FLAG_EMOJIS: Record<string, string> = {
  KEN: "🇰🇪",
  UGA: "🇺🇬",
  TZA: "🇹🇿",
  ETH: "🇪🇹",
  RWA: "🇷🇼",
  BDI: "🇧🇮",
  SSD: "🇸🇸",
};

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  KEN: [-0.0236, 37.9062],
  UGA: [1.3733, 32.2903],
  TZA: [-6.369, 34.8888],
  ETH: [9.145, 40.4897],
  RWA: [-1.9536, 29.8739],
  BDI: [-3.3731, 29.9189],
  SSD: [6.877, 31.307],
};

interface CountryCardProps {
  iso3: string;
  country_name: string;
  flag_emoji: string;
  onClick: () => void;
}

const CountryCard: React.FC<CountryCardProps> = ({
  iso3,
  country_name,
  flag_emoji,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="bg-white rounded-lg border border-gray-200 hover:border-teal-400 hover:shadow-lg p-4 text-center transition cursor-pointer"
  >
    <p className="text-3xl mb-2">{flag_emoji}</p>
    <p className="font-bold text-gray-900">{country_name}</p>
    <p className="text-xs text-gray-500">{iso3}</p>
  </button>
);

export const CountryProfiles: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryTrends | null>(
    null
  );
  const [_loading, setLoading] = useState(false);

  const countries: Array<{ iso3: string; name: string; flag: string; lat: number; lng: number }> = [
    { iso3: "KEN", name: "Kenya", flag: "🇰🇪", lat: 0.02, lng: 37.91 },
    { iso3: "UGA", name: "Uganda", flag: "🇺🇬", lat: 1.37, lng: 32.29 },
    { iso3: "TZA", name: "Tanzania", flag: "🇹🇿", lat: -6.37, lng: 34.89 },
    { iso3: "ETH", name: "Ethiopia", flag: "🇪🇹", lat: 9.15, lng: 40.49 },
    { iso3: "RWA", name: "Rwanda", flag: "🇷🇼", lat: -1.94, lng: 29.87 },
    { iso3: "BDI", name: "Burundi", flag: "🇧🇮", lat: -3.37, lng: 29.92 },
    { iso3: "SSD", name: "South Sudan", flag: "🇸🇸", lat: 6.88, lng: 31.57 },
  ];

  const handleCountrySelect = async (iso3: string) => {
    try {
      setLoading(true);
      const data = await apiClient.getCountryTrends(iso3);
      setSelectedCountry(data);
    } catch (err: any) {
      console.error(
        "Country profile error for",
        iso3,
        "- Status:",
        err?.response?.status,
        "Message:",
        err?.message,
        "URL:",
        err?.response?.config?.url
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Country Profiles</h2>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
        {countries.map((country) => (
          <CountryCard
            key={country.iso3}
            iso3={country.iso3}
            country_name={country.name}
            flag_emoji={FLAG_EMOJIS[country.iso3]}
            onClick={() => handleCountrySelect(country.iso3)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedCountry && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
          {/* Left: Sparkline */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-gray-900 mb-4">Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={selectedCountry.enrollment_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.toString().slice(-2)}
                />
                <YAxis hide />
                <Tooltip formatter={(value) => (typeof value === "number" ? formatPercent(value) : "N/A")} />
                <Area
                  type="monotone"
                  dataKey="value"
                  fill="#1D9E75"
                  stroke="#085041"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Center: Key Stats */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-gray-900 mb-4">Key Statistics</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-teal-200">
                <p className="text-xs text-gray-600 mb-1">Literacy Rate</p>
                <p className="text-2xl font-bold text-teal-700">
                  {formatPercent(selectedCountry.literacy_rate_latest)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-teal-200">
                <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-teal-700">
                  {formatPercent(selectedCountry.completion_rate_latest)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-teal-200">
                <p className="text-xs text-gray-600 mb-1">Govt Expenditure</p>
                <p className="text-2xl font-bold text-teal-700">
                  {formatCurrency(selectedCountry.govt_expenditure_latest)}
                </p>
              </div>
              <div className="bg-teal-200 rounded-lg px-3 py-2 text-center">
                <p className="text-xs font-semibold text-teal-900 mb-1">
                  Performance Tier
                </p>
                <p className="text-sm font-bold text-teal-900">
                  {selectedCountry.cluster}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Mini Map */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-gray-900 mb-4">Location</h3>
            <div className="h-48 rounded-lg border border-teal-300 overflow-hidden">
              <MapContainer
                center={COUNTRY_COORDINATES[selectedCountry.iso3] || [0, 35]}
                zoom={8}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Marker
                  position={
                    COUNTRY_COORDINATES[selectedCountry.iso3] || [0, 35]
                  }
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">
                        {selectedCountry.flag_emoji} {selectedCountry.country_name}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
