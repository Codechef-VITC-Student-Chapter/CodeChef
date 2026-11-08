import { NextResponse } from "next/server";
import { logApiExecution, logBackendForward } from "@/lib/logger";

const EXPRESS_BASE_URL = process.env.EXPRESS_API_URL || "http://localhost:4002";

export async function GET() {
  const start = Date.now();
  const pathname = "/api/recruitment/read";

  try {
    const targetUrl = `${EXPRESS_BASE_URL}/api/applicants/public-check`;
    logBackendForward("GET", pathname, targetUrl);

    const res = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      logApiExecution("GET", pathname, res.status, Date.now() - start, "Express check non-200");
      return NextResponse.json([]);
    }

    const data = await res.json();
    const result = Array.isArray(data) ? data : [];
    logApiExecution("GET", pathname, 200, Date.now() - start, `Returned ${result.length} duplicate entries`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error reading recruitment duplicate list:", msg);
    logApiExecution("GET", pathname, 500, Date.now() - start, "Backend unreachable, fallback empty array");
    return NextResponse.json([]);
  }
}
