import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const target = await prisma.user.findFirst({
    where: { id, role: "warga", rumah: { rtId: u.rtId } },
  });
  if (!target) return jsonErr("Warga tidak ditemukan", 404);

  await prisma.user.update({
    where: { id },
    data: { status: "tidak_aktif" },
  });
  return jsonOk({ deactivated: true });
}
