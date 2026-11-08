import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminJwt } from "./jwt";

const EXPRESS_BASE_URL = process.env.EXPRESS_API_URL || "http://localhost:4002";

export interface AdminSession {
  email: string;
  role: "super_admin" | "admin";
  department: string | null;
}

export async function requireAdminSession(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_jwt")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fast-path: local cryptographic JWT verification
  const localPayload = await verifyAdminJwt(token);
  if (localPayload) {
    return {
      email: localPayload.email,
      role: localPayload.role,
      department: localPayload.department,
    };
  }

  // Fallback: verify against Express backend
  try {
    const res = await fetch(`${EXPRESS_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = (await res.json()) as AdminSession;
    return session;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export function getAdminJwt(cookieStore: { get: (name: string) => { value: string } | undefined }): string | undefined {
  return cookieStore.get("admin_jwt")?.value;
}
