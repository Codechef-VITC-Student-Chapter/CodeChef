import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    logApiExecution("GET", "/api/applicants", res.status, Date.now() - start, `Loaded ${data.applicants?.length || 0} applicants`);
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
    logApiExecution("GET", "/api/auth/admins", res.status, Date.now() - start, `Loaded ${data.length || 0} admins`);
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
    <main className="min-h-screen w-full bg-white">
      <header className="border-b-2 border-black px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl text-black tracking-widest uppercase"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            CodeChef Admin
          </h1>
          <span
            className="text-xs border-2 border-black px-2 py-0.5 rounded-[6px] uppercase tracking-wider font-bold"
            style={{
              backgroundColor: session.role === "super_admin" ? "#ECE9C7" : "#e0e7ff",
              fontFamily: "var(--font-bebas)",
            }}
          >
            {session.role === "super_admin" ? "⭐ Super Admin" : `Admin · ${session.department?.replace(/_/g, " ")}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session.role === "super_admin" && (
            <a
              href="/admin"
              className="text-sm font-bold text-black border-2 border-black rounded-[8px] px-4 py-1.5 uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#ECE9C7] transition-colors"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem" }}
            >
              ← Members
            </a>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
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
