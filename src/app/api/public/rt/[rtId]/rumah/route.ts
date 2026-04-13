import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ rtId: string }> },
) {
  const { rtId } = await ctx.params;
  try {
    const rumah = await prisma.rumah.findMany({
      where: { rtId, status: "aktif" },
      orderBy: { nomorRumah: "asc" },
      include: {
        kk: { select: { id: true, noKk: true, namaKepalaKeluarga: true } },
      },
    });
    return jsonOk(rumah);
  } catch (e) {
    // Fallback mock data untuk testing tanpa database
    const mockRumah = [
      { id: "rumah-001", nomorRumah: "01", kk: [] },
      { id: "rumah-002", nomorRumah: "02", kk: [] },
      { id: "rumah-003", nomorRumah: "03", kk: [] },
      { id: "rumah-004", nomorRumah: "04", kk: [] },
      { id: "rumah-005", nomorRumah: "05", kk: [] },
    ];
    return jsonOk(mockRumah);
  }
}
