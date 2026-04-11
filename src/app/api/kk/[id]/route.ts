import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { deleteByUrl } from "@/lib/cloudinary-server";

async function kkInRt(kkId: string, rtId: string) {
  return prisma.kartuKeluarga.findFirst({
    where: { id: kkId, rumah: { rtId } },
    include: { rumah: true },
  });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const kk = await kkInRt(id, u.rtId);
  if (!kk) return jsonErr("Tidak ditemukan", 404);

  const schema = z.object({
    noKk: z.string().regex(/^\d{16}$/).optional(),
    namaKepalaKeluarga: z.string().min(2).optional(),
    rumahId: z.string().uuid().optional(),
  });
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  if (body.rumahId) {
    const target = await prisma.rumah.findFirst({
      where: { id: body.rumahId, rtId: u.rtId },
    });
    if (!target) return jsonErr("Rumah tujuan tidak valid", 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.kartuKeluarga.update({
      where: { id },
      data: {
        noKk: body.noKk,
        namaKepalaKeluarga: body.namaKepalaKeluarga,
        rumahId: body.rumahId ?? undefined,
      },
    });

    if (body.rumahId) {
      await tx.user.updateMany({
        where: { kartuKeluargaId: id },
        data: { rumahId: body.rumahId },
      });
    }

    const oldRumahId = kk.rumahId;
    if (body.rumahId && body.rumahId !== oldRumahId) {
      const left = await tx.kartuKeluarga.count({
        where: { rumahId: oldRumahId },
      });
      if (left === 0) {
        await tx.rumah.update({
          where: { id: oldRumahId },
          data: { status: "tidak_aktif" },
        });
      }
    }

    return row;
  });

  return jsonOk(updated);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  const kk = await kkInRt(id, u.rtId);
  if (!kk) return jsonErr("Tidak ditemukan", 404);

  // Kumpulkan URL foto untuk dihapus dari Cloudinary setelah DB selesai
  const fotoKk = await prisma.kartuKeluarga.findUnique({
    where: { id },
    select: { fotoKkUrl: true, fotoKtp: { select: { url: true } } },
  });

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({ where: { kartuKeluargaId: id } });
    await tx.fotoKtp.deleteMany({ where: { kartuKeluargaId: id } });
    const rumahId = kk.rumahId;
    await tx.kartuKeluarga.delete({ where: { id } });
    const left = await tx.kartuKeluarga.count({ where: { rumahId } });
    if (left === 0) {
      await tx.rumah.update({
        where: { id: rumahId },
        data: { status: "tidak_aktif" },
      });
    }
  });

  // Hapus foto dari Cloudinary (best-effort)
  if (fotoKk?.fotoKkUrl) await deleteByUrl(fotoKk.fotoKkUrl);
  if (fotoKk?.fotoKtp) {
    await Promise.all(fotoKk.fotoKtp.map(f => deleteByUrl(f.url)));
  }

  return jsonOk({ ok: true });
}
