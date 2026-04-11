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

  if (u.role === "pengurus_rt" && u.rtId) {
    const list = await prisma.announcement.findMany({
      where: { rtId: u.rtId },
      orderBy: { postedAt: "desc" },
      include: { createdBy: { select: { nama: true } } },
    });
    return jsonOk(list);
  }

  if (u.role === "warga" && u.rumahId) {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    if (!rumah) return jsonOk([]);
    const list = await prisma.announcement.findMany({
      where: { rtId: rumah.rtId },
      orderBy: { postedAt: "desc" },
      take: 50,
      include: { createdBy: { select: { nama: true } } },
    });
    return jsonOk(list);
  }

  if (u.role === "pengurus_rw" && u.rwId) {
    const rts = await prisma.rt.findMany({
      where: { rwId: u.rwId },
      select: { id: true },
    });
    const ids = rts.map((r) => r.id);
    const list = await prisma.announcement.findMany({
      where: { rtId: { in: ids } },
      orderBy: { postedAt: "desc" },
      take: 100,
      include: {
        createdBy: { select: { nama: true } },
        rt: { select: { nama: true } },
      },
    });
    return jsonOk(list);
  }

  return jsonErr("Forbidden", 403);
}

const createSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  imageFile: z.string().optional(),
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

  const row = await prisma.announcement.create({
    data: {
      rtId: u.rtId,
      createdById: u.id,
      title: body.title,
      content: body.content,
      imageFile: body.imageFile,
    },
  });
  return jsonOk(row, 201);
}
