import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rw"]).catch(() => null);
  if (!u?.rwId) return jsonErr("Forbidden", 403);

  const rts = await prisma.rt.findMany({
    where: { rwId: u.rwId },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, createdAt: true },
  });

  return jsonOk(rts);
}
