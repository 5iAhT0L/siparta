import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const editSchema = z.object({
  nama: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  noKtp: z.string().regex(/^\d{16}$/).optional(),
  password: z.string().min(8).optional(),
  rumahId: z.string().uuid().optional(),
  kartuKeluargaId: z.string().uuid().nullable().optional(),
  status: z.enum(["aktif", "tidak_aktif"]).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const target = await prisma.user.findFirst({
    where: { id, role: "warga", rumah: { rtId: u.rtId } },
  });
  if (!target) return jsonErr("Warga tidak ditemukan", 404);

  let body: z.infer<typeof editSchema>;
  try {
    body = editSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  if (body.rumahId) {
    const rumah = await prisma.rumah.findFirst({
      where: { id: body.rumahId, rtId: u.rtId },
    });
    if (!rumah) return jsonErr("Rumah tidak valid", 400);
  }

  if (body.kartuKeluargaId && body.rumahId) {
    const kk = await prisma.kartuKeluarga.findFirst({
      where: { id: body.kartuKeluargaId, rumahId: body.rumahId },
    });
    if (!kk) return jsonErr("KK tidak sesuai rumah", 400);
  }

  const data: Record<string, unknown> = {};
  if (body.nama !== undefined) data.nama = body.nama;
  if (body.username !== undefined) data.username = body.username;
  if (body.noKtp !== undefined) data.noKtp = body.noKtp;
  if (body.password !== undefined) data.passwordHash = await hashPassword(body.password);
  if (body.rumahId !== undefined) data.rumahId = body.rumahId;
  if (body.kartuKeluargaId !== undefined) data.kartuKeluargaId = body.kartuKeluargaId;
  if (body.status !== undefined) data.status = body.status;

  try {
    const updated = await prisma.user.update({ where: { id }, data });
    return jsonOk({ id: updated.id });
  } catch {
    return jsonErr("Username atau NIK sudah dipakai", 409);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(_req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const target = await prisma.user.findFirst({
    where: { id, role: "warga", rumah: { rtId: u.rtId } },
  });
  if (!target) return jsonErr("Warga tidak ditemukan", 404);

  await prisma.user.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
