import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import RecruitmentDashboard from "@/components/Admin/RecruitmentDashboard";
import LogoutButton from "@/components/Admin/LogoutButton";
import { logBackendForward, logApiExecution } from "@/lib/logger";

export const dynamic = "force-dynamic";

const EXPRESS_BASE_URL = process.env.EXPRESS_API_URL || "http://localhost:4002";

async function getSession(token: string) {
  const start = Date.now();
  const targetUrl = `${EXPRESS_BASE_URL}/api/auth/me`;
  logBackendForward("GET", "RSC /admin/recruitment", targetUrl);
  try {
    const res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    logApiExecution("GET", "/api/auth/me", res.status, Date.now() - start, "Session verified");
    if (!res.ok) return null;
    return res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logApiExecution("GET", "/api/auth/me", 500, Date.now() - start, msg);
    return null;
  }
}

async function getApplicants(token: string, dept?: string) {
  const start = Date.now();
  const url = new URL(`${EXPRESS_BASE_URL}/api/applicants`);
  if (dept) url.searchParams.set("dept", dept);
  url.searchParams.set("limit", "500");
  logBackendForward("GET", "RSC /admin/recruitment", url.toString());
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = res.ok ? await res.json() : { applicants: [], total: 0 };
    logApiExecution(
      "GET",
      "/api/applicants",
      res.status,
      Date.now() - start,
      `Loaded ${data.applicants?.length || 0} applicants`
    );
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logApiExecution("GET", "/api/applicants", 500, Date.now() - start, msg);
    return { applicants: [], total: 0 };
  }
}

async function getAdmins(token: string) {
  const start = Date.now();
  const targetUrl = `${EXPRESS_BASE_URL}/api/auth/admins`;
  logBackendForward("GET", "RSC /admin/recruitment", targetUrl);
  try {
    const res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = res.ok ? await res.json() : [];
    logApiExecution(
      "GET",
      "/api/auth/admins",
      res.status,
      Date.now() - start,
      `Loaded ${data.length || 0} admins`
    );
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logApiExecution("GET", "/api/auth/admins", 500, Date.now() - start, msg);
    return [];
  }
}

export default async function RecruitmentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_jwt")?.value;
  if (!token) redirect("/admin/login");

  const session = await getSession(token);
  if (!session) redirect("/admin/login");

  const [{ applicants, total }, admins] = await Promise.all([
    getApplicants(token, sp.dept),
    session.role === "super_admin" ? getAdmins(token) : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen w-full bg-[#FAFAFA] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] text-slate-900">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="border-b-2 border-black px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_2px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 border-2 border-black rounded-[8px] bg-[#5878AF] p-1 shadow-[2px_2px_0px_#000] flex items-center justify-center overflow-hidden">
            <Image
              src="/images/mascot_hat.png"
              alt="CodeChef Mascot"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className="text-xl sm:text-2xl text-black tracking-widest font-black leading-none"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                CODECHEF
              </span>
              <span className="text-[10px] font-black tracking-wider uppercase bg-[#ECE9C7] text-black border border-black px-1.5 py-0.5 rounded-[4px] shadow-[1px_1px_0px_#000]">
                VIT CHENNAI
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase font-sans">
              Admin Command Center
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l-2 border-slate-300">
            <span
              className={`text-xs border-2 border-black px-2.5 py-0.5 rounded-[6px] uppercase tracking-wider font-bold shadow-[2px_2px_0px_#000] ${
                session.role === "super_admin"
                  ? "bg-[#ECE9C7] text-black"
                  : "bg-[#E0E7FF] text-[#3730A3]"
              }`}
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              {session.role === "super_admin"
                ? "⭐ Super Admin"
                : `Dept Admin · ${session.department?.replace(/_/g, " ")}`}
            </span>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {session.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {session.role === "super_admin" && (
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black border-2 border-black rounded-[8px] px-3.5 py-1.5 uppercase tracking-wider bg-white hover:bg-[#ECE9C7] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              ← Core Members
            </a>
          )}
          <LogoutButton />
        </div>
      </header>

      {/* ── Main Dashboard Container ──────────────────────────────────── */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecruitmentDashboard
          initialApplicants={applicants}
          total={total}
          session={session}
          admins={admins}
          token={token}
          activeDept={sp.dept || ""}
        />
      </div>
    </main>
  );
}
