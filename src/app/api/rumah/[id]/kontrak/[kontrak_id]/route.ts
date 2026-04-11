import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const editSchema = z.object({
  namaPenyewa: z.string().min(1).max(200).optional(),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tanggalSelesai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  catatan: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; kontrak_id: string }> },
) {
  const { id, kontrak_id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const rumah = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!rumah) return jsonErr("Rumah tidak ditemukan", 404);

  const kontrak = await prisma.kontrakRumah.findFirst({
    where: { id: kontrak_id, rumahId: id },
  });
  if (!kontrak) return jsonErr("Kontrak tidak ditemukan", 404);

  let body: z.infer<typeof editSchema>;
  try {
    body = editSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const mulai = body.tanggalMulai ? new Date(body.tanggalMulai) : kontrak.tanggalMulai;
  const selesai = body.tanggalSelesai ? new Date(body.tanggalSelesai) : kontrak.tanggalSelesai;
  if (selesai <= mulai) {
    return jsonErr("Tanggal selesai harus setelah tanggal mulai", 400);
  }

  const updated = await prisma.kontrakRumah.update({
    where: { id: kontrak_id },
    data: {
      namaPenyewa: body.namaPenyewa,
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : undefined,
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : undefined,
      catatan: body.catatan,
    },
  });
  return jsonOk(updated);
}
