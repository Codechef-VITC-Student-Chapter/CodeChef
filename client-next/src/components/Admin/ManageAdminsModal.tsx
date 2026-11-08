"use client";

import { useState } from "react";

const DEPARTMENTS = [
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

interface Admin {
  _id: string;
  email: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  admins: Admin[];
  token: string;
  onClose: () => void;
  onAdminsChange: (admins: Admin[]) => void;
}

const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:4002";

export default function ManageAdminsModal({ admins, token, onClose, onAdminsChange }: Props) {
  const [localAdmins, setLocalAdmins] = useState<Admin[]>(admins);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!email || !password || !department) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, department }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Failed to create admin.");
        return;
      }
      const newAdmin: Admin = data;
      const updated = [newAdmin, ...localAdmins];
      setLocalAdmins(updated);
      onAdminsChange(updated);
      setEmail("");
      setPassword("");
      setDepartment(DEPARTMENTS[0].value);
      setFormSuccess(`Admin ${newAdmin.email} created successfully!`);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const res = await fetch(`${EXPRESS_BASE_URL}/api/auth/admins/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const updated = localAdmins.map((a) =>
        a._id === id ? { ...a, isActive: data.isActive } : a
      );
      setLocalAdmins(updated);
      onAdminsChange(updated);
    } finally {
      setToggling(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-white border-2 border-black rounded-[16px] shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black" style={{ backgroundColor: "#ECE9C7" }}>
          <h2
            className="text-2xl text-black uppercase tracking-widest"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            Manage Admins
          </h2>
          <button
            onClick={onClose}
            className="border-2 border-black rounded-[8px] px-3 py-1 text-sm font-bold uppercase tracking-wide hover:bg-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            ✕ Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {/* ── Add New Admin ───────────────────────────────────── */}
          <div>
            <h3
              className="text-lg text-black uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Add New Admin
            </h3>
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black uppercase tracking-wider font-sans">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="border-2 border-black rounded-[8px] px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black uppercase tracking-wider font-sans">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="border-2 border-black rounded-[8px] px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] font-sans"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-wider font-sans">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="border-2 border-black rounded-[8px] px-3 py-2 text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#5878AF] shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-white"
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="border-2 border-red-500 rounded-[8px] px-3 py-2 bg-red-50">
                  <p className="text-sm text-red-600 font-sans">{formError}</p>
                </div>
              )}
              {formSuccess && (
                <div className="border-2 border-green-500 rounded-[8px] px-3 py-2 bg-green-50">
                  <p className="text-sm text-green-700 font-sans">{formSuccess}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="self-start border-2 border-black rounded-[8px] px-6 py-2 text-sm font-bold uppercase tracking-widest bg-[#5878AF] text-white hover:bg-[#486390] transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem" }}
              >
                {submitting ? "Creating..." : "+ Create Admin"}
              </button>
            </form>
          </div>

          {/* ── Existing Admins ─────────────────────────────────── */}
          <div>
            <h3
              className="text-lg text-black uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Existing Admins ({localAdmins.length})
            </h3>
            {localAdmins.length === 0 ? (
              <div className="border-2 border-black rounded-[10px] px-4 py-6 text-center text-gray-400 font-sans text-sm">
                No admins created yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {localAdmins.map((admin) => (
                  <div
                    key={admin._id}
                    className="border-2 border-black rounded-[10px] px-4 py-3 flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: admin.isActive ? "#fff" : "#f5f5f5" }}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-black font-sans truncate">{admin.email}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs border border-black px-2 py-0.5 rounded-[4px] uppercase tracking-wide font-bold"
                          style={{ backgroundColor: "#ECE9C7", fontFamily: "var(--font-bebas)", fontSize: "0.7rem" }}
                        >
                          {DEPT_LABEL[admin.department] || admin.department}
                        </span>
                        <span
                          className={`text-xs font-bold font-sans ${admin.isActive ? "text-green-600" : "text-gray-400"}`}
                        >
                          {admin.isActive ? "● Active" : "○ Inactive"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(admin._id)}
                      disabled={toggling === admin._id}
                      className={`border-2 border-black rounded-[8px] px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50 whitespace-nowrap ${
                        admin.isActive
                          ? "bg-red-50 hover:bg-red-100 text-red-700"
                          : "bg-green-50 hover:bg-green-100 text-green-700"
                      }`}
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "0.75rem" }}
                    >
                      {toggling === admin._id ? "..." : admin.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
