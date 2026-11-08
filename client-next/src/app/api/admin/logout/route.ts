import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logApiExecution } from "@/lib/logger";

export async function POST() {
  const start = Date.now();
  const pathname = "/api/admin/logout";

  const cookieStore = await cookies();
  cookieStore.set("admin_jwt", "", { maxAge: 0, path: "/" });
  cookieStore.set("admin_session", "", { maxAge: 0, path: "/" });

  logApiExecution("POST", pathname, 200, Date.now() - start, "Cookies cleared");
  return NextResponse.json({ ok: true });
}
