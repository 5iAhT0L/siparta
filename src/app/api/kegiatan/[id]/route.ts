import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

const editSchema = z.object({
  nama: z.string().min(1).max(200).optional(),
  deskripsi: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  jam: z.string().optional(),
  lokasi: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      createdBy: { select: { nama: true } },
      rsvp: { include: { user: { select: { nama: true } } } },
    },
  });
  if (!kegiatan) return jsonErr("Kegiatan tidak ditemukan", 404);

  return jsonOk(kegiatan);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const kegiatan = await prisma.kegiatan.findFirst({ where: { id, rtId: u.rtId } });
  if (!kegiatan) return jsonErr("Kegiatan tidak ditemukan", 404);

  let body: z.infer<typeof editSchema>;
  try {
    body = editSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const updated = await prisma.kegiatan.update({
    where: { id },
    data: {
      nama: body.nama,
      deskripsi: body.deskripsi,
      tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
      jam: body.jam,
      lokasi: body.lokasi,
    },
  });
  return jsonOk(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const kegiatan = await prisma.kegiatan.findFirst({ where: { id, rtId: u.rtId } });
  if (!kegiatan) return jsonErr("Kegiatan tidak ditemukan", 404);

  await prisma.kegiatan.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
