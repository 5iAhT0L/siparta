import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const existing = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!existing) return jsonErr("Tidak ditemukan", 404);

  const schema = z.object({
    nomorRumah: z.string().min(1).optional(),
    alamat: z.string().optional(),
    kontak: z.string().optional(),
    tipeHunian: z.enum(["milik", "kontrak"]).optional(),
    status: z.enum(["aktif", "tidak_aktif"]).optional(),
  });
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  try {
    const r = await prisma.rumah.update({
      where: { id },
      data: body,
    });
    return jsonOk(r);
  } catch {
    return jsonErr("Update gagal", 400);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const existing = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!existing) return jsonErr("Tidak ditemukan", 404);

  const kkCount = await prisma.kartuKeluarga.count({ where: { rumahId: id } });
  if (kkCount > 0) {
    return jsonErr("Tidak dapat menghapus: rumah masih memiliki data KK", 400);
  }

  const open = await prisma.tagihan.count({
    where: { rumahId: id, status: "belum_bayar" },
  });
  if (open > 0) {
    return jsonErr("Tidak dapat menghapus: masih ada tagihan belum lunas", 400);
  }

  await prisma.rumah.delete({ where: { id } });
  return jsonOk({ ok: true });
}
