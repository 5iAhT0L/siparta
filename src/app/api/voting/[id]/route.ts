import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

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

  const voting = await prisma.voting.findUnique({
    where: { id },
    include: {
      createdBy: { select: { nama: true } },
      records: {
        include: { user: { select: { nama: true } } },
      },
    },
  });
  if (!voting) return jsonErr("Voting tidak ditemukan", 404);

  // Scope check
  if (u.role === "pengurus_rt" && voting.rtId !== u.rtId) return jsonErr("Forbidden", 403);
  if (u.role === "warga") {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId! } });
    if (!rumah || rumah.rtId !== voting.rtId) return jsonErr("Forbidden", 403);
  }

  return jsonOk(voting);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const voting = await prisma.voting.findFirst({ where: { id, rtId: u.rtId } });
  if (!voting) return jsonErr("Voting tidak ditemukan", 404);

  await prisma.voting.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
