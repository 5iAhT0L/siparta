import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const schema = z.object({
  rumahId: z.string().uuid(),
  tagihanId: z.string().uuid(),
  nominal: z.number().positive(),
  metode: z.enum(["transfer_manual", "cash"]),
  catatan: z.string().optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const rtId = u.rtId;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const tagihan = await prisma.tagihan.findFirst({
    where: {
      id: body.tagihanId,
      rumahId: body.rumahId,
      rtId: u.rtId,
      status: "belum_bayar",
    },
    include: { jenisIuran: true },
  });
  if (!tagihan) return jsonErr("Tagihan tidak valid", 400);

  const p = await prisma.$transaction(async (tx) => {
    const pay = await tx.pembayaran.create({
      data: {
        tagihanId: tagihan.id,
        rumahId: body.rumahId,
        submittedById: u.id,
        inputByPengurus: true,
        nominal: body.nominal,
        metode: body.metode,
        status: "approved",
        verifiedById: u.id,
        verifiedAt: new Date(),
        catatan: body.catatan,
      },
    });
    await tx.tagihan.update({
      where: { id: tagihan.id },
      data: { status: "lunas" },
    });
    await tx.kas.create({
      data: {
        rtId,
        tipe: "pemasukan",
        deskripsi: `Iuran (manual): ${tagihan.jenisIuran.nama}`,
        nominal: pay.nominal,
        kategori: "iuran",
        recordedById: u.id,
        pembayaranId: pay.id,
      },
    });
    await tx.pembayaranVerificationAudit.create({
      data: {
        pembayaranId: pay.id,
        actorId: u.id,
        action: "manual_approved",
        note: body.catatan ?? null,
      },
    });
    return pay;
  });

  return jsonOk({ id: p.id, message: "Pembayaran manual tercatat" }, 201);
}
