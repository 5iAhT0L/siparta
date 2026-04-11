import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ rtId: string }> },
) {
  const { rtId } = await ctx.params;
  const rumah = await prisma.rumah.findMany({
    where: { rtId, status: "aktif" },
    orderBy: { nomorRumah: "asc" },
    include: {
      kk: { select: { id: true, noKk: true, namaKepalaKeluarga: true } },
    },
  });
  return jsonOk(rumah);
}
