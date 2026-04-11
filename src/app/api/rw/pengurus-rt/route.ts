import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);

    const rts = await prisma.rt.findMany({
      where: { rwId: u.rwId },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });
    const rtIds = rts.map(r => r.id);

    const pengurusRt = await prisma.user.findMany({
      where: { role: "pengurus_rt", rtId: { in: rtIds } },
      select: { id: true, nama: true, username: true, status: true, rtId: true, createdAt: true },
      orderBy: [{ rtId: "asc" }, { nama: "asc" }],
    });

    return jsonOk({ rts, pengurusRt });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);

    const { nama, username, password, rtId } = await req.json().catch(() => ({})) as Record<string, string>;
    if (!nama?.trim())     return jsonErr("Nama wajib diisi");
    if (!username?.trim()) return jsonErr("Username wajib diisi");
    if (!password || password.length < 8) return jsonErr("Password minimal 8 karakter");
    if (!rtId)             return jsonErr("Pilih RT terlebih dahulu");

    // Validasi rtId milik RW ini
    const rt = await prisma.rt.findFirst({ where: { id: rtId, rwId: u.rwId } });
    if (!rt) return jsonErr("RT tidak ditemukan atau bukan milik RW ini", 404);

    // Cek username unik
    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) return jsonErr("Username sudah digunakan");

    const user = await prisma.user.create({
      data: {
        nama: nama.trim(),
        username: username.trim(),
        passwordHash: await bcrypt.hash(password, 10),
        role: "pengurus_rt",
        status: "aktif",
        rtId,
      },
      select: { id: true, nama: true, username: true, status: true, rtId: true, createdAt: true },
    });

    return jsonOk(user, 201);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string; code?: string };
    if (err.code === "P2002") return jsonErr("Username sudah digunakan");
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
