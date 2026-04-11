import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }
  const { id } = await ctx.params;

  const n = await prisma.notification.findFirst({
    where: { id, userId: u.id },
  });
  if (!n) return jsonErr("Tidak ditemukan", 404);

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return jsonOk({ ok: true });
}
