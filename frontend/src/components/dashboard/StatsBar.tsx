import React, { useEffect, useState } from "react";
import { apiClient } from "../../utils/api";
import type { HealthStatus } from "../../types";

export const StatsBar: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await apiClient.getHealth();
        setHealth(data);
        setLoading(false);
      } catch (err: any) {
        console.error(
          "Health check failed:",
          err?.response?.status,
          err?.message,
          "Backend at http://localhost:8000 may not be running"
        );
        setHealth({ status: "unhealthy" });
        setLoading(false);
      }
    };

    checkHealth();

    const interval = setInterval(() => {
      apiClient.getHealth().then((data) => setHealth(data)).catch((err: any) => {
        console.error("Health check error:", err?.message);
        setHealth({ status: "unhealthy" });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "7 Countries", value: "7" },
    { label: "13 Years", value: "2010–2023" },
    { label: "12 Indicators", value: "12" },
    { label: "World Bank Source", value: "World Bank" },
    { label: "Dataset Range", value: "2010–2023" },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-teal-50 to-cyan-50 py-6 px-4 border-b border-teal-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-4 shadow-sm border border-teal-100 text-center"
            >
              <p className="text-xs font-semibold text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-teal-700">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* API Status Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div
            className={`w-3 h-3 rounded-full ${
              loading ? "bg-gray-400" : health?.status === "healthy" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {loading
              ? "Checking connection..."
              : health?.status === "healthy"
                ? "Backend connected"
                : "Backend unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
};
