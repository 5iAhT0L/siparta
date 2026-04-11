import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id: rumahId } = await ctx.params;
  const rumah = await prisma.rumah.findFirst({
    where: { id: rumahId, rtId: u.rtId },
    include: { kk: true },
  });
  if (!rumah) return jsonErr("Tidak ditemukan", 404);
  return jsonOk(rumah.kk);
}

const kkSchema = z.object({
  noKk: z.string().regex(/^\d{16}$/),
  namaKepalaKeluarga: z.string().min(2).max(200),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id: rumahId } = await ctx.params;
  const rumah = await prisma.rumah.findFirst({
    where: { id: rumahId, rtId: u.rtId },
  });
  if (!rumah) return jsonErr("Tidak ditemukan", 404);

  let body: z.infer<typeof kkSchema>;
  try {
    body = kkSchema.parse(await req.json());
  } catch {
    return jsonErr("Data KK tidak valid", 400);
  }

  try {
    const kk = await prisma.kartuKeluarga.create({
      data: {
        rumahId,
        noKk: body.noKk,
        namaKepalaKeluarga: body.namaKepalaKeluarga,
      },
    });
    return jsonOk(kk, 201);
  } catch {
    return jsonErr("No. KK sudah terdaftar", 409);
  }
}
