import { NextResponse } from "next/server";
import { verifyAccessToken, type AccessPayload } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(
    data,
    typeof init === "number" ? { status: init } : init,
  );
}

export function jsonErr(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

export async function getAccessPayload(
  req: Request,
): Promise<AccessPayload | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  username: string;
  nama: string;
  role: string;
  status: string;
  rtId: string | null;
  rwId: string | null;
  rumahId: string | null;
};

export async function requireAuth(req: Request): Promise<SessionUser> {
  const payload = await getAccessPayload(req);
  if (!payload) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      username: true,
      nama: true,
      role: true,
      status: true,
      rtId: true,
      rwId: true,
      rumahId: true,
    },
  });
  if (!user || user.status !== "aktif") {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return user;
}

export async function requireRole(
  req: Request,
  roles: string[],
): Promise<SessionUser> {
  const u = await requireAuth(req);
  if (!roles.includes(u.role)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return u;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const loginAttempts = new Map<string, { n: number; reset: number }>();

export function rateLimitLogin(
  ip: string,
  max = 20,
  windowMs = 15 * 60 * 1000,
): boolean {
  const now = Date.now();
  const cur = loginAttempts.get(ip);
  if (!cur || now > cur.reset) {
    loginAttempts.set(ip, { n: 1, reset: now + windowMs });
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export function clearAllRateLimits(): void {
  loginAttempts.clear();
}
