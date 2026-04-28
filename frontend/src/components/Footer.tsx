import { useMemo } from "react";
import { ENDPOINTS } from "../constants/api";
import { useApi } from "../hooks/useApi";

type TeamMember = {
  name: string;
  studentNumber: string;
  indexNumber: string;
  course: string;
  role?: string;
};

type PublicInfo = {
  team?: TeamMember[];
};

const GROUP_MEMBERS: TeamMember[] = [
  {
    name: "Joel Kidima",
    studentNumber: "2400101359",
    indexNumber: "2024/AUG/BCDF/B236138/DAY",
    course: "BCDF",
    role: "Project Lead & Data Analyst",
  },
  {
    name: "Awori Zaituna",
    studentNumber: "2400100402",
    indexNumber: "2024/AUG/BCDF/B236513/DAY",
    course: "BCDF",
    role: "Lead Researcher",
  },
  {
    name: "Kibazo Justine Kirabo",
    studentNumber: "2400100720",
    indexNumber: "2024/AUG/BCDF/B236408/DAY",
    course: "BCDF",
    role: "Research & Analysis",
  },
  {
    name: "Nattabi Gloria",
    studentNumber: "2400101350",
    indexNumber: "2024/AUG/BCDF/B237432/DAY",
    course: "BCDF",
    role: "Data Research & Analysis",
  },
  {
    name: "Semuwemba Salim",
    studentNumber: "2400101767",
    indexNumber: "2024/AUG/BCDF/B237720/DAY",
    course: "BCDF",
    role: "Data Analysis & Visualization",
  },
  {
    name: "Nansereko Angel",
    studentNumber: "2300100028",
    indexNumber: "2023/AUG/BIST/B233660/DAY",
    course: "BIST",
    role: "Project Mobilizer",
  },
];

const AVATAR_COLORS = ["#145374", "#1f8cb8", "#2a9d8f", "#ffb703", "#d1495b", "#e74c3c"];

export default function Footer() {
  const { data } = useApi<PublicInfo>(ENDPOINTS.publicInfo, true);

  const members = useMemo(
    () => data?.team && data.team.length > 0 ? data.team : GROUP_MEMBERS,
    [data]
  );

  const teamNames = useMemo(
    () => members.map((m) => m.name).filter(Boolean).join(", "),
    [members]
  );

  return (
    <div className="footer-section">
      {/* Team Members Section */}
      <div className="footer-members">
        <div className="container">
          {/* Header */}
          <div className="footer-header">
            <h2>Project Team</h2>
            <p className="footer-subtitle">
              Group 5 - Data Mining & Business Intelligence<br />
              Nkumba University · 2024-2025
            </p>
          </div>

          {/* Members Grid */}
          <div className="members-grid">
            {members.map((member, idx) => (
              <div key={member.studentNumber} className="member-card">
                {/* Avatar */}
                <div
                  className="member-avatar"
                  style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  <span className="avatar-initials">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>

                {/* Member Details */}
                <h3 className="member-name">{member.name}</h3>
                
                {member.role && (
                  <p className="member-role">{member.role}</p>
                )}

                <div className="member-details">
                  <div className="detail-item">
                    <span className="detail-label">Reg No:</span>
                    <span className="detail-value">{member.studentNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Index:</span>
                    <span className="detail-value">{member.indexNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course:</span>
                    <span className="detail-value">{member.course}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>🎓 EduData EA - Nkumba University</div>
            <div>Data: World Bank Open Data | Years: 2010-2023 | Countries: 7 (East Africa)</div>
            <div className="footer-team-names">{teamNames || "Team details loading..."}</div>
            <small>
              Built for Data Mining & Business Intelligence · Supervised by Mr. Male Vicent · Nkumba
              University
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}
