import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiExecution, logBackendForward } from "@/lib/logger";

const EXPRESS_BASE_URL = process.env.EXPRESS_API_URL || "http://localhost:4002";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/admin/login";

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      logApiExecution("POST", pathname, 401, Date.now() - start, "Missing email or password");
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const targetUrl = `${EXPRESS_BASE_URL}/api/auth/login`;
    logBackendForward("POST", pathname, targetUrl);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      logApiExecution("POST", pathname, 401, Date.now() - start, "Invalid credentials");
      return NextResponse.json({ error: data.error || "Invalid email or password." }, { status: 401 });
    }

    const { token, role, department } = await res.json();
    const cookieStore = await cookies();
    cookieStore.set("admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    logApiExecution("POST", pathname, 200, Date.now() - start, `Logged in: role=${role}, dept=${department || "all"}`);
    return NextResponse.json({ ok: true, role, department });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Login proxy error:", error);
    logApiExecution("POST", pathname, 500, Date.now() - start, msg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
