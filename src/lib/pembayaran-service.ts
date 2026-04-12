import type { Prisma } from "@prisma/client";

export async function approvePembayaranTx(
  tx: Prisma.TransactionClient,
  pembayaranId: string,
  verifierId: string,
  catatan?: string | null,
) {
  const p = await tx.pembayaran.findUnique({
    where: { id: pembayaranId },
    include: { tagihan: { include: { jenisIuran: true } } },
  });
  if (!p || p.status !== "pending") {
    throw new Error("Pembayaran tidak dapat diverifikasi");
  }

  await tx.pembayaran.updateMany({
    where: {
      tagihanId: p.tagihanId,
      id: { not: p.id },
      status: "pending",
    },
    data: {
      status: "rejected",
      rejectReason: "Pembayaran lain untuk tagihan yang sama telah disetujui",
      verifiedById: verifierId,
      verifiedAt: new Date(),
    },
  });

  await tx.pembayaran.update({
    where: { id: pembayaranId },
    data: {
      status: "approved",
      verifiedById: verifierId,
      verifiedAt: new Date(),
      catatan: catatan ?? undefined,
    },
  });

  await tx.tagihan.update({
    where: { id: p.tagihanId },
    data: { status: "lunas" },
  });

  await tx.kas.create({
    data: {
      rtId: p.tagihan.rtId,
      tipe: "pemasukan",
      deskripsi: `Iuran: ${p.tagihan.jenisIuran.nama}`,
      nominal: p.nominal,
      kategori: "iuran",
      recordedById: verifierId,
      pembayaranId: p.id,
    },
  });

  await tx.pembayaranVerificationAudit.create({
    data: {
      pembayaranId: p.id,
      actorId: verifierId,
      action: "approve",
      note: catatan ?? null,
    },
  });
}
