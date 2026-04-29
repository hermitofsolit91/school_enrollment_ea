import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";
import type { CountryName } from "../../constants/countries";
import { COUNTRY_COLORS } from "../../constants/countries";
import "../../styles/dashboard.css";

interface AnalysisPanelProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
  analysisType: string;
}

interface AnalysisData {
  country: string;
  year: number;
  [key: string]: any;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  selectedCountries,
  selectedYears,
  analysisType,
}) => {
  const [data, setData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    average: number;
    min: number;
    max: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedCountries, selectedYears, analysisType]);

  const fetchAnalysisData = async () => {
    if (selectedCountries.length === 0 || selectedYears.length === 0) {
      setData([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const countriesParam = selectedCountries.join(",");

      let response: AnalysisData[] = [];

      switch (analysisType) {
        case "enrollment":
          response = await apiClient.getEnrollmentData(countriesParam);
          break;
        case "literacy":
          response = await apiClient.getLiteracyData(countriesParam);
          break;
        case "completion":
          response = await apiClient.getCompletionData(countriesParam);
          break;
        case "gender-gap":
          response = await apiClient.getGenderGapData(countriesParam);
          break;
        default:
          response = await apiClient.getEnrollmentData(countriesParam);
      }

      // Filter by selected years
      const filtered = response.filter((item) =>
        selectedYears.includes(item.year)
      );

      setData(filtered);

      // Calculate statistics based on available numeric values
      if (filtered.length > 0) {
        const values = filtered
          .map((item) => {
            // Find first numeric value in the object (excluding country and year)
            for (const [key, val] of Object.entries(item)) {
              if (
                key !== "country" &&
                key !== "year" &&
                typeof val === "number"
              ) {
                return val;
              }
            }
            return null;
          })
          .filter((v) => v !== null) as number[];

        if (values.length > 0) {
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          setStats({
            average: Math.round(average * 100) / 100,
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            count: filtered.length,
          });
        }
      }
    } catch (err: any) {
      setError(
        err?.message || "Failed to load analysis data. Please try again."
      );
      console.error("Analysis data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisTitle = () => {
    const titles: Record<string, string> = {
      enrollment: "Enrollment Analysis",
      literacy: "Literacy Analysis",
      completion: "Completion Analysis",
      "gender-gap": "Gender Gap Analysis",
    };
    return titles[analysisType] || "Analysis";
  };

  const getDisplayValue = (item: AnalysisData): string => {
    // Find first numeric value to display
    for (const [key, val] of Object.entries(item)) {
      if (
        key !== "country" &&
        key !== "year" &&
        typeof val === "number"
      ) {
        return `${Math.round(val * 100) / 100}%`;
      }
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="analysis-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-panel">
        <div className="error-state">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="analysis-panel">
        <div className="empty-state">
          <p>Select countries and years to view analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h3>{getAnalysisTitle()}</h3>
      </div>

      {stats && (
        <div className="analysis-stats">
          <div className="stat-card">
            <div className="stat-label">Average</div>
            <div className="stat-value">{stats.average}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Minimum</div>
            <div className="stat-value">{stats.min}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maximum</div>
            <div className="stat-value">{stats.max}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Records</div>
            <div className="stat-value">{stats.count}</div>
          </div>
        </div>
      )}

      <div className="analysis-table">
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Year</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className="country-dot"
                    style={{
                      backgroundColor: COUNTRY_COLORS[item.country as CountryName],
                    }}
                  ></span>
                  {item.country}
                </td>
                <td>{item.year}</td>
                <td className="value-cell">{getDisplayValue(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <p className="table-footer">
            Showing 10 of {data.length} records
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
