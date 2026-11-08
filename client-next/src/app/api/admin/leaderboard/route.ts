import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/lib/sanityWriteClient";
import { client } from "@/lib/sanityClient";
import { requireAdminSession } from "@/lib/requireAdminSession";
import { logApiExecution } from "@/lib/logger";

export async function PUT(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/admin/leaderboard";

  const session = await requireAdminSession();
  if (session instanceof NextResponse) {
    logApiExecution("PUT", pathname, 401, Date.now() - start, "Unauthorized");
    return session;
  }

  try {
    const body = await req.json();
    const memberIds: unknown = body.memberIds;

    if (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== "string" || !id)) {
      logApiExecution("PUT", pathname, 400, Date.now() - start, "Validation: invalid memberIds array");
      return NextResponse.json({ error: "memberIds must be an array of member ids." }, { status: 400 });
    }
    if (memberIds.length > 10) {
      logApiExecution("PUT", pathname, 400, Date.now() - start, "Validation: >10 members");
      return NextResponse.json({ error: "The leaderboard can have at most 10 members." }, { status: 400 });
    }
    if (new Set(memberIds).size !== memberIds.length) {
      logApiExecution("PUT", pathname, 400, Date.now() - start, "Validation: duplicate memberId");
      return NextResponse.json({ error: "The same member cannot appear twice in the leaderboard." }, { status: 400 });
    }

    if (memberIds.length > 0) {
      const activeMembers: string[] = await client.fetch(
        `*[_type == "users" && active == true && _id in $ids]._id`,
        { ids: memberIds },
        { useCdn: false }
      );
      const invalidIds = memberIds.filter((id) => !activeMembers.includes(id as string));
      if (invalidIds.length > 0) {
        logApiExecution("PUT", pathname, 400, Date.now() - start, "Validation: inactive or missing memberId");
        return NextResponse.json(
          { error: "One or more selected members are not active or do not exist." },
          { status: 400 }
        );
      }
    }

    const top10 = memberIds.map((id, index) => ({
      _type: "reference",
      _ref: id,
      _key: `${id}-${index}`,
    }));

    await writeClient.createOrReplace({
      _id: "currentLeaderboard",
      _type: "currentLeaderboard",
      top10,
    });

    revalidatePath("/leaderboard");
    logApiExecution("PUT", pathname, 200, Date.now() - start, `Updated leaderboard with ${memberIds.length} members`);
    return NextResponse.json({ ok: true, message: "Leaderboard updated successfully." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error updating leaderboard:", error);
    logApiExecution("PUT", pathname, 500, Date.now() - start, msg);
    return NextResponse.json({ error: "Internal Server Error", details: msg }, { status: 500 });
  }
}
