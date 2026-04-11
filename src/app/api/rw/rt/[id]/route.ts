import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

/** PUT — ubah nama RT */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const { id } = await params;

    const rt = await prisma.rt.findFirst({ where: { id, rwId: u.rwId } });
    if (!rt) return jsonErr("RT tidak ditemukan", 404);

    const { nama } = await req.json().catch(() => ({})) as { nama?: string };
    if (!nama?.trim()) return jsonErr("Nama RT tidak boleh kosong");

    const updated = await prisma.rt.update({
      where: { id },
      data: { nama: nama.trim() },
      select: { id: true, nama: true },
    });
    return jsonOk(updated);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}

/** DELETE — hapus RT, hanya jika tidak ada rumah */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const { id } = await params;

    const rt = await prisma.rt.findFirst({ where: { id, rwId: u.rwId } });
    if (!rt) return jsonErr("RT tidak ditemukan", 404);

    const jumlahRumah = await prisma.rumah.count({ where: { rtId: id } });
    if (jumlahRumah > 0) return jsonErr(`Tidak bisa dihapus — RT masih memiliki ${jumlahRumah} rumah. Pindahkan atau hapus rumah terlebih dahulu.`, 409);

    await prisma.rt.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
