import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const url = new URL(req.url);
  const bulan = url.searchParams.get("bulan"); // yyyy-MM
  const tahun = url.searchParams.get("tahun"); // yyyy

  const where: Record<string, unknown> = { rtId: u.rtId };
  if (bulan) {
    const [y, m] = bulan.split("-").map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0, 23, 59, 59);
    where.recordedDate = { gte: from, lte: to };
  } else if (tahun) {
    const y = Number(tahun);
    where.recordedDate = { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59) };
  }

  const records = await prisma.kas.findMany({
    where,
    orderBy: { recordedDate: "desc" },
    include: { recordedBy: { select: { nama: true } } },
  });

  const totalPemasukan = records
    .filter((r) => r.tipe === "pemasukan")
    .reduce((s, r) => s + Number(r.nominal), 0);
  const totalPengeluaran = records
    .filter((r) => r.tipe === "pengeluaran")
    .reduce((s, r) => s + Number(r.nominal), 0);

  return jsonOk({
    records,
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
  });
}
