import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rw"]).catch(() => null);
  if (!u?.rwId) return jsonErr("Forbidden", 403);

  const periode = format(new Date(), "yyyy-MM");
  const rts = await prisma.rt.findMany({
    where: { rwId: u.rwId },
    orderBy: { nama: "asc" },
  });

  const out = await Promise.all(
    rts.map(async (rt) => {
      const totalTagihan = await prisma.tagihan.count({
        where: { rtId: rt.id, periode },
      });
      const lunas = await prisma.tagihan.count({
        where: { rtId: rt.id, periode, status: "lunas" },
      });
      const pemasukan = await prisma.pembayaran.aggregate({
        where: {
          status: "approved",
          tagihan: { rtId: rt.id, periode },
        },
        _sum: { nominal: true },
      });
      const rumahAktif = await prisma.rumah.count({
        where: { rtId: rt.id, status: "aktif" },
      });
      return {
        rtId: rt.id,
        nama: rt.nama,
        periode,
        totalTagihan,
        lunas,
        belum: totalTagihan - lunas,
        compliance:
          totalTagihan === 0 ? 100 : Math.round((lunas / totalTagihan) * 100),
        totalPemasukan: Number(pemasukan._sum.nominal ?? 0),
        rumahAktif,
      };
    }),
  );

  await prisma.auditLog.create({
    data: {
      userId: u.id,
      action: "pengurus_rw_dashboard_view",
      resource: "rw_dashboard",
      metadata: { rwId: u.rwId },
    },
  });

  return jsonOk({ rts: out });
}
