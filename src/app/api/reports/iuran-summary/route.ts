import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const periode = searchParams.get("periode") ?? format(new Date(), "yyyy-MM");

  if (u.role === "pengurus_rt" && u.rtId) {
    const totalTagihan = await prisma.tagihan.count({
      where: { rtId: u.rtId, periode },
    });
    const lunas = await prisma.tagihan.count({
      where: { rtId: u.rtId, periode, status: "lunas" },
    });
    const pemasukan = await prisma.pembayaran.aggregate({
      where: {
        status: "approved",
        tagihan: { rtId: u.rtId, periode },
      },
      _sum: { nominal: true },
    });
    return jsonOk({
      periode,
      totalTagihan,
      lunas,
      belum: totalTagihan - lunas,
      totalPemasukan: Number(pemasukan._sum.nominal ?? 0),
    });
  }

  if (u.role === "warga" && u.rumahId) {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    if (!rumah) return jsonOk({});
    const totalTagihan = await prisma.tagihan.count({
      where: { rumahId: u.rumahId, periode },
    });
    const lunas = await prisma.tagihan.count({
      where: { rumahId: u.rumahId, periode, status: "lunas" },
    });
    return jsonOk({
      periode,
      totalTagihan,
      lunas,
      belum: totalTagihan - lunas,
    });
  }

  return jsonErr("Forbidden", 403);
}
