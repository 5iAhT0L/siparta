import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";
import {
  findValidRefreshToken,
  generateRefreshToken,
  revokeRefreshTokenById,
  storeRefreshToken,
} from "@/lib/refresh-token";
import { jsonErr, jsonOk } from "@/lib/api-helpers";

export async function POST() {
  const jar = await cookies();
  const raw = jar.get("refresh_token")?.value;
  if (!raw) return jsonErr("Tidak ada sesi", 401);

  const row = await findValidRefreshToken(raw);
  if (!row) return jsonErr("Sesi tidak valid", 401);

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
  });
  if (!user || user.status !== "aktif") {
    return jsonErr("Sesi tidak valid", 401);
  }

  await revokeRefreshTokenById(row.id);
  const newRaw = generateRefreshToken();
  await storeRefreshToken(user.id, newRaw);

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    rtId: user.rtId,
    rwId: user.rwId,
    rumahId: user.rumahId,
  });

  const res = jsonOk({
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      rtId: user.rtId,
      rwId: user.rwId,
      rumahId: user.rumahId,
    },
  });

  res.cookies.set("refresh_token", newRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
