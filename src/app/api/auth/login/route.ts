import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signAccessToken } from "@/lib/jwt";
import {
  generateRefreshToken,
  storeRefreshToken,
} from "@/lib/refresh-token";
import { clientIp, jsonErr, jsonOk, rateLimitLogin, resetRateLimit } from "@/lib/api-helpers";

const bodySchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimitLogin(ip)) {
    return jsonErr("Terlalu banyak percobaan login. Coba lagi nanti.", 429);
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return jsonErr("Payload tidak valid", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: body.identifier }, { noKtp: body.identifier }],
    },
  });

  if (!user) {
    return jsonErr("Username/NIK tidak ditemukan", 401);
  }

  if (user.status === "tidak_aktif" && user.role === "warga") {
    return jsonErr("Akun Anda sedang menunggu verifikasi pengurus RT", 403);
  }

  if (user.status === "tidak_aktif" && user.role === "pengurus_rt") {
    return jsonErr("Akun Anda tidak aktif, silakan hubungi pengurus RW", 403);
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return jsonErr("Password salah", 401);
  }

  const accessPayload = {
    sub: user.id,
    role: user.role,
    rtId: user.rtId,
    rwId: user.rwId,
    rumahId: user.rumahId,
  };
  resetRateLimit(ip);
  const accessToken = await signAccessToken(accessPayload);
  const rawRefresh = generateRefreshToken();
  await storeRefreshToken(user.id, rawRefresh);

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

  res.cookies.set("refresh_token", rawRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
