import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

/** Validasi bahwa user target adalah pengurus_rt di bawah RW pemanggil */
async function resolveTarget(callerRwId: string, id: string) {
  const rts = await prisma.rt.findMany({ where: { rwId: callerRwId }, select: { id: true } });
  const rtIds = rts.map(r => r.id);
  return prisma.user.findFirst({
    where: { id, role: "pengurus_rt", rtId: { in: rtIds } },
    select: { id: true, nama: true, username: true, status: true, rtId: true },
  });
}

/** PUT — aktifkan atau nonaktifkan */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const { id } = await params;
    const target = await resolveTarget(u.rwId, id);
    if (!target) return jsonErr("Pengurus RT tidak ditemukan", 404);

    const { status } = await req.json().catch(() => ({})) as { status?: string };
    if (status !== "aktif" && status !== "tidak_aktif") return jsonErr("Status tidak valid");

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, nama: true, username: true, status: true, rtId: true },
    });
    return jsonOk(updated);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}

/** DELETE — hapus permanen (hanya jika tidak ada data terkait, untuk keamanan data) */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const { id } = await params;
    const target = await resolveTarget(u.rwId, id);
    if (!target) return jsonErr("Pengurus RT tidak ditemukan", 404);

    await prisma.user.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string; code?: string };
    if (err.code === "P2003") return jsonErr("Tidak dapat dihapus karena masih memiliki data terkait. Nonaktifkan saja.", 409);
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
