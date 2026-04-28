import { useMemo } from "react";
import { ENDPOINTS } from "../constants/api";
import { useApi } from "../hooks/useApi";
import { interpolateColor } from "../utils/colorScale";
import { fmt } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";

type Matrix = Record<string, Record<string, number>>;

const VARIABLES = [
  "primary_enrollment_rate",
  "secondary_enrollment_rate",
  "tertiary_enrollment_rate",
  "literacy_rate_adult",
  "gender_literacy_gap",
  "primary_completion_rate",
  "lower_secondary_completion",
  "govt_education_expenditure",
  "out_of_school_primary",
] as const;

export default function CorrelationMatrix() {
  const { data, loading, error } = useApi<Matrix>(ENDPOINTS.correlation);

  const matrix = useMemo(() => data ?? {}, [data]);

  return (
    <section id="correlation" className="section reveal">
      <div className="section-title-wrap">
        <h2>Indicator Correlations</h2>
      </div>

      {loading && <LoadingSkeleton lines={9} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <article className="glass-card chart-card">
          <div className="heatmap-table-wrap">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  {VARIABLES.map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIABLES.map((rowName) => (
                  <tr key={rowName}>
                    <td>{rowName}</td>
                    {VARIABLES.map((colName) => {
                      const value = matrix[rowName]?.[colName] ?? (rowName === colName ? 1 : 0);
                      const bg = interpolateColor(value, -1, 1);
                      return (
                        <td
                          key={`${rowName}-${colName}`}
                          style={{ background: bg }}
                          title={`${rowName} vs ${colName}: ${fmt(value, 2)}`}
                        >
                          {fmt(value, 2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
