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

  if (u.role === "pengurus_rt") {
    // Get all layanan requests for this RT
    const list = await prisma.layananRequest.findMany({
      where: { rumah: { rtId: u.rtId! } },
      orderBy: { createdAt: "desc" },
      include: {
        rumah: { select: { nomorRumah: true } },
        user: { select: { nama: true } },
        handledBy: { select: { nama: true } },
      },
    });
    return jsonOk(list);
  }

  if (u.role === "warga") {
    const list = await prisma.layananRequest.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      include: { handledBy: { select: { nama: true } } },
    });
    return jsonOk(list);
  }

  return jsonErr("Forbidden", 403);
}

const createSchema = z.object({
  tipe: z.enum(["domisili", "pengantar", "lainnya"]),
  keterangan: z.string().min(1),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["warga"]).catch(() => null);
  if (!u?.rumahId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const layanan = await prisma.layananRequest.create({
    data: {
      rumahId: u.rumahId,
      userId: u.id,
      tipe: body.tipe,
      keterangan: body.keterangan,
    },
  });

  // Notify pengurus RT
  const rumah = await prisma.rumah.findUnique({
    where: { id: u.rumahId },
    include: { rt: { include: { pengurusUsers: true } } },
  });
  if (rumah) {
    for (const pengurus of rumah.rt.pengurusUsers) {
      await prisma.notification.create({
        data: {
          userId: pengurus.id,
          title: "Permintaan Layanan Baru",
          body: `Ada permintaan layanan ${body.tipe} dari Rumah ${rumah.nomorRumah}`,
          type: "layanan",
        },
      });
    }
  }

  return jsonOk(layanan, 201);
}
