import { BarChart3, BookOpen, CalendarDays, GraduationCap, Scale, ShieldAlert, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { ENDPOINTS } from "../constants/api";
import { useApi } from "../hooks/useApi";
import { fmt, num, pct } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";

type SummaryResponse = Record<string, unknown>;

const items = [
  { key: "highest_primary_enrollment", title: "Highest Primary Enrollment", icon: GraduationCap, color: "#1B4F72", format: pct },
  { key: "adult_literacy_leader", title: "Adult Literacy Leader", icon: BookOpen, color: "#27AE60", format: pct },
  { key: "lowest_literacy", title: "Lowest Literacy", icon: ShieldAlert, color: "#C0392B", format: pct },
  { key: "biggest_gender_gap", title: "Biggest Gender Gap", icon: Scale, color: "#F39C12", format: pct },
  { key: "most_out_of_school", title: "Most Out-of-School Children", icon: Users, color: "#C0392B", format: num },
  { key: "top_education_spender", title: "Top Education Spender", icon: Wallet, color: "#1ABC9C", format: pct },
  { key: "countries_analyzed", title: "Countries Analyzed", icon: BarChart3, color: "#2E86C1", format: num },
  { key: "years_covered", title: "Years Covered", icon: CalendarDays, color: "#8E44AD", format: fmt },
] as const;

function getLabel(row: unknown): string {
  if (!row || typeof row !== "object") return "N/A";
  const asObj = row as Record<string, unknown>;
  const country = typeof asObj.country === "string" ? asObj.country : "N/A";
  const value = typeof asObj.value === "number" ? asObj.value : null;
  return `${country} · ${value == null ? "N/A" : value.toFixed(1)}`;
}

export default function KPICards() {
  const { data, loading, error } = useApi<SummaryResponse>(ENDPOINTS.summary);

  return (
    <section id="overview" className="section">
      <div className="section-title-wrap">
        <h2>Dashboard Overview</h2>
      </div>

      {loading && <LoadingSkeleton lines={8} height={20} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="kpi-grid">
          {items.map((item) => {
            const Icon = item.icon;
            const raw = data?.[item.key as keyof SummaryResponse];
            let value = "N/A";
            let numericValue: number | null = null;
            if (typeof raw === "number") {
              value = item.format(raw);
              numericValue = raw;
            } else {
              value = getLabel(raw);
            }

            return (
              <article key={item.key} className="glass-card kpi-card" style={{ borderLeftColor: item.color }}>
                <Icon size={20} className="kpi-icon" />
                <h3>{item.title}</h3>
                <p className="kpi-value">
                  {numericValue == null ? value : <CountUp value={numericValue} formatter={item.format} />}
                </p>
                <div className="sparkline" />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CountUp({ value, formatter }: { value: number; formatter: (n: number) => string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(value * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter(display)}</>;
}
