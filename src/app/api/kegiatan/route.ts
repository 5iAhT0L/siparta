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

  let rtId: string | null = null;
  if (u.role === "pengurus_rt") rtId = u.rtId;
  else if (u.role === "warga" && u.rumahId) {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    rtId = rumah?.rtId ?? null;
  }
  if (!rtId) return jsonOk([]);

  const list = await prisma.kegiatan.findMany({
    where: { rtId },
    orderBy: { tanggal: "desc" },
    include: {
      createdBy: { select: { nama: true } },
      _count: { select: { rsvp: true } },
    },
  });

  return jsonOk(list);
}

const createSchema = z.object({
  nama: z.string().min(1).max(200),
  deskripsi: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jam: z.string().optional(),
  lokasi: z.string().optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const kegiatan = await prisma.kegiatan.create({
    data: {
      rtId: u.rtId,
      createdById: u.id,
      nama: body.nama,
      deskripsi: body.deskripsi,
      tanggal: new Date(body.tanggal),
      jam: body.jam,
      lokasi: body.lokasi,
    },
  });
  return jsonOk(kegiatan, 201);
}
