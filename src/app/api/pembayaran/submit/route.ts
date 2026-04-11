import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const schema = z.object({
  tagihanId: z.string().uuid(),
  metode: z.enum(["transfer_manual", "cash"]),
  nominal: z.union([z.number(), z.string()]).transform(v => Number(v)),
  buktiFile: z.string().url().optional().nullable(),
  receivedByName: z.string().optional(),
  receivedDate: z.string().optional(),
  catatan: z.string().optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["warga"]).catch(() => null);
  if (!u?.rumahId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const tagihan = await prisma.tagihan.findFirst({
    where: { id: body.tagihanId, rumahId: u.rumahId, status: "belum_bayar" },
  });
  if (!tagihan) return jsonErr("Tagihan tidak ditemukan atau sudah lunas", 400);

  if (body.metode === "transfer_manual" && !body.buktiFile) {
    return jsonErr("Bukti transfer wajib diupload", 400);
  }

  const pending = await prisma.pembayaran.findFirst({
    where: { tagihanId: tagihan.id, status: "pending" },
  });
  if (pending) {
    return jsonErr("Masih ada pembayaran menunggu verifikasi untuk tagihan ini", 409);
  }

  const [p] = await prisma.$transaction([
    prisma.pembayaran.create({
      data: {
        tagihanId: tagihan.id,
        rumahId: u.rumahId,
        submittedById: u.id,
        inputByPengurus: false,
        nominal: body.nominal,
        metode: body.metode,
        buktiFile: body.buktiFile ?? null,
        status: "pending",
        receivedByName: body.receivedByName,
        receivedDate: body.receivedDate ? new Date(body.receivedDate) : undefined,
        catatan: body.catatan,
      },
    }),
    prisma.tagihan.update({
      where: { id: tagihan.id },
      data: { status: "menunggu" },
    }),
  ]);

  return jsonOk(
    { id: p.id, message: "Pembayaran dikirim untuk verifikasi" },
    201,
  );
}
