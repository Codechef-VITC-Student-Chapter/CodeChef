"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ManageAdminsModal from "./ManageAdminsModal";
import {
  Search,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Eye,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  UserCheck,
  UserX,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

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

// Department-specific column definitions
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

export type EvaluationStatus = "PENDING" | "SHORTLISTED" | "REJECTED";

export interface Applicant {
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
  status?: EvaluationStatus;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  evaluationNotes?: string;
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

const EXPRESS_BASE_URL =
  process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:4002";

// ─── URL Sanitizer & Link Detection Helpers ─────────────────────────────────
function formatUrl(url: unknown): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isUrlLike(val: unknown): boolean {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed || trimmed.includes(" ") || trimmed.length < 4) return false;
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^(?:www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?$/i.test(trimmed)
  );
}

// ─── CSV Export Function ──────────────────────────────────────────────────────
function exportCSV(
  applicants: Applicant[],
  dept: string,
  statusFilter: string
) {
  if (applicants.length === 0) return;
  const deptCols = dept && DEPT_COLUMNS[dept] ? DEPT_COLUMNS[dept] : [];
  const headers = [
    { key: "status", label: "Recruitment Status" },
    ...COMMON_COLUMNS,
    ...deptCols,
    { key: "department", label: "Department" },
    { key: "evaluationNotes", label: "Evaluation Notes" },
    { key: "statusUpdatedBy", label: "Evaluated By" },
    { key: "createdAt", label: "Submitted At" },
  ];

  const rows = applicants.map((a) => {
    const row: Record<string, string> = {};
    row["Recruitment Status"] = a.status || "PENDING";
    for (const col of COMMON_COLUMNS)
      row[col.label] = String(a[col.key as keyof Applicant] ?? "");
    for (const col of deptCols)
      row[col.label] = String(a.deptFields?.[col.key] ?? "");
    row["Department"] = DEPT_LABEL[a.department] || a.department;
    row["Evaluation Notes"] = a.evaluationNotes || "";
    row["Evaluated By"] = a.statusUpdatedBy || "";
    row["Submitted At"] = new Date(a.createdAt).toLocaleString("en-IN");
    return row;
  });

  const headerLabels = headers.map((h) => h.label);
  const csv = [
    headerLabels.join(","),
    ...rows.map((row) =>
      headerLabels
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `codechef_recruitment_${dept || "all"}_${statusFilter.toLowerCase()}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusBadge({ status }: { status?: EvaluationStatus }) {
  const current = status || "PENDING";
  if (current === "SHORTLISTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border-2 border-emerald-950 bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#064e3b]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        Shortlisted
      </span>
    );
  }
  if (current === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border-2 border-rose-950 bg-rose-100 text-rose-900 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#881337]">
        <XCircle className="w-3.5 h-3.5 text-rose-700" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border-2 border-amber-950 bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#78350f]">
      <Clock className="w-3.5 h-3.5 text-amber-700" />
      Pending
    </span>
  );
}

// ─── Main Recruitment Dashboard Component ─────────────────────────────────────
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

  // State
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [selectedDept, setSelectedDept] = useState(activeDept);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EvaluationStatus>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showAdminsModal, setShowAdminsModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const isSuperAdmin = session.role === "super_admin";

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 5 Accordion sections state (default: all expanded for immediate review)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    academic: true,
    profiles: true,
    motivation: true,
    department: true,
    notes: true,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  function handleCopy(text: string, fieldKey: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  function toggleSection(sectionKey: string) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }

  function setAllSections(open: boolean) {
    setOpenSections({
      academic: open,
      profiles: open,
      motivation: open,
      department: open,
      notes: open,
    });
  }

  // Body scroll lock while drawer is open
  useEffect(() => {
    if (selectedApplicant) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [selectedApplicant]);

  // Open candidate details drawer and initialize notes
  function openCandidateDrawer(applicant: Applicant) {
    setSelectedApplicant(applicant);
    setNotesDraft(applicant.evaluationNotes || "");
  }

  // Escape key closes drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedApplicant(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Columns for current department view
  const deptCols =
    selectedDept && DEPT_COLUMNS[selectedDept]
      ? DEPT_COLUMNS[selectedDept]
      : isSuperAdmin && !selectedDept
      ? []
      : DEPT_COLUMNS[session.department || ""] || [];

  // Extract unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    applicants.forEach((a) => {
      if (a.branch && a.branch.trim()) set.add(a.branch.trim());
    });
    return Array.from(set).sort();
  }, [applicants]);

  // Dynamic Statistics Calculations
  const stats = useMemo(() => {
    let shortlisted = 0;
    let rejected = 0;
    let pending = 0;

    applicants.forEach((a) => {
      const st = a.status || "PENDING";
      if (st === "SHORTLISTED") shortlisted++;
      else if (st === "REJECTED") rejected++;
      else pending++;
    });

    return {
      total: applicants.length,
      shortlisted,
      rejected,
      pending,
    };
  }, [applicants]);

  // Department counts for super admin overview
  const deptCounts = useMemo(() => {
    return applicants.reduce<Record<string, number>>((acc, a) => {
      acc[a.department] = (acc[a.department] || 0) + 1;
      return acc;
    }, {});
  }, [applicants]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    let result = applicants;

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((a) => (a.status || "PENDING") === statusFilter);
    }

    // Branch filter
    if (branchFilter !== "ALL") {
      result = result.filter((a) => a.branch === branchFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        const nameMatch = a.name.toLowerCase().includes(q);
        const regMatch = a.reg_no.toLowerCase().includes(q);
        const emailMatch = a.vit_email.toLowerCase().includes(q);
        const phoneMatch = a.phone_no.toLowerCase().includes(q);
        const deptMatch = (DEPT_LABEL[a.department] || a.department)
          .toLowerCase()
          .includes(q);
        const techMatch = String(a.deptFields?.techStack || "")
          .toLowerCase()
          .includes(q);
        return (
          nameMatch ||
          regMatch ||
          emailMatch ||
          phoneMatch ||
          deptMatch ||
          techMatch
        );
      });
    }

    return result;
  }, [applicants, statusFilter, branchFilter, searchQuery]);

  // Dynamically extract and normalize all portfolio and profile links
  const portfolioLinks = useMemo(() => {
    if (!selectedApplicant) return [];
    const links: Array<{
      label: string;
      url: string;
      className: string;
      icon: React.ReactNode;
    }> = [];

    const deptFields = selectedApplicant.deptFields || {};

    // 1. GitHub
    if (isUrlLike(deptFields.github)) {
      links.push({
        label: "GitHub Profile",
        url: formatUrl(deptFields.github),
        className:
          "border-black bg-slate-100 hover:bg-black hover:text-white text-slate-900",
        icon: <GithubIcon className="w-4 h-4" />,
      });
    }

    // 2. LinkedIn
    if (isUrlLike(deptFields.linkedin)) {
      links.push({
        label: "LinkedIn Profile",
        url: formatUrl(deptFields.linkedin),
        className:
          "border-blue-950 bg-blue-50 text-blue-900 hover:bg-blue-600 hover:text-white",
        icon: <LinkedinIcon className="w-4 h-4" />,
      });
    }

    // 3. Design Portfolio
    if (isUrlLike(deptFields.designPortfolio)) {
      links.push({
        label: "Design Portfolio",
        url: formatUrl(deptFields.designPortfolio),
        className:
          "border-rose-950 bg-rose-50 text-rose-900 hover:bg-rose-600 hover:text-white",
        icon: <Sparkles className="w-4 h-4" />,
      });
    }

    // 4. CP Profile
    if (isUrlLike(deptFields.cpProfile)) {
      links.push({
        label: "CP Profile (CodeChef / LeetCode)",
        url: formatUrl(deptFields.cpProfile),
        className:
          "border-amber-950 bg-amber-50 text-amber-900 hover:bg-amber-600 hover:text-white",
        icon: <ExternalLink className="w-4 h-4" />,
      });
    }

    // 5. Resume
    if (isUrlLike(deptFields.resume)) {
      links.push({
        label: "Resume Document",
        url: formatUrl(deptFields.resume),
        className:
          "border-purple-950 bg-purple-50 text-purple-900 hover:bg-purple-600 hover:text-white",
        icon: <FileText className="w-4 h-4" />,
      });
    }

    // 6. Any other field in deptFields containing a valid link/URL
    const standardKeys = [
      "github",
      "linkedin",
      "designPortfolio",
      "cpProfile",
      "resume",
    ];
    Object.entries(deptFields).forEach(([key, val]) => {
      if (!standardKeys.includes(key) && isUrlLike(val)) {
        const matchedCol = DEPT_COLUMNS[
          selectedApplicant.department
        ]?.find((c) => c.key === key);
        const label = matchedCol?.label || key;
        links.push({
          label: `${label}`,
          url: formatUrl(val),
          className:
            "border-slate-800 bg-slate-50 text-slate-900 hover:bg-slate-800 hover:text-white",
          icon: <ExternalLink className="w-4 h-4" />,
        });
      }
    });

    return links;
  }, [selectedApplicant]);

  // Handle department filter change
  function handleDeptChange(dept: string) {
    setSelectedDept(dept);
    setSelectedIds([]);
    startTransition(() => {
      router.push(`/admin/recruitment${dept ? `?dept=${dept}` : ""}`);
      router.refresh();
    });
  }

  // ─── Single Candidate Evaluation Action ─────────────────────────────────────
  async function handleStatusChange(
    applicantId: string,
    newStatus: EvaluationStatus,
    e?: React.MouseEvent
  ) {
    if (e) e.stopPropagation();
    setUpdatingId(applicantId);

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((a) =>
        a._id === applicantId
          ? {
              ...a,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: session.email,
            }
          : a
      )
    );

    if (selectedApplicant && selectedApplicant._id === applicantId) {
      setSelectedApplicant((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: session.email,
            }
          : null
      );
    }

    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/applicants/${applicantId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update status");
      }

      const targetApplicant = applicants.find((a) => a._id === applicantId);
      const name = targetApplicant?.name || "Candidate";
      setToast({
        type: "success",
        message: `${name} marked as ${newStatus} successfully.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setToast({ type: "error", message: msg });
      // Revert if failed
      startTransition(() => router.refresh());
    } finally {
      setUpdatingId(null);
    }
  }

  // ─── Save Evaluation Notes ──────────────────────────────────────────────────
  async function handleSaveNotes() {
    if (!selectedApplicant) return;
    setSavingNotes(true);
    try {
      const res = await fetch(
        `${EXPRESS_BASE_URL}/api/applicants/${selectedApplicant._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selectedApplicant.status || "PENDING",
            notes: notesDraft,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save evaluation notes");

      setApplicants((prev) =>
        prev.map((a) =>
          a._id === selectedApplicant._id
            ? { ...a, evaluationNotes: notesDraft }
            : a
        )
      );

      setSelectedApplicant((prev) =>
        prev ? { ...prev, evaluationNotes: notesDraft } : null
      );

      setToast({ type: "success", message: "Evaluation notes saved." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving notes";
      setToast({ type: "error", message: msg });
    } finally {
      setSavingNotes(false);
    }
  }

  // ─── Bulk Evaluation Action ─────────────────────────────────────────────────
  async function handleBulkStatusChange(newStatus: EvaluationStatus) {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (
      !confirm(
        `Are you sure you want to mark ${count} selected candidate${
          count > 1 ? "s" : ""
        } as ${newStatus}?`
      )
    ) {
      return;
    }

    setBulkUpdating(true);

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((a) =>
        selectedIds.includes(a._id)
          ? {
              ...a,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: session.email,
            }
          : a
      )
    );

    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/applicants/bulk-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to perform bulk update");
      }

      setToast({
        type: "success",
        message: `${count} candidate${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      });
      setSelectedIds([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk update failed";
      setToast({ type: "error", message: msg });
      startTransition(() => router.refresh());
    } finally {
      setBulkUpdating(false);
    }
  }

  // ─── Selection Helpers ──────────────────────────────────────────────────────
  const allFilteredSelected =
    filteredApplicants.length > 0 &&
    filteredApplicants.every((a) => selectedIds.includes(a._id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map((a) => a._id));
    }
  }

  function toggleSelectOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // ─── Archive / Deactivate ───────────────────────────────────────────────────
  async function handleArchiveApplicant(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!confirm("Archive this applicant? They won't appear in the active list."))
      return;

    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/applicants/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to archive applicant");

      setApplicants((prev) => prev.filter((a) => a._id !== id));
      if (selectedApplicant?._id === id) setSelectedApplicant(null);
      setToast({ type: "info", message: "Applicant archived successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error archiving";
      setToast({ type: "error", message: msg });
    }
  }

  // Helper to safely render cell links or text with word breaking
  function renderCellContent(val: unknown) {
    if (val === null || val === undefined || val === "") return "—";
    const str = String(val).trim();
    if (isUrlLike(str)) {
      const href = formatUrl(str);
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[#2563EB] font-bold underline hover:text-black transition-colors break-all"
        >
          <span>Open Link</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }
    return (
      <span className="whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] min-w-0 max-w-full">
        {str}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-7 pb-16">
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[10px] border-2 border-black bg-white shadow-[4px_4px_0px_#000] animate-bounce font-sans text-sm font-bold">
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          {toast.type === "error" && (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          {toast.type === "info" && (
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Page Title Row ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b-2 border-black/10">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-4xl sm:text-5xl text-black uppercase tracking-widest font-black"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Recruitment Command Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border-2 border-emerald-950 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#064e3b]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Active Cycle
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mt-1 font-sans">
            Review applications, evaluate candidates with instant Shortlist /
            Reject decisions, and manage recruitment selections.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => setShowAdminsModal(true)}
              className="border-2 border-black rounded-[8px] px-4 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#5878AF] text-white hover:bg-[#486390] transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-2"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              <Users className="w-4 h-4" />
              Manage Admins
            </button>
          )}

          <button
            onClick={() =>
              exportCSV(filteredApplicants, selectedDept, statusFilter)
            }
            className="border-2 border-black rounded-[8px] px-4 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#ECE9C7] text-black hover:bg-[#dedab0] transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-2"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
          >
            <Download className="w-4 h-4" />
            Export CSV ({filteredApplicants.length})
          </button>
        </div>
      </div>

      {/* ── Dynamic Statistics Dashboard ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applicants */}
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`border-2 border-black rounded-[12px] p-4 text-left transition-all cursor-pointer bg-white shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 ${
            statusFilter === "ALL"
              ? "ring-4 ring-black/20 bg-slate-50 border-black"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs uppercase tracking-widest font-black text-slate-500"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              Total Applicants
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-slate-100 border border-black flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-800" />
            </div>
          </div>
          <div
            className="text-4xl font-black text-black leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {stats.total}
          </div>
          <div className="text-[12px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
            <span>All submissions</span>
            {selectedDept && (
              <span className="text-black font-bold">
                • {DEPT_LABEL[selectedDept] || selectedDept}
              </span>
            )}
          </div>
        </button>

        {/* Shortlisted Candidates (GREEN) */}
        <button
          onClick={() => setStatusFilter("SHORTLISTED")}
          className={`border-2 border-emerald-950 rounded-[12px] p-4 text-left transition-all cursor-pointer bg-emerald-50 text-emerald-950 shadow-[4px_4px_0px_#064e3b] hover:-translate-y-0.5 ${
            statusFilter === "SHORTLISTED"
              ? "ring-4 ring-emerald-500/40 bg-emerald-100"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs uppercase tracking-widest font-black text-emerald-800"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              Shortlisted
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-emerald-200/80 border border-emerald-950 flex items-center justify-center shadow-[1px_1px_0px_#064e3b]">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div
            className="text-4xl font-black text-emerald-950 leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {stats.shortlisted}
          </div>
          <div className="text-[12px] text-emerald-700 font-semibold mt-1">
            {stats.total > 0
              ? `${Math.round((stats.shortlisted / stats.total) * 100)}% of total candidates`
              : "Marked for next round"}
          </div>
        </button>

        {/* Rejected Candidates (RED) */}
        <button
          onClick={() => setStatusFilter("REJECTED")}
          className={`border-2 border-rose-950 rounded-[12px] p-4 text-left transition-all cursor-pointer bg-rose-50 text-rose-950 shadow-[4px_4px_0px_#881337] hover:-translate-y-0.5 ${
            statusFilter === "REJECTED"
              ? "ring-4 ring-rose-500/40 bg-rose-100"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs uppercase tracking-widest font-black text-rose-800"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              Rejected
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-rose-200/80 border border-rose-950 flex items-center justify-center shadow-[1px_1px_0px_#881337]">
              <XCircle className="w-4 h-4 text-rose-800" />
            </div>
          </div>
          <div
            className="text-4xl font-black text-rose-950 leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {stats.rejected}
          </div>
          <div className="text-[12px] text-rose-700 font-semibold mt-1">
            {stats.total > 0
              ? `${Math.round((stats.rejected / stats.total) * 100)}% disqualified`
              : "Not moving forward"}
          </div>
        </button>

        {/* Pending Reviews (NEUTRAL / AMBER) */}
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`border-2 border-amber-950 rounded-[12px] p-4 text-left transition-all cursor-pointer bg-amber-50 text-amber-950 shadow-[4px_4px_0px_#78350f] hover:-translate-y-0.5 ${
            statusFilter === "PENDING"
              ? "ring-4 ring-amber-500/40 bg-amber-100"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs uppercase tracking-widest font-black text-amber-800"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              Pending Reviews
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-amber-200/80 border border-amber-950 flex items-center justify-center shadow-[1px_1px_0px_#78350f]">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
          </div>
          <div
            className="text-4xl font-black text-amber-950 leading-none"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {stats.pending}
          </div>
          <div className="text-[12px] text-amber-700 font-semibold mt-1">
            Awaiting administrator decision
          </div>
        </button>
      </div>

      {/* ── Super Admin Department Breakdown Chips ────────────────────── */}
      {isSuperAdmin && !selectedDept && Object.keys(deptCounts).length > 0 && (
        <div className="border-2 border-black rounded-[12px] bg-white p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-xs font-black uppercase tracking-wider text-slate-700"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
            >
              Filter Quick By Department
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Click a department to isolate applications
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(deptCounts).map(([dept, count]) => (
              <button
                key={dept}
                onClick={() => handleDeptChange(dept)}
                className="inline-flex items-center gap-2 border-2 border-black rounded-[8px] px-3 py-1.5 text-xs font-bold bg-[#F8FAFC] hover:bg-[#ECE9C7] transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <span>{DEPT_LABEL[dept] || dept}</span>
                <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Search, Multi-Filter & Controls Bar ────────────────────────── */}
      <div className="border-2 border-black rounded-[12px] bg-white p-4 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, reg no, email, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-black rounded-[8px] text-xs sm:text-sm font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[2px_2px_0px_#000] bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Multi Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center border-2 border-black rounded-[8px] p-0.5 bg-slate-100 shadow-[2px_2px_0px_#000]">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "SHORTLISTED", label: "🟢 Shortlisted" },
                { id: "REJECTED", label: "🔴 Rejected" },
                { id: "PENDING", label: "🟡 Pending" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-[6px] transition-all cursor-pointer ${
                  statusFilter === item.id
                    ? "bg-black text-white shadow-sm"
                    : "text-slate-700 hover:text-black"
                }`}
                style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Department Filter (Super Admin) */}
          {isSuperAdmin && (
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="border-2 border-black rounded-[8px] px-3 py-1.5 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[2px_2px_0px_#000] bg-white cursor-pointer"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          {/* Branch Filter */}
          {uniqueBranches.length > 0 && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border-2 border-black rounded-[8px] px-3 py-1.5 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[2px_2px_0px_#000] bg-white cursor-pointer"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              <option value="ALL">All Branches</option>
              {uniqueBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Floating Toolbar ─────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 border-2 border-black rounded-[10px] bg-black text-white p-3 shadow-[4px_4px_0px_#ECE9C7] flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider bg-[#ECE9C7] text-black px-2.5 py-1 rounded-[6px] border border-white">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
              Apply candidate evaluation decisions in bulk
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatusChange("SHORTLISTED")}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-[6px] border border-white shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Shortlist All ({selectedIds.length})
            </button>

            <button
              onClick={() => handleBulkStatusChange("REJECTED")}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-[6px] border border-white shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Reject All ({selectedIds.length})
            </button>

            <button
              onClick={() => handleBulkStatusChange("PENDING")}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-[6px] border border-slate-500 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white underline ml-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ── Redesigned Premium Recruitment Data Table ─────────────────── */}
      <div className="border-2 border-black rounded-[14px] bg-white shadow-[6px_6px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900 text-white border-b-2 border-black select-none">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-2 border-black accent-black cursor-pointer"
                  />
                </th>
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Decision Status
                </th>
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Candidate Name & Reg No
                </th>
                {(!selectedDept && isSuperAdmin) && (
                  <th
                    className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    Department
                  </th>
                )}
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Contact & Email
                </th>
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Academics (Branch/CGPA)
                </th>
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Profiles & Links
                </th>
                {deptCols.map((col) => (
                  <th
                    key={col.key}
                    className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  className="py-3.5 px-3 uppercase tracking-wider font-bold text-[13px] text-right pr-4"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  Candidate Evaluation Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y-2 divide-black/10">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={8 + deptCols.length}
                    className="p-12 text-center bg-slate-50"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-black flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-700" />
                      </div>
                      <h3
                        className="text-xl uppercase font-black tracking-wider text-black mt-2"
                        style={{ fontFamily: "var(--font-bebas)" }}
                      >
                        No Applicants Found
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {searchQuery || statusFilter !== "ALL"
                          ? "Try clearing your filters or search keywords."
                          : "No candidate applications have been recorded in the database yet."}
                      </p>
                      {(searchQuery || statusFilter !== "ALL") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                            setBranchFilter("ALL");
                          }}
                          className="mt-3 px-3 py-1.5 border-2 border-black rounded-[6px] bg-[#ECE9C7] text-black font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const isShortlisted = applicant.status === "SHORTLISTED";
                  const isRejected = applicant.status === "REJECTED";
                  const isSelected = selectedIds.includes(applicant._id);
                  const isBusy = updatingId === applicant._id;

                  // Row background accent based on evaluation status
                  const rowBg = isShortlisted
                    ? "bg-emerald-50/40 hover:bg-emerald-100/60 border-l-4 border-l-emerald-600"
                    : isRejected
                    ? "bg-rose-50/40 hover:bg-rose-100/60 border-l-4 border-l-rose-600"
                    : "bg-white hover:bg-slate-50/90 border-l-4 border-l-slate-300";

                  return (
                    <tr
                      key={applicant._id}
                      onClick={() => openCandidateDrawer(applicant)}
                      className={`transition-colors cursor-pointer group ${rowBg} ${
                        isSelected ? "bg-amber-50/60" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => toggleSelectOne(applicant._id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-2 border-black accent-black cursor-pointer"
                        />
                      </td>

                      {/* Decision Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={applicant.status} />
                      </td>

                      {/* Name & Reg No */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-black text-sm group-hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                          <span>{applicant.name}</span>
                          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#2563EB] transition-opacity shrink-0" />
                        </div>
                        <div className="inline-block mt-0.5 font-mono text-[11px] font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
                          {applicant.reg_no}
                        </div>
                      </td>

                      {/* Department (if all view) */}
                      {!selectedDept && isSuperAdmin && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className="text-xs font-bold uppercase tracking-wide bg-[#ECE9C7] text-black border border-black px-2 py-0.5 rounded-[4px] shadow-[1px_1px_0px_#000]"
                            style={{ fontFamily: "var(--font-bebas)" }}
                          >
                            {DEPT_LABEL[applicant.department] ||
                              applicant.department}
                          </span>
                        </td>
                      )}

                      {/* Contact & Email */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs font-medium text-slate-800">
                          {applicant.vit_email}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {applicant.phone_no}
                        </div>
                      </td>

                      {/* Academics */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">
                          {applicant.branch || "—"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {applicant.degree} • CGPA:{" "}
                          <span className="font-bold text-black">
                            {applicant.cgpa || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Profiles & Links */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isUrlLike(applicant.deptFields?.github) && (
                            <a
                              href={formatUrl(applicant.deptFields?.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-slate-100 border border-black hover:bg-black hover:text-white transition-colors"
                              title="GitHub Profile"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isUrlLike(applicant.deptFields?.linkedin) && (
                            <a
                              href={formatUrl(applicant.deptFields?.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-blue-50 border border-blue-900 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"
                              title="LinkedIn Profile"
                            >
                              <LinkedinIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isUrlLike(applicant.deptFields?.designPortfolio) && (
                            <a
                              href={formatUrl(applicant.deptFields?.designPortfolio)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-rose-50 border border-rose-900 text-rose-700 hover:bg-rose-700 hover:text-white transition-colors"
                              title="Design Portfolio"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isUrlLike(applicant.deptFields?.cpProfile) && (
                            <a
                              href={formatUrl(applicant.deptFields?.cpProfile)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-amber-50 border border-amber-900 text-amber-800 hover:bg-amber-800 hover:text-white transition-colors"
                              title="CP Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isUrlLike(applicant.deptFields?.resume) && (
                            <a
                              href={formatUrl(applicant.deptFields?.resume)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-purple-50 border border-purple-900 text-purple-700 hover:bg-purple-700 hover:text-white transition-colors"
                              title="Resume Document"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {!isUrlLike(applicant.deptFields?.github) &&
                            !isUrlLike(applicant.deptFields?.linkedin) &&
                            !isUrlLike(applicant.deptFields?.designPortfolio) &&
                            !isUrlLike(applicant.deptFields?.cpProfile) &&
                            !isUrlLike(applicant.deptFields?.resume) && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                        </div>
                      </td>

                      {/* Department Columns */}
                      {deptCols.map((col) => (
                        <td
                          key={col.key}
                          className="py-3.5 px-3 max-w-[200px] truncate text-xs text-slate-700"
                        >
                          {renderCellContent(applicant.deptFields?.[col.key])}
                        </td>
                      ))}

                      {/* ── Evaluation Action Buttons ── */}
                      <td
                        className="py-3.5 px-3 text-right pr-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {/* Shortlist Action */}
                          <button
                            onClick={(e) =>
                              handleStatusChange(applicant._id, "SHORTLISTED", e)
                            }
                            disabled={isBusy}
                            title="Shortlist Candidate"
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border-2 border-emerald-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#064e3b] active:translate-x-0.5 active:translate-y-0.5 ${
                              isShortlisted
                                ? "bg-emerald-600 text-white opacity-90"
                                : "bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white"
                            }`}
                            style={{
                              fontFamily: "var(--font-bebas)",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Shortlist</span>
                          </button>

                          {/* Reject Action */}
                          <button
                            onClick={(e) =>
                              handleStatusChange(applicant._id, "REJECTED", e)
                            }
                            disabled={isBusy}
                            title="Reject Candidate"
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border-2 border-rose-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#881337] active:translate-x-0.5 active:translate-y-0.5 ${
                              isRejected
                                ? "bg-rose-600 text-white opacity-90"
                                : "bg-rose-50 text-rose-900 hover:bg-rose-600 hover:text-white"
                            }`}
                            style={{
                              fontFamily: "var(--font-bebas)",
                              fontSize: "0.85rem",
                            }}
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Reject</span>
                          </button>

                          {/* View Candidate Drawer Button */}
                          <button
                            onClick={() => openCandidateDrawer(applicant)}
                            title="View Full Application Details"
                            className="p-1.5 rounded-[6px] border-2 border-black bg-white hover:bg-[#ECE9C7] transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-black" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Bar */}
        <div className="bg-slate-50 border-t-2 border-black/10 px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-semibold font-sans">
          <span>
            Showing <strong className="text-black">{filteredApplicants.length}</strong> of{" "}
            <strong className="text-black">{applicants.length}</strong> candidates
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to open the complete candidate evaluation drawer
          </span>
        </div>
      </div>

      {/* ── Candidate Details Slide-Over Drawer ───────────────────────── */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSelectedApplicant(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer container (Full Viewport Height, Independent Scroll) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Candidate details for ${selectedApplicant.name}`}
            className="relative w-full sm:w-[680px] lg:w-[750px] max-w-full bg-[#FAFAFA] border-l-4 border-black h-[100dvh] h-screen shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* 1. FIXED HEADER (Never scrolls away) */}
            <div className="shrink-0 bg-slate-950 text-white p-5 sm:p-6 border-b-2 border-black flex items-start justify-between z-20 shadow-md">
              <div className="pr-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-xs font-black uppercase tracking-wider bg-[#ECE9C7] text-black px-2.5 py-0.5 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    {DEPT_LABEL[selectedApplicant.department] ||
                      selectedApplicant.department}
                  </span>
                  <StatusBadge status={selectedApplicant.status} />
                </div>
                <h2
                  className="text-3xl sm:text-4xl text-white font-black tracking-widest uppercase leading-tight"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  {selectedApplicant.name}
                </h2>
                <div className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>
                    Reg No: <strong className="text-white">{selectedApplicant.reg_no}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Applied:{" "}
                    {new Date(selectedApplicant.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                aria-label="Close candidate details drawer"
                className="p-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. FIXED DECISION TOOLBAR (Never scrolls away) */}
            <div className="shrink-0 bg-slate-100 p-4 border-b-2 border-black flex items-center justify-between gap-3 flex-wrap z-20 shadow-sm">
              <span
                className="text-xs font-black uppercase tracking-wider text-slate-800"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem" }}
              >
                Candidate Decision:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplicant._id, "SHORTLISTED")
                  }
                  disabled={updatingId === selectedApplicant._id}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] border-2 border-emerald-950 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#064e3b] transition-all cursor-pointer disabled:opacity-50 ${
                    selectedApplicant.status === "SHORTLISTED"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-900 hover:bg-emerald-600 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Shortlist</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplicant._id, "REJECTED")
                  }
                  disabled={updatingId === selectedApplicant._id}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] border-2 border-rose-950 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#881337] transition-all cursor-pointer disabled:opacity-50 ${
                    selectedApplicant.status === "REJECTED"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-100 text-rose-900 hover:bg-rose-600 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApplicant._id, "PENDING")
                  }
                  disabled={updatingId === selectedApplicant._id}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-[8px] border-2 border-black bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 transition-all"
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 3. SCROLLABLE CANDIDATE CONTENT (Only this area scrolls) */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col gap-4 font-sans [overscroll-behavior:contain]">
              {/* Expand/Collapse All Helper Controls */}
              <div className="flex items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-500 shrink-0">
                <span>Application Breakdown (5 Sections):</span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAllSections(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-black uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setAllSections(false)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-black hover:underline cursor-pointer"
                  >
                    <Minimize2 className="w-3 h-3" />
                    Collapse All
                  </button>
                </div>
              </div>

              {/* ── ACCORDION 1: Academic & Contact Information ── */}
              <div className="shrink-0 w-full border-2 border-black rounded-[12px] bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("academic")}
                  aria-expanded={openSections.academic}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-[#5878AF] shrink-0" />
                    <span
                      className="text-base font-black uppercase tracking-wider text-black"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem" }}
                    >
                      Academic & Contact Information
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                      {selectedApplicant.reg_no}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-black transition-transform duration-200 ${
                        openSections.academic ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.academic && (
                  <div className="border-t-2 border-black/10 p-5 bg-[#FAFAFA]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Full Name
                        </span>
                        <span className="text-sm font-bold text-black break-words">
                          {selectedApplicant.name}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Registration Number
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedApplicant.reg_no, "reg_no")}
                            className="text-[10px] text-slate-500 hover:text-black flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedField === "reg_no" ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="font-mono text-sm font-bold text-black">
                          {selectedApplicant.reg_no}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            VIT Email
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedApplicant.vit_email, "email")}
                            className="text-[10px] text-slate-500 hover:text-black flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedField === "email" ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <a
                          href={`mailto:${selectedApplicant.vit_email}`}
                          className="text-xs font-bold text-[#2563EB] underline hover:text-black break-all"
                        >
                          {selectedApplicant.vit_email}
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Phone Number
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedApplicant.phone_no, "phone")}
                            className="text-[10px] text-slate-500 hover:text-black flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedField === "phone" ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${selectedApplicant.phone_no}`}
                            className="text-xs font-bold text-black hover:text-[#2563EB]"
                          >
                            {selectedApplicant.phone_no}
                          </a>
                          <a
                            href={`https://wa.me/${selectedApplicant.phone_no.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold bg-[#25D366]/20 text-[#128C7E] px-1.5 py-0.5 rounded hover:bg-[#25D366] hover:text-white transition-colors"
                          >
                            WhatsApp ↗
                          </a>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Degree & Branch
                        </span>
                        <span className="text-xs font-bold text-slate-900 break-words">
                          {selectedApplicant.degree || "B.Tech"} • {selectedApplicant.branch || "—"}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          CGPA
                        </span>
                        <span className="text-base font-black text-black">
                          {selectedApplicant.cgpa || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ACCORDION 2: Profiles & Portfolios ── */}
              <div className="shrink-0 w-full border-2 border-black rounded-[12px] bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("profiles")}
                  aria-expanded={openSections.profiles}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#5878AF] shrink-0" />
                    <span
                      className="text-base font-black uppercase tracking-wider text-black"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem" }}
                    >
                      Profiles & Portfolios
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {portfolioLinks.length > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                        {portfolioLinks.length} Link{portfolioLinks.length > 1 ? "s" : ""}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-black transition-transform duration-200 ${
                        openSections.profiles ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.profiles && (
                  <div className="border-t-2 border-black/10 p-5 bg-[#FAFAFA]">
                    {portfolioLinks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {portfolioLinks.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-[8px] border border-slate-200 shadow-sm flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 font-bold text-xs text-black">
                                {item.icon}
                                <span>{item.label}</span>
                              </div>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-black underline shrink-0"
                              >
                                <span>Open ↗</span>
                              </a>
                            </div>
                            <span
                              className="text-[11px] font-mono text-slate-500 break-all truncate"
                              title={item.url}
                            >
                              {item.url}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-[8px] bg-slate-100 text-center text-xs text-slate-500 italic">
                        No external profile or portfolio links provided by candidate.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── ACCORDION 3: Motivation & Experience ── */}
              <div className="shrink-0 w-full border-2 border-black rounded-[12px] bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("motivation")}
                  aria-expanded={openSections.motivation}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#5878AF] shrink-0" />
                    <span
                      className="text-base font-black uppercase tracking-wider text-black"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem" }}
                    >
                      Motivation & Experience
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-black transition-transform duration-200 ${
                      openSections.motivation ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openSections.motivation && (
                  <div className="border-t-2 border-black/10 p-5 bg-[#FAFAFA] flex flex-col gap-4 font-sans text-xs">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block mb-1.5 uppercase tracking-wide">
                        Why CodeChef VIT Chennai?
                      </span>
                      <div className="p-4 rounded-[8px] bg-white border border-slate-200 shadow-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                        {selectedApplicant.whyJoin || (
                          <span className="text-slate-400 italic">No motivation statement provided.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 text-xs block mb-1.5 uppercase tracking-wide">
                        Previous Experience / Clubs:
                      </span>
                      <div className="p-4 rounded-[8px] bg-white border border-slate-200 shadow-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                        {selectedApplicant.experience || (
                          <span className="text-slate-400 italic">No prior club experience mentioned.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ACCORDION 4: Department Responses ── */}
              <div className="shrink-0 w-full border-2 border-black rounded-[12px] bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("department")}
                  aria-expanded={openSections.department}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-[#5878AF] shrink-0" />
                    <span
                      className="text-base font-black uppercase tracking-wider text-black"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem" }}
                    >
                      Department Responses ({DEPT_LABEL[selectedApplicant.department] || selectedApplicant.department})
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-black transition-transform duration-200 ${
                      openSections.department ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openSections.department && (
                  <div className="border-t-2 border-black/10 p-5 bg-[#FAFAFA] flex flex-col gap-3 font-sans">
                    {selectedApplicant.deptFields &&
                    Object.keys(selectedApplicant.deptFields).length > 0 ? (
                      Object.entries(selectedApplicant.deptFields).map(([key, value]) => {
                        const matchedCol = DEPT_COLUMNS[
                          selectedApplicant.department
                        ]?.find((c) => c.key === key);
                        const label = matchedCol?.label || key;

                        return (
                          <div key={key} className="text-xs">
                            <span className="font-bold text-slate-800 block mb-1 uppercase tracking-wide">
                              {label}
                            </span>
                            <div className="p-3.5 rounded-[8px] bg-white border border-slate-200 shadow-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                              {renderCellContent(value)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 rounded-[8px] bg-slate-100 text-center text-xs text-slate-500 italic">
                        No department-specific responses recorded for this candidate.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── ACCORDION 5: Internal Evaluation Notes ── */}
              <div className="shrink-0 w-full border-2 border-black rounded-[12px] bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("notes")}
                  aria-expanded={openSections.notes}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-[#ECE9C7]/50 hover:bg-[#ECE9C7]/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-black shrink-0" />
                    <span
                      className="text-base font-black uppercase tracking-wider text-black"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem" }}
                    >
                      Internal Evaluation Notes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApplicant.statusUpdatedBy && (
                      <span className="text-[11px] font-mono font-medium text-slate-700 hidden sm:inline">
                        By: {selectedApplicant.statusUpdatedBy}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-black transition-transform duration-200 ${
                        openSections.notes ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.notes && (
                  <div className="border-t-2 border-black/10 p-5 bg-[#FAF7E8]">
                    <p className="text-xs text-slate-600 mb-2 font-medium">
                      Add internal evaluation feedback, technical round assessment, or interviewer remarks:
                    </p>
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Type internal evaluation notes here..."
                      rows={4}
                      className="w-full p-3.5 border-2 border-black rounded-[8px] bg-white text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[2px_2px_0px_#000]"
                    />
                    <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {selectedApplicant.statusUpdatedAt ? (
                          <>
                            Last evaluated by{" "}
                            <strong>{selectedApplicant.statusUpdatedBy || "admin"}</strong> on{" "}
                            {new Date(selectedApplicant.statusUpdatedAt).toLocaleString("en-IN")}
                          </>
                        ) : (
                          "Notes persist to MongoDB and appear in CSV exports."
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] border-2 border-black bg-black text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingNotes ? "Saving Notes..." : "Save Notes"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Archive Candidate Action */}
              <div className="pt-2 pb-6 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleArchiveApplicant(selectedApplicant._id, e)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  Archive candidate from active recruitment list
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Admins Modal (Super Admin Only) ────────────────────── */}
      {showAdminsModal && (
        <ManageAdminsModal
          admins={admins}
          token={token}
          onClose={() => setShowAdminsModal(false)}
          onAdminsChange={(updated) => setAdmins(updated)}
        />
      )}
    </div>
  );
}
