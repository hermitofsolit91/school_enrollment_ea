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
      {/* Footer Info Only */}
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
