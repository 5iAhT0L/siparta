import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const list = await prisma.rumah.findMany({
    where: { rtId: u.rtId },
    orderBy: { nomorRumah: "asc" },
    include: {
      _count: { select: { kk: true, users: true } },
    },
  });
  return jsonOk(list);
}

const createSchema = z.object({
  nomorRumah: z.string().min(1).max(50),
  alamat: z.string().optional(),
  kontak: z.string().optional(),
  tipeHunian: z.enum(["milik", "kontrak"]),
  status: z.enum(["aktif", "tidak_aktif"]).optional(),
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
  try {
    const r = await prisma.rumah.create({
      data: {
        rtId: u.rtId,
        nomorRumah: body.nomorRumah,
        alamat: body.alamat,
        kontak: body.kontak,
        tipeHunian: body.tipeHunian,
        status: body.status ?? "aktif",
      },
    });
    return jsonOk(r, 201);
  } catch {
    return jsonErr("Nomor rumah sudah ada di RT ini", 409);
  }
}
