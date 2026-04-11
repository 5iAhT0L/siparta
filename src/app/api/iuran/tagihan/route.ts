import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireAuth(req).catch(() => null);
  if (!u) return jsonErr("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const periode = searchParams.get("periode"); // format: YYYY-MM

  if (u.role === "pengurus_rt") {
    // Jika ada filter periode: tampilkan tagihan bulanan bulan itu
    // PLUS tagihan insidental yang dibuat di bulan yang sama (by createdAt)
    const whereClause = periode
      ? {
          rtId: u.rtId!,
          OR: [
            { periode },
            {
              periode: { startsWith: "ins-" },
              createdAt: {
                gte: new Date(`${periode}-01T00:00:00.000Z`),
                lt:  new Date(
                  new Date(`${periode}-01T00:00:00.000Z`).setMonth(
                    new Date(`${periode}-01T00:00:00.000Z`).getMonth() + 1,
                  ),
                ),
              },
            },
          ],
        }
      : { rtId: u.rtId! };

    const list = await prisma.tagihan.findMany({
      where: whereClause,
      orderBy: [{ periode: "desc" }, { rumahId: "asc" }],
      include: {
        rumah:      { select: { nomorRumah: true, kk: { select: { namaKepalaKeluarga: true }, take: 1 } } },
        jenisIuran: { select: { nama: true, tipe: true } },
      },
    });
    return jsonOk(list);
  }

  if (u.role === "warga" && u.rumahId) {
    const list = await prisma.tagihan.findMany({
      where: {
        rumahId: u.rumahId,
        ...(periode ? { periode } : {}),
      },
      orderBy: { periode: "desc" },
      include: { jenisIuran: { select: { nama: true, tipe: true } } },
    });
    return jsonOk(list);
  }

  return jsonErr("Forbidden", 403);
}
