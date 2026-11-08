import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanityWriteClient";
import { requireAdminSession } from "@/lib/requireAdminSession";
import { logApiExecution } from "@/lib/logger";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  const pathname = "/api/admin/members/[id]";

  const session = await requireAdminSession();
  if (session instanceof NextResponse) {
    logApiExecution("PATCH", pathname, 401, Date.now() - start, "Unauthorized");
    return session;
  }

  try {
    const { id } = await context.params;
    if (!id) {
      logApiExecution("PATCH", pathname, 400, Date.now() - start, "Missing id");
      return NextResponse.json({ error: "Missing member id." }, { status: 400 });
    }

    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        logApiExecution("PATCH", pathname, 400, Date.now() - start, "Validation: Name required");
        return NextResponse.json({ error: "Name is required." }, { status: 400 });
      }
      patch.name = name;
    }

    if (body.codechefUsername !== undefined) {
      const codechefUsername =
        typeof body.codechefUsername === "string" ? body.codechefUsername.trim() : "";
      if (!codechefUsername) {
        logApiExecution("PATCH", pathname, 400, Date.now() - start, "Validation: Username required");
        return NextResponse.json({ error: "CodeChef username is required." }, { status: 400 });
      }
      patch.codechefUsername = codechefUsername;
    }

    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isFinite(rating)) {
        logApiExecution("PATCH", pathname, 400, Date.now() - start, "Validation: Rating invalid");
        return NextResponse.json({ error: "Rating must be a valid number." }, { status: 400 });
      }
      patch.rating = rating;
    }

    if (body.active !== undefined) {
      patch.active = Boolean(body.active);
    }

    if (Object.keys(patch).length === 0) {
      logApiExecution("PATCH", pathname, 400, Date.now() - start, "No valid fields to patch");
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const member = await writeClient.patch(id).set(patch).commit();
    logApiExecution("PATCH", pathname, 200, Date.now() - start, `Updated member ${id}`);
    return NextResponse.json(member);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error updating member:", error);
    logApiExecution("PATCH", pathname, 500, Date.now() - start, msg);
    return NextResponse.json({ error: "Internal Server Error", details: msg }, { status: 500 });
  }
}
