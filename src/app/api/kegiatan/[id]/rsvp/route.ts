import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const schema = z.object({ hadir: z.boolean() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["warga"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);

  const kegiatan = await prisma.kegiatan.findUnique({ where: { id } });
  if (!kegiatan) return jsonErr("Kegiatan tidak ditemukan", 404);

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const rsvp = await prisma.rsvpKegiatan.upsert({
    where: { kegiatanId_userId: { kegiatanId: id, userId: u.id } },
    create: { kegiatanId: id, userId: u.id, hadir: body.hadir },
    update: { hadir: body.hadir },
  });
  return jsonOk(rsvp);
}
