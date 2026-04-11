import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

const updateSchema = z.object({
  status: z.enum(["proses", "selesai"]).optional(),
  catatanRt: z.string().optional(),
  suratFile: z.string().optional(),
});

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

  const layanan = await prisma.layananRequest.findUnique({
    where: { id },
    include: {
      rumah: { select: { nomorRumah: true, rtId: true } },
      user: { select: { nama: true } },
      handledBy: { select: { nama: true } },
    },
  });
  if (!layanan) return jsonErr("Layanan tidak ditemukan", 404);

  if (u.role === "warga" && layanan.userId !== u.id) return jsonErr("Forbidden", 403);
  if (u.role === "pengurus_rt" && layanan.rumah.rtId !== u.rtId) return jsonErr("Forbidden", 403);

  return jsonOk(layanan);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const layanan = await prisma.layananRequest.findFirst({
    where: { id, rumah: { rtId: u.rtId } },
  });
  if (!layanan) return jsonErr("Layanan tidak ditemukan", 404);

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const updated = await prisma.layananRequest.update({
    where: { id },
    data: {
      status: body.status,
      catatanRt: body.catatanRt,
      suratFile: body.suratFile,
      handledById: u.id,
    },
  });

  if (body.status === "selesai") {
    await prisma.notification.create({
      data: {
        userId: layanan.userId,
        title: "Permintaan Layanan Selesai",
        body: "Permintaan layanan Anda telah diproses. Silakan cek detail untuk download surat.",
        type: "layanan",
      },
    });
  }

  return jsonOk(updated);
}
