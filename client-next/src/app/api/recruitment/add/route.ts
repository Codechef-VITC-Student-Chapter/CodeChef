import { NextRequest, NextResponse } from "next/server";
import { logApiExecution, logBackendForward } from "@/lib/logger";

// Keep all normalization helpers unchanged
function copyFirstPresent(target: Record<string, unknown>, source: Record<string, unknown>, key: string, aliases: string[] = []) {
  const keys = [key, `pref2_${key}`, ...aliases, ...aliases.map((alias) => `pref2_${alias}`)];
  for (const candidate of keys) {
    if (source[candidate] !== undefined && source[candidate] !== null && source[candidate] !== "") {
      target[key] = source[candidate];
      return;
    }
  }
}

function normalizeRecruitmentData(data: Record<string, unknown>) {
  if (typeof data.department !== "string" || !["design", "management", "marketing_and_outreach"].includes(data.department)) return data;
  const normalized: Record<string, unknown> = { ...data };
  const commonFields = ["name", "reg_no", "vit_email", "phone_no", "degree", "branch", "experience", "whyJoin", "department", "cgpa"];
  for (const field of commonFields) copyFirstPresent(normalized, data, field);
  if (data.department === "design") {
    copyFirstPresent(normalized, data, "designSkills", ["designSoftware"]);
    copyFirstPresent(normalized, data, "whyDesign");
    copyFirstPresent(normalized, data, "yourWork");
    copyFirstPresent(normalized, data, "designPortfolio");
  } else if (data.department === "management") {
    copyFirstPresent(normalized, data, "hostelerORdayscholar");
    copyFirstPresent(normalized, data, "otherClub");
    copyFirstPresent(normalized, data, "roleInCurrentClub", ["managementExperience"]);
    copyFirstPresent(normalized, data, "handleSituation", ["uncooperativeMember"]);
    copyFirstPresent(normalized, data, "strength", ["managementStrengths"]);
    copyFirstPresent(normalized, data, "effectiveComm", ["managementCommunications"]);
  } else if (data.department === "marketing_and_outreach") {
    copyFirstPresent(normalized, data, "hostelerORdayscholar", ["outreachExperience"]);
    copyFirstPresent(normalized, data, "secureSponsors", ["outreachSponsorship"]);
    copyFirstPresent(normalized, data, "promoteEvent", ["outreachCaptions"]);
    copyFirstPresent(normalized, data, "moreParticipants");
  }
  for (const key of Object.keys(normalized)) {
    if (key.startsWith("pref2_") || normalized[key] === undefined || normalized[key] === null) delete normalized[key];
  }
  return normalized;
}

const EXPRESS_BASE_URL = process.env.EXPRESS_API_URL || "http://localhost:4002";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const pathname = "/api/recruitment/add";

  try {
    const { data: rawData } = await req.json();
    if (!rawData || !rawData.department) {
      logApiExecution("POST", pathname, 400, Date.now() - start, "Missing department");
      return NextResponse.json({ error: "Missing submission data or department" }, { status: 400 });
    }

    const data = normalizeRecruitmentData(rawData);
    const targetUrl = `${EXPRESS_BASE_URL}/api/applicants`;
    logBackendForward("POST", pathname, targetUrl);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logApiExecution("POST", pathname, res.status, Date.now() - start, "Express save failed");
      return NextResponse.json({ error: err.error || "Failed to save application" }, { status: res.status });
    }

    const resData = await res.json();
    logApiExecution("POST", pathname, 201, Date.now() - start, `Saved applicant for ${String(data.department)}`);
    return NextResponse.json(resData);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error saving recruitment entry:", error);
    logApiExecution("POST", pathname, 500, Date.now() - start, msg);
    return NextResponse.json({ error: "Internal Server Error", details: msg }, { status: 500 });
  }
}
