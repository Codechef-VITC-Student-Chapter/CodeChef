import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanityWriteClient";
import { requireAdminSession } from "@/lib/requireAdminSession";
import { logApiExecution } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/admin/members";

  const session = await requireAdminSession();
  if (session instanceof NextResponse) {
    logApiExecution("POST", pathname, 401, Date.now() - start, "Unauthorized");
    return session;
  }

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const codechefUsername =
      typeof body.codechefUsername === "string" ? body.codechefUsername.trim() : "";
    const rating = Number(body.rating);

    if (!name) {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Validation: Name required");
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!codechefUsername) {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Validation: Username required");
      return NextResponse.json({ error: "CodeChef username is required." }, { status: 400 });
    }
    if (!Number.isFinite(rating)) {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Validation: Rating invalid");
      return NextResponse.json({ error: "Rating must be a valid number." }, { status: 400 });
    }

    const member = await writeClient.create({
      _type: "users",
      name,
      codechefUsername,
      rating,
      active: true,
    });

    logApiExecution("POST", pathname, 201, Date.now() - start, `Created member ${name}`);
    return NextResponse.json(member, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error creating member:", error);
    logApiExecution("POST", pathname, 500, Date.now() - start, msg);
    return NextResponse.json({ error: "Internal Server Error", details: msg }, { status: 500 });
  }
}
