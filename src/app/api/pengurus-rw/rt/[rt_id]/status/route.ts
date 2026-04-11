import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ rt_id: string }> },
) {
  const { rt_id } = await params;
  const u = await requireRole(req, ["pengurus_rw"]).catch(() => null);
  if (!u?.rwId) return jsonErr("Forbidden", 403);

  // Validate that rt_id belongs to this RW
  const rt = await prisma.rt.findFirst({
    where: { id: rt_id, rwId: u.rwId },
  });
  if (!rt) return jsonErr("RT tidak ditemukan atau tidak dalam RW Anda", 404);

  const url = new URL(req.url);
  const periode = url.searchParams.get("periode") ?? format(new Date(), "yyyy-MM");

  const [totalTagihan, lunas, pending, rumahAktif, totalPemasukan] = await Promise.all([
    prisma.tagihan.count({ where: { rtId: rt_id, periode } }),
    prisma.tagihan.count({ where: { rtId: rt_id, periode, status: "lunas" } }),
    prisma.pembayaran.count({
      where: { status: "pending", tagihan: { rtId: rt_id, periode } },
    }),
    prisma.rumah.count({ where: { rtId: rt_id, status: "aktif" } }),
    prisma.pembayaran.aggregate({
      where: { status: "approved", tagihan: { rtId: rt_id, periode } },
      _sum: { nominal: true },
    }),
  ]);

  return jsonOk({
    rtId: rt_id,
    nama: rt.nama,
    periode,
    totalTagihan,
    lunas,
    belum: totalTagihan - lunas,
    pending,
    compliance: totalTagihan === 0 ? 100 : Math.round((lunas / totalTagihan) * 100),
    totalPemasukan: Number(totalPemasukan._sum.nominal ?? 0),
    rumahAktif,
  });
}
