import { useMemo } from "react";
import { ENDPOINTS } from "../constants/api";
import { useApi } from "../hooks/useApi";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";

type TeamMember = {
  name?: string;
};

type PublicInfo = {
  description?: string;
  team?: TeamMember[];
};

export default function AboutSection() {
  const { data, loading, error } = useApi<PublicInfo>(ENDPOINTS.publicInfo, true);

  const team = useMemo(() => data?.team ?? [], [data]);

  return (
    <section id="about" className="section reveal">
      <div className="section-title-wrap">
        <h2>About This Project</h2>
      </div>

      {loading && <LoadingSkeleton lines={8} height={16} />}
      {error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="about-grid">
          <article className="glass-card about-card">
            <h3>Nkumba University</h3>
            <p>School of Science, Computing & Information Technology</p>
            <p>Course: Data Mining and Business Intelligence</p>
            <p>Lecturer: Male Vicent</p>
            <p>{data?.description ?? "Academic dashboard project powered by World Bank Open Data."}</p>
            <div className="badge-row">
              <span className="pill">📊 World Bank Open Data</span>
              <span className="pill">2010-2023 · 7 East African Countries</span>
            </div>
          </article>

          <div className="team-grid">
            {team.length ? (
              team.map((member, idx) => (
                <article key={`${member.name}-${idx}`} className="glass-card team-card">
                  <h4>{member.name ?? "N/A"}</h4>
                </article>
              ))
            ) : (
              <article className="glass-card team-card span-2">
                <h4>Group member names will be added here when finalized.</h4>
              </article>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
