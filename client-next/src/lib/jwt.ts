export interface JwtAdminPayload {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  department: string | null;
  iat?: number;
  exp?: number;
}

export const DEFAULT_JWT_SECRET = "codechef_jwt_secret_change_in_prod_2025";

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function verifyAdminJwt(
  token: string | undefined | null,
  secret: string = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
): Promise<JwtAdminPayload | null> {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const payloadBytes = base64UrlDecode(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload: JwtAdminPayload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigBytes = base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes as unknown as BufferSource, data);

    return valid ? payload : null;
  } catch {
    return null;
  }
}
