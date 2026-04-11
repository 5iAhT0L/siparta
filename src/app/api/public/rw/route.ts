import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-helpers";

/** Daftar RW + RT untuk form registrasi */
export async function GET() {
  const rows = await prisma.rw.findMany({
    orderBy: { nama: "asc" },
    include: {
      rts: { orderBy: { nama: "asc" }, select: { id: true, nama: true } },
    },
  });
  return jsonOk(rows);
}
