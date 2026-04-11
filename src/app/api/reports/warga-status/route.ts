import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const url = new URL(req.url);
  const periode = url.searchParams.get("periode") ?? format(new Date(), "yyyy-MM");

  const tagihan = await prisma.tagihan.findMany({
    where: { rtId: u.rtId, periode },
    include: {
      rumah: {
        select: {
          nomorRumah: true,
          alamat: true,
          kk: { select: { namaKepalaKeluarga: true }, take: 1 },
        },
      },
      jenisIuran: { select: { nama: true } },
    },
    orderBy: [{ rumah: { nomorRumah: "asc" } }, { jenisIuran: { nama: "asc" } }],
  });

  return jsonOk({ periode, tagihan });
}
