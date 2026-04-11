import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const rw = await prisma.rw.findUnique({ where: { id: u.rwId }, select: { id: true, nama: true, alamat: true } });
    if (!rw) return jsonErr("RW tidak ditemukan", 404);
    return jsonOk(rw);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}

export async function PUT(req: Request) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);
    const { nama, alamat } = await req.json().catch(() => ({})) as Record<string, string>;
    if (!nama?.trim()) return jsonErr("Nama RW tidak boleh kosong");
    const rw = await prisma.rw.update({
      where: { id: u.rwId },
      data: { nama: nama.trim(), alamat: alamat?.trim() || null },
      select: { id: true, nama: true, alamat: true },
    });
    return jsonOk(rw);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
