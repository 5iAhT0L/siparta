import { jsonOk, jsonErr, requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const { nama, oldPassword, newPassword } = body as Record<string, string>;

    const updates: Record<string, unknown> = {};

    if (nama !== undefined) {
      if (typeof nama !== "string" || !nama.trim()) return jsonErr("Nama tidak boleh kosong");
      updates.nama = nama.trim();
    }

    if (newPassword !== undefined || oldPassword !== undefined) {
      if (!oldPassword || !newPassword) return jsonErr("Password lama dan baru wajib diisi");
      if (newPassword.length < 8) return jsonErr("Password baru minimal 8 karakter");

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
      });
      if (!dbUser) return jsonErr("User tidak ditemukan", 404);

      const match = await bcrypt.compare(oldPassword, dbUser.passwordHash);
      if (!match) return jsonErr("Password lama salah");

      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) return jsonErr("Tidak ada perubahan yang dikirim");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, username: true, nama: true, role: true, rtId: true, rwId: true, rumahId: true },
    });

    return jsonOk({ user: updated });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err.status) return jsonErr(err.message ?? "Error", err.status);
    return jsonErr("Terjadi kesalahan", 500);
  }
}
