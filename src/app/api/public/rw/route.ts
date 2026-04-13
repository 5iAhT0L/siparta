import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-helpers";

/** Daftar RW + RT untuk form registrasi */
export async function GET() {
  try {
    const rows = await prisma.rw.findMany({
      orderBy: { nama: "asc" },
      include: {
        rts: { orderBy: { nama: "asc" }, select: { id: true, nama: true } },
      },
    });
    return jsonOk(rows);
  } catch (e) {
    // Fallback mock data untuk testing tanpa database
    const mockData = [
      {
        id: "rw-001",
        nama: "RW 001",
        rts: [
          { id: "rt-001", nama: "RT 001" },
          { id: "rt-002", nama: "RT 002" },
          { id: "rt-003", nama: "RT 003" },
        ],
      },
      {
        id: "rw-002",
        nama: "RW 002",
        rts: [
          { id: "rt-004", nama: "RT 004" },
          { id: "rt-005", nama: "RT 005" },
        ],
      },
    ];
    return jsonOk(mockData);
  }
}
