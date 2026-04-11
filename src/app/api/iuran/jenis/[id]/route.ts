import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const existing = await prisma.jenisIuran.findFirst({
    where: { id, rtId: u.rtId!, deletedAt: null },
  });
  if (!existing) return jsonErr("Tidak ditemukan", 404);

  const schema = z.object({
    nama: z.string().min(1).optional(),
    deskripsi: z.string().optional(),
    nominal: z.number().positive().optional(),
    tipe: z.enum(["bulanan", "insidental"]).optional(),
    jatuhTempo: z.number().min(1).max(28).nullable().optional(),
  });
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const tipe = body.tipe ?? existing.tipe;
  const row = await prisma.jenisIuran.update({
    where: { id },
    data: {
      nama: body.nama ?? undefined,
      deskripsi: body.deskripsi,
      nominal: body.nominal ?? undefined,
      tipe: body.tipe ?? undefined,
      jatuhTempo:
        tipe === "insidental"
          ? null
          : body.jatuhTempo !== undefined
            ? body.jatuhTempo
            : existing.jatuhTempo,
    },
  });
  return jsonOk(row);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const existing = await prisma.jenisIuran.findFirst({
    where: { id, rtId: u.rtId! },
  });
  if (!existing) return jsonErr("Tidak ditemukan", 404);
  await prisma.jenisIuran.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return jsonOk({ ok: true });
}
