import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const list = await prisma.user.findMany({
    where: { role: "warga", rumah: { rtId: u.rtId } },
    select: {
      id: true,
      username: true,
      nama: true,
      status: true,
      noKtp: true,
      rumahId: true,
      rumah: { select: { nomorRumah: true } },
    },
  });
  return jsonOk(list);
}

const createSchema = z.object({
  nama: z.string().min(2),
  username: z.string().min(3),
  noKtp: z.string().regex(/^\d{16}$/),
  password: z.string().min(8),
  rumahId: z.string().uuid(),
  kartuKeluargaId: z.string().uuid().optional(),
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

  const rumah = await prisma.rumah.findFirst({
    where: { id: body.rumahId, rtId: u.rtId },
  });
  if (!rumah) return jsonErr("Rumah tidak valid", 400);

  if (body.kartuKeluargaId) {
    const kk = await prisma.kartuKeluarga.findFirst({
      where: { id: body.kartuKeluargaId, rumahId: body.rumahId },
    });
    if (!kk) return jsonErr("KK tidak sesuai rumah", 400);
  }

  const passwordHash = await hashPassword(body.password);
  try {
    const user = await prisma.user.create({
      data: {
        nama: body.nama,
        username: body.username,
        noKtp: body.noKtp,
        passwordHash,
        role: "warga",
        status: "aktif",
        rumahId: body.rumahId,
        kartuKeluargaId: body.kartuKeluargaId,
      },
    });
    return jsonOk({ id: user.id }, 201);
  } catch {
    return jsonErr("Username atau NIK sudah dipakai", 409);
  }
}
