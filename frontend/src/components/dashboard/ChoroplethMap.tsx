import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { Layers, Map as MapIcon, Zap } from "lucide-react";
import { apiClient } from "../../utils/api";
import type { MapDataPoint, ClusterData, Indicator } from "../../types";
import { INDICATOR_LABELS } from "../../types";
import { CLUSTER_COLORS, interpolateTealColor } from "../../utils/colorScale";
import { formatPercent } from "../../utils/numbers";
import { type CountryName } from "../../constants/countries";

// Heatmap Sub-component
const HeatmapLayer = ({ data }: { data: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const heatLayer = (L as any).heatLayer(data, {
      radius: 40,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.0: '#3B82F6', // Blue (Low)
        0.5: '#10B981', // Green
        1.0: '#EF4444'  // Red (High)
      }
    }).addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, map]);

  return null;
};

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

interface ChoroplethMapProps {
  indicator: string;
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export const ChoroplethMap: React.FC<ChoroplethMapProps> = ({
  indicator: indicatorProp,
  selectedCountries,
  selectedYears,
}) => {
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [clusterData, setClusterData] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mapMode, setMapMode] = useState<"value" | "cluster" | "heatmap">("heatmap");

  const year = selectedYears[selectedYears.length - 1] || 2023;
  
  const indicator = useMemo(() => {
    if (indicatorProp === "enrollment") return "primary_enrollment_rate";
    if (indicatorProp === "literacy") return "unified_literacy";
    if (indicatorProp === "completion") return "primary_completion_rate";
    if (indicatorProp === "gender-gap") return "gender_literacy_gap";
    return indicatorProp;
  }, [indicatorProp]);

  const heatmapPoints = useMemo((): [number, number, number][] => {
    return mapData
      .filter(p => p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude))
      .filter(p => selectedCountries.includes(p.country_name as CountryName))
      .map(p => [
        p.latitude, 
        p.longitude, 
        Math.min(1, Math.max(0, p.value / 100))
      ]);
  }, [mapData, selectedCountries]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMapData({ indicator, year });
        setMapData(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [indicator, year]);

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const data = await apiClient.getClusteringData();
        setClusterData(data);
      } catch (err: any) {
        console.error("Failed to load cluster data", err);
      }
    };
    fetchClusterData();
  }, []);

  const { minValue, maxValue } = useMemo(() => {
    if (mapData.length === 0) return { minValue: 0, maxValue: 100 };
    const values = mapData.map((d) => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [mapData]);

  const getCircleColor = (value: number): string => interpolateTealColor(value, minValue, maxValue);
  const getRadius = (value: number): number => Math.max(10, Math.min(30, (value / (maxValue || 100)) * 30));
  const getClusterColor = (cluster: string): string => CLUSTER_COLORS[cluster] || "#9FE1CB";

  if (loading) return <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">Loading Map Intelligence...</div>;
  if (error) return <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none mb-2">Regional Intelligence</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-accent/20 text-accent text-[10px] font-black rounded-full uppercase tracking-widest">{year}</span>
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{INDICATOR_LABELS[indicator as Indicator] || indicator}</span>
          </div>
        </div>
        
        {/* Modern Map Mode Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200">
          {[
            { id: "value", label: "Value", icon: MapIcon },
            { id: "cluster", label: "Cluster", icon: Layers },
            { id: "heatmap", label: "Heatmap", icon: Zap },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = mapMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setMapMode(mode.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white text-primary shadow-lg scale-[1.02] translate-y-[-1px]"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                <Icon size={14} className={isActive ? "text-accent" : "text-slate-400"} />
                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-container-wrapper shadow-2xl border-8 border-white overflow-hidden rounded-[3rem] h-[650px] relative bg-slate-50">
        <MapContainer
          center={[1.5, 35]}
          zoom={5}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {mapMode === "value" && mapData
            .filter(p => p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude))
            .filter(p => selectedCountries.includes(p.country_name as CountryName))
            .map((point) => (
              <CircleMarker
                key={point.iso3}
                center={[point.latitude, point.longitude]}
                radius={getRadius(point.value)}
                fillColor={getCircleColor(point.value)}
                color={getCircleColor(point.value)}
                weight={3}
                opacity={0.9}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="p-3 text-center">
                    <p className="font-black text-xl text-primary mb-1">{point.country_name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">
                      {INDICATOR_LABELS[indicator as Indicator] || indicator}
                    </p>
                    <div className="text-3xl font-black text-primary">
                      {formatPercent(point.value)}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {mapMode === "cluster" && clusterData
            .filter(p => p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude))
            .filter(p => selectedCountries.includes(p.country_name as CountryName))
            .map((point) => (
              <CircleMarker
                key={point.iso3}
                center={[point.latitude, point.longitude]}
                radius={20}
                fillColor={getClusterColor(point.cluster)}
                color={getClusterColor(point.cluster)}
                weight={3}
                opacity={0.9}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="p-3 text-center">
                    <p className="font-black text-lg">{point.country_name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Cluster</p>
                    <p className="font-black text-accent text-xl">{point.cluster}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {mapMode === "heatmap" && <HeatmapLayer data={heatmapPoints} />}
        </MapContainer>

        {/* Legend for Heatmap */}
        {mapMode === "heatmap" && (
          <div className="absolute bottom-10 right-10 bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl z-[1000] border border-white/20 scale-110">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-400">Heat Intensity</p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-blue-500">LOW</span>
              <div className="w-40 h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 shadow-inner"></div>
              <span className="text-[10px] font-black text-red-500">HIGH</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
