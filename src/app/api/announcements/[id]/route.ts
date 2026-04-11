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

  const existing = await prisma.announcement.findFirst({
    where: { id, rtId: u.rtId },
  });
  if (!existing) return jsonErr("Tidak ditemukan", 404);

  const schema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    imageFile: z.string().nullable().optional(),
  });
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const row = await prisma.announcement.update({
    where: { id },
    data: body,
  });
  return jsonOk(row);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;

  const existing = await prisma.announcement.findFirst({
    where: { id, rtId: u.rtId },
  });
  if (!existing) return jsonErr("Tidak ditemukan", 404);

  await prisma.announcement.delete({ where: { id } });
  return jsonOk({ ok: true });
}
