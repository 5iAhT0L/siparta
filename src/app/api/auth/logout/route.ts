import { cookies } from "next/headers";
import { revokeRefreshTokenByHash } from "@/lib/refresh-token";
import { jsonOk } from "@/lib/api-helpers";

export async function POST() {
  const jar = await cookies();
  const raw = jar.get("refresh_token")?.value;
  if (raw) await revokeRefreshTokenByHash(raw);

  const res = jsonOk({ ok: true });
  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
