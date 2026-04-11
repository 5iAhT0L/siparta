import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);

  if (u.role === "pengurus_rt" && u.rtId) {
    const rows = await prisma.kas.findMany({
      where: { rtId: u.rtId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const agg = await prisma.kas.groupBy({
      by: ["tipe"],
      where: { rtId: u.rtId },
      _sum: { nominal: true },
    });
    const pemasukan = Number(
      agg.find((a) => a.tipe === "pemasukan")?._sum.nominal ?? 0,
    );
    const pengeluaran = Number(
      agg.find((a) => a.tipe === "pengeluaran")?._sum.nominal ?? 0,
    );
    return jsonOk({
      rows,
      ringkasan: { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran },
    });
  }

  if (u.role === "warga" && u.rumahId) {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    if (!rumah) return jsonOk({ ringkasan: null });
    const agg = await prisma.kas.groupBy({
      by: ["tipe"],
      where: { rtId: rumah.rtId },
      _sum: { nominal: true },
    });
    const pemasukan = Number(
      agg.find((a) => a.tipe === "pemasukan")?._sum.nominal ?? 0,
    );
    const pengeluaran = Number(
      agg.find((a) => a.tipe === "pengeluaran")?._sum.nominal ?? 0,
    );
    return jsonOk({
      ringkasan: {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran,
      },
    });
  }

  return jsonErr("Forbidden", 403);
}

const pengeluaranSchema = z.object({
  deskripsi: z.string().min(1).max(255),
  nominal: z.number().positive(),
  kategori: z.string().optional(),
  recordedDate: z.string().optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  let body: z.infer<typeof pengeluaranSchema>;
  try {
    body = pengeluaranSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const row = await prisma.kas.create({
    data: {
      rtId: u.rtId,
      tipe: "pengeluaran",
      deskripsi: body.deskripsi,
      nominal: body.nominal,
      kategori: body.kategori,
      recordedById: u.id,
      recordedDate: body.recordedDate
        ? new Date(body.recordedDate)
        : undefined,
    },
  });
  return jsonOk(row, 201);
}
