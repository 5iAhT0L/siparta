import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  if (u.role === "warga" && u.rumahId) {
    const list = await prisma.pembayaran.findMany({
      where: { rumahId: u.rumahId },
      orderBy: { submittedAt: "desc" },
      include: {
        tagihan: { include: { jenisIuran: { select: { nama: true } } } },
      },
    });
    return jsonOk(list);
  }

  if (u.role === "pengurus_rt" && u.rtId) {
    const list = await prisma.pembayaran.findMany({
      where: { tagihan: { rtId: u.rtId } },
      orderBy: { submittedAt: "desc" },
      take: 500,
      include: {
        rumah: { select: { nomorRumah: true } },
        tagihan: { include: { jenisIuran: { select: { nama: true } } } },
        submittedBy: { select: { nama: true, username: true } },
      },
    });
    return jsonOk(list);
  }

  return jsonErr("Forbidden", 403);
}
