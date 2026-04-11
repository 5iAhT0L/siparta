import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const rumah = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!rumah) return jsonErr("Rumah tidak ditemukan", 404);

  const kontrak = await prisma.kontrakRumah.findMany({
    where: { rumahId: id },
    orderBy: { tanggalMulai: "desc" },
    include: { createdBy: { select: { nama: true } } },
  });
  return jsonOk(kontrak);
}

const createSchema = z.object({
  namaPenyewa: z.string().min(1).max(200),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tanggalSelesai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  catatan: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const rumah = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!rumah) return jsonErr("Rumah tidak ditemukan", 404);
  if (rumah.tipeHunian !== "kontrak") {
    return jsonErr("Kontrak hanya untuk rumah bertipe kontrak", 400);
  }

  const existing = await prisma.kontrakRumah.findFirst({
    where: { rumahId: id, status: "aktif" },
  });
  if (existing) return jsonErr("Sudah ada kontrak aktif untuk rumah ini", 409);

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  if (new Date(body.tanggalSelesai) <= new Date(body.tanggalMulai)) {
    return jsonErr("Tanggal selesai harus setelah tanggal mulai", 400);
  }

  const kontrak = await prisma.kontrakRumah.create({
    data: {
      rumahId: id,
      namaPenyewa: body.namaPenyewa,
      tanggalMulai: new Date(body.tanggalMulai),
      tanggalSelesai: new Date(body.tanggalSelesai),
      catatan: body.catatan,
      createdById: u.id,
      status: "aktif",
    },
  });

  // Activate house when a new contract is created
  await prisma.rumah.update({ where: { id }, data: { status: "aktif" } });

  return jsonOk(kontrak, 201);
}
