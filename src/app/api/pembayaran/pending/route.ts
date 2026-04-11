import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const list = await prisma.pembayaran.findMany({
    where: {
      status: "pending",
      inputByPengurus: false,
      tagihan: { rtId: u.rtId },
    },
    orderBy: { submittedAt: "asc" },
    include: {
      rumah: { select: { nomorRumah: true } },
      tagihan: { include: { jenisIuran: { select: { nama: true } } } },
      submittedBy: { select: { nama: true, username: true } },
    },
  });
  return jsonOk(list);
}
