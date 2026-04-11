import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const u = await requireRole(req, ["pengurus_rw"]);
    if (!u.rwId) return jsonErr("Tidak terhubung ke RW", 403);

    const { nama } = await req.json().catch(() => ({})) as { nama?: string };
    if (!nama?.trim()) return jsonErr("Nama RT tidak boleh kosong");

    const rt = await prisma.rt.create({
      data: { rwId: u.rwId, nama: nama.trim() },
      select: { id: true, nama: true, createdAt: true },
    });

    // Buat RtSettings default sekalian
    await prisma.rtSettings.create({ data: { rtId: rt.id } });

    return jsonOk(rt, 201);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
