"use client";

import React, { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import ManageAdminsModal from "./ManageAdminsModal";

// ─── Department config ────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { value: "", label: "All Departments" },
  { value: "competitive_programming", label: "Technical (CP)" },
  { value: "projects", label: "Projects" },
  { value: "web_development", label: "Web Development" },
  { value: "design", label: "Design" },
  { value: "management", label: "Event Management" },
  { value: "marketing_and_outreach", label: "Marketing & Outreach" },
  { value: "social_media_and_content", label: "Social Media & Content" },
  { value: "finance", label: "Finance" },
];

const DEPT_LABEL: Record<string, string> = {
  competitive_programming: "Technical (CP)",
  projects: "Projects",
  web_development: "Web Development",
  design: "Design",
  management: "Event Management",
  marketing_and_outreach: "Marketing & Outreach",
  social_media_and_content: "Social Media & Content",
  finance: "Finance",
};

// Department-specific column definitions (key → display label)
const DEPT_COLUMNS: Record<string, Array<{ key: string; label: string }>> = {
  competitive_programming: [
    { key: "cpProfile", label: "CP Profile" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "whyCp", label: "Why CP?" },
    { key: "cpExperience", label: "CP Experience" },
    { key: "weeklyContests", label: "Weekly Contests" },
  ],
  projects: [
    { key: "github", label: "GitHub" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "resume", label: "Resume" },
    { key: "whyProjects", label: "Why Projects?" },
    { key: "hackathon1_select", label: "Problem 1" },
    { key: "hackathon1_contribution", label: "Contribution 1" },
    { key: "hackathon1_proposal", label: "Proposal 1" },
    { key: "hackathon2_select", label: "Problem 2" },
    { key: "hackathon2_contribution", label: "Contribution 2" },
    { key: "hackathon2_proposal", label: "Proposal 2" },
  ],
  web_development: [
    { key: "github", label: "GitHub" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "techStack", label: "Tech Stack" },
    { key: "webDevCourse", label: "Course Done?" },
    { key: "whichCourse", label: "Course Details" },
  ],
  design: [
    { key: "designSkills", label: "Design Skills" },
    { key: "whyDesign", label: "Why Design?" },
    { key: "yourWork", label: "Work Details" },
    { key: "designPortfolio", label: "Portfolio" },
  ],
  management: [
    { key: "hostelerORdayscholar", label: "Hosteler/Day Scholar" },
    { key: "otherClub", label: "Other Club" },
    { key: "roleInCurrentClub", label: "Role in Club" },
    { key: "handleSituation", label: "Situation Handling" },
    { key: "strength", label: "Strength" },
    { key: "effectiveComm", label: "Communication" },
  ],
  marketing_and_outreach: [
    { key: "hostelerORdayscholar", label: "Hosteler/Day Scholar" },
    { key: "secureSponsors", label: "Securing Sponsors" },
    { key: "promoteEvent", label: "Promote Event" },
    { key: "moreParticipants", label: "More Participants" },
  ],
  social_media_and_content: [
    { key: "pod", label: "Pod" },
    { key: "niche", label: "Niche" },
    { key: "softwareForVideoEditing", label: "Video Editing Software" },
  ],
  finance: [
    { key: "whyFinance", label: "Why Finance?" },
    { key: "excel", label: "MS Excel?" },
    { key: "financialAwareness", label: "Financial Awareness" },
  ],
};

// Common columns shown for every department
const COMMON_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "reg_no", label: "Reg No" },
  { key: "vit_email", label: "VIT Email" },
  { key: "phone_no", label: "Phone" },
  { key: "degree", label: "Degree" },
  { key: "branch", label: "Branch" },
  { key: "cgpa", label: "CGPA" },
  { key: "experience", label: "Experience" },
  { key: "whyJoin", label: "Why Join?" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Applicant {
  _id: string;
  name: string;
  reg_no: string;
  vit_email: string;
  phone_no: string;
  degree: string;
  branch: string;
  experience: string;
  whyJoin: string;
  department: string;
  cgpa: string;
  deptFields: Record<string, unknown>;
  createdAt: string;
  isActive: boolean;
}

interface Admin {
  _id: string;
  email: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface Session {
  email: string;
  role: "super_admin" | "admin";
  department: string | null;
}

function renderCellContent(val: unknown) {
  if (val === null || val === undefined || val === "") return "—";
  const str = String(val);
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return (
      <a
        href={str}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#5878AF] font-bold underline hover:text-black"
      >
        View Link ↗
      </a>
    );
  }
  return str;
}

// ─── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(applicants: Applicant[], dept: string) {
  if (applicants.length === 0) return;
  const deptCols = dept && DEPT_COLUMNS[dept] ? DEPT_COLUMNS[dept] : [];
  const headers = [
    ...COMMON_COLUMNS,
    ...deptCols,
    { key: "department", label: "Department" },
    { key: "createdAt", label: "Submitted At" },
  ];
  const rows = applicants.map((a) => {
    const row: Record<string, string> = {};
    for (const col of COMMON_COLUMNS) row[col.label] = String(a[col.key as keyof Applicant] ?? "");
    for (const col of deptCols) row[col.label] = String(a.deptFields?.[col.key] ?? "");
    row["Department"] = DEPT_LABEL[a.department] || a.department;
    row["Submitted At"] = new Date(a.createdAt).toLocaleString("en-IN");
    return row;
  });
  const headerLabels = headers.map((h) => h.label);
  const csv = [
    headerLabels.join(","),
    ...rows.map((row) =>
      headerLabels.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `applicants_${dept || "all"}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:4002";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecruitmentDashboard({
  initialApplicants,
  total,
  session,
  admins: initialAdmins,
  token,
  activeDept,
}: {
  initialApplicants: Applicant[];
  total: number;
  session: Session;
  admins: Admin[];
  token: string;
  activeDept: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [selectedDept, setSelectedDept] = useState(activeDept);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminsModal, setShowAdminsModal] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = session.role === "super_admin";

  // Columns for current view
  const deptCols =
    selectedDept && DEPT_COLUMNS[selectedDept]
      ? DEPT_COLUMNS[selectedDept]
      : isSuperAdmin && !selectedDept
      ? [] // "All" view shows dept badge column
      : DEPT_COLUMNS[session.department || ""] || [];

  const showDeptCol = !selectedDept && isSuperAdmin;

  function handleDeptChange(dept: string) {
    setSelectedDept(dept);
    setExpandedRow(null);
    startTransition(() => {
      router.push(`/admin/recruitment${dept ? `?dept=${dept}` : ""}`);
      router.refresh();
    });
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Archive this applicant? They won't appear in the active list.")) return;
    setDeactivating(id);
    setError("");
    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/applicants/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to archive applicant");
        return;
      }
      setApplicants((prev) => prev.filter((a) => a._id !== id));
    } finally {
      setDeactivating(null);
    }
  }

  // Stat counts by department
  const deptCounts = applicants.reduce<Record<string, number>>((acc, a) => {
    acc[a.department] = (acc[a.department] || 0) + 1;
    return acc;
  }, {});

  // Live client-side search filtering
  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.toLowerCase().trim();
    return applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.reg_no.toLowerCase().includes(q) ||
        a.vit_email.toLowerCase().includes(q) ||
        a.phone_no.toLowerCase().includes(q) ||
        (DEPT_LABEL[a.department] || a.department).toLowerCase().includes(q)
    );
  }, [applicants, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page Title Row ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-4xl text-black uppercase tracking-widest"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            Recruitment Responses
          </h2>
          <p className="text-sm text-gray-600 font-sans mt-0.5">
            {filteredApplicants.length} of {total || applicants.length} applicant
            {applicants.length !== 1 ? "s" : ""}{" "}
            {selectedDept ? `in ${DEPT_LABEL[selectedDept] || selectedDept}` : "across all departments"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Search Input */}
          <input
            type="text"
            placeholder="Search name, reg no, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 border-black rounded-[8px] px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-white w-64"
          />

          {isSuperAdmin && (
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="border-2 border-black rounded-[8px] px-3 py-2 text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-white cursor-pointer"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => exportCSV(filteredApplicants, selectedDept)}
            className="border-2 border-black rounded-[8px] px-5 py-2 text-sm font-bold uppercase tracking-widest bg-[#ECE9C7] hover:bg-[#d8d5b5] transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
          >
            ↓ Export CSV
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setShowAdminsModal(true)}
              className="border-2 border-black rounded-[8px] px-5 py-2 text-sm font-bold uppercase tracking-widest bg-[#5878AF] text-white hover:bg-[#486390] transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              Manage Admins
            </button>
          )}
        </div>
      </div>

      {/* ── Dept Stats (super admin only on "All" view) ─────────────── */}
      {isSuperAdmin && !selectedDept && Object.keys(deptCounts).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(deptCounts).map(([dept, count]) => (
            <button
              key={dept}
              onClick={() => handleDeptChange(dept)}
              className="border-2 border-black rounded-[10px] px-4 py-3 text-left bg-white hover:bg-[#ECE9C7] transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <div
                className="text-2xl text-black"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                {count}
              </div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wide font-sans mt-0.5">
                {DEPT_LABEL[dept] || dept}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="border-2 border-red-500 rounded-[8px] px-4 py-3 bg-red-50">
          <p className="text-sm text-red-600 font-sans font-bold">{error}</p>
        </div>
      )}

      {/* ── Applicants Table ─────────────────────────────────────────── */}
      <div
        ref={tableRef}
        className="border-2 border-black rounded-[12px] overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-x-auto"
      >
        <table className="w-full text-xs font-sans min-w-[900px]">
          <thead>
            <tr
              className="text-left uppercase tracking-wider border-b-2 border-black"
              style={{ backgroundColor: "#ECE9C7" }}
            >
              <th className="px-3 py-3 font-bold whitespace-nowrap">#</th>
              {COMMON_COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-3 font-bold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {showDeptCol && <th className="px-3 py-3 font-bold whitespace-nowrap">Department</th>}
              {deptCols.map((col) => (
                <th key={col.key} className="px-3 py-3 font-bold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-3 font-bold whitespace-nowrap">Submitted</th>
              {isSuperAdmin && (
                <th className="px-3 py-3 font-bold whitespace-nowrap text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.length === 0 && (
              <tr>
                <td
                  colSpan={
                    COMMON_COLUMNS.length +
                    deptCols.length +
                    (showDeptCol ? 1 : 0) +
                    (isSuperAdmin ? 2 : 1) +
                    1
                  }
                  className="px-4 py-12 text-center text-gray-400 font-sans"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📭</span>
                    <span>No applications found.</span>
                  </div>
                </td>
              </tr>
            )}
            {filteredApplicants.map((a, idx) => {
              const isExpanded = expandedRow === a._id;
              return (
                <React.Fragment key={a._id}>
                  <tr
                    className={`border-t border-gray-200 cursor-pointer transition-colors ${
                      isExpanded ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setExpandedRow(isExpanded ? null : a._id)}
                  >
                    <td className="px-3 py-2.5 text-gray-400 font-bold">{idx + 1}</td>
                    {COMMON_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2.5 text-gray-900 whitespace-nowrap max-w-[160px] truncate"
                        title={String(a[col.key as keyof Applicant] ?? "")}
                      >
                        {renderCellContent(a[col.key as keyof Applicant])}
                      </td>
                    ))}
                    {showDeptCol && (
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className="border border-black text-xs font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide"
                          style={{ backgroundColor: "#ECE9C7" }}
                        >
                          {DEPT_LABEL[a.department] || a.department}
                        </span>
                      </td>
                    )}
                    {deptCols.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2.5 text-gray-700 max-w-[180px] truncate"
                        title={String(a.deptFields?.[col.key] ?? "")}
                      >
                        {renderCellContent(a.deptFields?.[col.key])}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(a._id);
                          }}
                          disabled={deactivating === a._id}
                          className="border border-red-400 text-red-600 rounded-[6px] px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {deactivating === a._id ? "..." : "Archive"}
                        </button>
                      </td>
                    )}
                  </tr>
                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr className="bg-blue-50 border-t border-blue-200">
                      <td
                        colSpan={
                          COMMON_COLUMNS.length +
                          deptCols.length +
                          (showDeptCol ? 1 : 0) +
                          (isSuperAdmin ? 2 : 1) +
                          1
                        }
                        className="px-4 py-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {COMMON_COLUMNS.map((col) => (
                            <div
                              key={col.key}
                              className="bg-white border-2 border-black rounded-[8px] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            >
                              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                {col.label}
                              </div>
                              <div className="text-sm text-black break-words">
                                {renderCellContent(a[col.key as keyof Applicant])}
                              </div>
                            </div>
                          ))}
                          {(selectedDept
                            ? deptCols
                            : DEPT_COLUMNS[a.department] || []
                          ).map((col) => (
                            <div
                              key={col.key}
                              className="bg-white border-2 border-black rounded-[8px] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            >
                              <div className="text-xs font-bold uppercase tracking-wider text-[#5878AF] mb-1">
                                {col.label}
                              </div>
                              <div className="text-sm text-black break-words">
                                {renderCellContent(a.deptFields?.[col.key])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Manage Admins Modal ──────────────────────────────────────── */}
      {showAdminsModal && (
        <ManageAdminsModal
          admins={admins}
          token={token}
          onClose={() => setShowAdminsModal(false)}
          onAdminsChange={setAdmins}
        />
      )}
    </div>
  );
}
