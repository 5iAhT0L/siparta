import { format } from "date-fns";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

function clampDayInMonth(year: number, monthIndex: number, day: number): Date {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(); // hari terakhir bulan
  const d = Math.min(Math.max(day, 1), last);
  return new Date(Date.UTC(year, monthIndex, d));
}

/** Generate tagihan bulanan untuk periode YYYY-MM (idempotent via skipDuplicates) */
export async function generateTagihanBulanan(rtId: string, periode: string) {
  const parts = periode.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m || m < 1 || m > 12) throw new Error("Periode tidak valid (gunakan YYYY-MM)");

  const jenisList = await prisma.jenisIuran.findMany({
    where: { rtId, tipe: "bulanan", deletedAt: null },
  });
  const rumahList = await prisma.rumah.findMany({
    where: { rtId, status: "aktif" },
  });

  const rows = [];
  for (const j of jenisList) {
    const day = j.jatuhTempo ?? 10;
    const jatuh = clampDayInMonth(y, m - 1, day);
    for (const r of rumahList) {
      rows.push({
        rtId,
        rumahId: r.id,
        iuranId: j.id,
        periode,
        insidentalBatchId: null as string | null,
        nominal: j.nominal,
        status: "belum_bayar" as const,
        jatuhTempo: jatuh,
      });
    }
  }

  const res = await prisma.tagihan.createMany({ data: rows, skipDuplicates: true });
  return { inserted: res.count, periode };
}

/** Insidental: satu batch untuk semua rumah aktif */
export async function generateTagihanInsidental(rtId: string, iuranId: string) {
  const j = await prisma.jenisIuran.findFirst({
    where: { id: iuranId, rtId, tipe: "insidental", deletedAt: null },
  });
  if (!j) throw new Error("Jenis iuran insidental tidak ditemukan");

  const batchId = randomUUID();
  const periode = `ins-${batchId.slice(0, 8)}`; // "ins-xxxxxxxx" = 12 karakter, aman untuk VarChar(32)

  const rumahList = await prisma.rumah.findMany({
    where: { rtId, status: "aktif" },
  });

  await prisma.tagihan.createMany({
    data: rumahList.map((r) => ({
      rtId,
      rumahId: r.id,
      iuranId: j.id,
      periode,
      insidentalBatchId: batchId,
      nominal: j.nominal,
      status: "belum_bayar" as const,
      jatuhTempo: null,
    })),
  });

  return { batchId, periode, count: rumahList.length };
}

/** Cron helper: generate tagihan untuk bulan berjalan jika belum */
export async function ensureMonthTagihan(rtId: string, when = new Date()) {
  const periode = format(when, "yyyy-MM");
  return generateTagihanBulanan(rtId, periode);
}
