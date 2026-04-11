import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;

  const target = await prisma.user.findFirst({
    where: {
      id,
      role: "warga",
      status: "tidak_aktif",
      rumah: { rtId: u.rtId },
    },
  });
  if (!target) return jsonErr("Tidak ditemukan", 404);

  await prisma.user.delete({ where: { id } });
  return jsonOk({ ok: true });
}
