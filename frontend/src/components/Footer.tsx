import React from "react";

/* ─────────────────────────────────────────────────────────────
   Types & Data
   ───────────────────────────────────────────────────────────── */

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  regNo: string;
  index: string;
  course: string;
}

const MEMBERS: TeamMember[] = [
  {
    initials: "JK",
    name: "Joel Kidima",
    role: "Project Lead & Developer",
    regNo: "2400101359",
    index: "2024/AUG/BCDF/B236138/DAY",
    course: "BCDF",
  },
  {
    initials: "AZ",
    name: "Awori Zaituna",
    role: "Lead Researcher",
    regNo: "2400100402",
    index: "2024/AUG/BCDF/B236513/DAY",
    course: "BCDF",
  },
  {
    initials: "KJ",
    name: "Kibazo Justine Kirabo",
    role: "Research & Analysis",
    regNo: "2400100720",
    index: "2024/AUG/BCDF/B236408/DAY",
    course: "BCDF",
  },
  {
    initials: "NG",
    name: "Nattabi Gloria",
    role: "Data Research & Analysis",
    regNo: "2400101350",
    index: "2024/AUG/BCDF/B237432/DAY",
    course: "BCDF",
  },
  {
    initials: "SS",
    name: "Semuwemba Salim",
    role: "Data Analysis & Visualization",
    regNo: "2400101767",
    index: "2024/AUG/BCDF/B237720/DAY",
    course: "BCDF",
  },
  {
    initials: "NA",
    name: "Nansereko Angel",
    role: "Project Mobilizer",
    regNo: "2300100028",
    index: "2023/AUG/BIST/B233660/DAY",
    course: "BIST",
  },
];

/* ─────────────────────────────────────────────────────────────
   Member Card – compact, centered
   ───────────────────────────────────────────────────────────── */

const MemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="flex flex-col items-center text-center bg-white/[0.06] border border-white/10 rounded-lg shadow-sm p-4 gap-2 w-full max-w-[220px]">
    {/* Avatar */}
    <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
      {member.initials}
    </div>

    {/* Name */}
    <p className="font-semibold text-white text-sm leading-tight">{member.name}</p>

    {/* Role pill */}
    <span className="bg-amber-400/15 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight">
      {member.role}
    </span>

    {/* Credentials */}
    <div className="w-full text-left text-[11px] text-gray-400 space-y-1 border-t border-white/10 pt-2">
      <p><span className="text-gray-500 font-medium">Reg:</span> {member.regNo}</p>
      <p className="whitespace-nowrap"><span className="text-gray-500 font-medium">Index:</span> {member.index}</p>
      <p><span className="text-gray-500 font-medium">Course:</span> {member.course}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Footer – separate section with shadow box
   ───────────────────────────────────────────────────────────── */

const Footer: React.FC = () => (
  <footer className="w-full mt-12">
    {/* ── The shadow-box section – fills edge to edge, no bottom gap ── */}
    <div className="shadow-[0_-8px_40px_rgba(0,0,0,0.4)] bg-[#0c2d4a] border-t border-white/10 overflow-hidden min-h-screen">

      {/* Top bar accent */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0" />

      <div className="px-6 py-10 md:px-10">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="bg-amber-400 text-[#0c2d4a] text-[11px] font-extrabold tracking-widest uppercase px-4 py-1 rounded-full">
            About Us
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight text-center leading-tight">
            EduData EA
          </h2>
          <p className="text-amber-400/80 text-sm font-semibold tracking-wide text-center">
            SCI-CITS &nbsp;&mdash;&nbsp; Nkumba University
          </p>
          <p className="text-gray-400 text-xs text-center max-w-lg mt-1">
            School Enrollment &amp; Literacy Analysis across 7 East African countries &nbsp;&middot;&nbsp; World Bank Open Data &nbsp;&middot;&nbsp; 2010–2023
          </p>
          <p className="text-gray-500 text-xs text-center">
            Group 5 Members
          </p>
        </div>

        {/* ── Cards Grid – centered ── */}
        <div className="flex flex-wrap justify-center gap-4">
          {MEMBERS.map((m) => (
            <MemberCard key={m.regNo} member={m} />
          ))}
        </div>

        {/* ── Plain-text bottom info – no card ── */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">
            Nkumba University &nbsp;·&nbsp; School of Computing &amp; Informatics
          </p>
          <p>
            Course Unit: &nbsp;
            <span className="text-white font-medium">Data Mining &amp; Business Intelligence</span>
          </p>
          <p>
            Lecturer: &nbsp;
            <span className="text-white font-semibold">Mr. Male Vicent</span>
          </p>
          <p className="text-gray-600 text-xs pt-2">
            © {new Date().getFullYear()} EduData EA · Group 5 Members · All rights reserved
          </p>
        </div>

      </div>
    </div>
  </footer>
);

export default Footer;
