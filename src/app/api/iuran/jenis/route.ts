import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }
  if (!["pengurus_rt", "pengurus_rw", "warga"].includes(u.role)) {
    return jsonErr("Forbidden", 403);
  }

  if (u.role === "pengurus_rt") {
    const list = await prisma.jenisIuran.findMany({
      where: { rtId: u.rtId!, deletedAt: null },
      orderBy: { nama: "asc" },
    });
    return jsonOk(list);
  }
  if (u.role === "pengurus_rw") {
    const rts = await prisma.rt.findMany({
      where: { rwId: u.rwId! },
      select: { id: true },
    });
    const ids = rts.map((r) => r.id);
    const list = await prisma.jenisIuran.findMany({
      where: { rtId: { in: ids }, deletedAt: null },
    });
    return jsonOk(list);
  }
  // warga: iuran di RT mereka via rumah
  const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId! } });
  if (!rumah) return jsonOk([]);
  const list = await prisma.jenisIuran.findMany({
    where: { rtId: rumah.rtId, deletedAt: null },
  });
  return jsonOk(list);
}

const createSchema = z.object({
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  nominal: z.number().positive(),
  tipe: z.enum(["bulanan", "insidental"]),
  jatuhTempo: z.number().min(1).max(28).optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);
  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }
  if (body.tipe === "bulanan" && !body.jatuhTempo) {
    return jsonErr("Jatuh tempo wajib untuk iuran bulanan", 400);
  }
  const row = await prisma.jenisIuran.create({
    data: {
      rtId: u.rtId!,
      nama: body.nama,
      deskripsi: body.deskripsi,
      nominal: body.nominal,
      tipe: body.tipe,
      jatuhTempo: body.tipe === "bulanan" ? body.jatuhTempo : null,
    },
  });
  return jsonOk(row, 201);
}
