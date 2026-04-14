import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.user.count()) > 0) {
    console.log("Database sudah berisi data — lewati seed.");
    return;
  }

  const hash = await bcrypt.hash("demo123", 10);

  // ── RW ──────────────────────────────────────────────────────────────────
  const rw = await prisma.rw.create({
    data: { nama: "RW 001", alamat: "Kelurahan Contoh, Kecamatan Demo" },
  });

  // ── RT ──────────────────────────────────────────────────────────────────
  const rt1 = await prisma.rt.create({ data: { rwId: rw.id, nama: "RT 001" } });
  const rt2 = await prisma.rt.create({ data: { rwId: rw.id, nama: "RT 002" } });

  await prisma.rtSettings.createMany({
    data: [
      {
        rtId: rt1.id,
        bankName: "BRI",
        bankAccountNumber: "1234567890",
        bankAccountName: "Kas RT 001",
      },
      {
        rtId: rt2.id,
        bankName: "BCA",
        bankAccountNumber: "0987654321",
        bankAccountName: "Kas RT 002",
      },
    ],
  });

  // ── PENGURUS ─────────────────────────────────────────────────────────────
  // 1 pengurus_rw
  await prisma.user.create({
    data: {
      username: "pengurus_rw",
      nama: "Pak Budi (RW)",
      passwordHash: hash,
      role: "pengurus_rw",
      status: "aktif",
      rwId: rw.id,
    },
  });

  // 2 pengurus_rt
  const pengurusRt1 = await prisma.user.create({
    data: {
      username: "bendahara_rt1",
      nama: "Pak Ahmad (RT 001)",
      passwordHash: hash,
      role: "pengurus_rt",
      status: "aktif",
      rtId: rt1.id,
    },
  });
  await prisma.user.create({
    data: {
      username: "bendahara_rt2",
      nama: "Ibu Siti (RT 002)",
      passwordHash: hash,
      role: "pengurus_rt",
      status: "aktif",
      rtId: rt2.id,
    },
  });

  // ── RUMAH RT 001 ─────────────────────────────────────────────────────────

  // Rumah 12A — milik, 1 KK, 1 warga
  const r1 = await prisma.rumah.create({
    data: {
      rtId: rt1.id,
      nomorRumah: "12A",
      tipeHunian: "milik",
      status: "aktif",
    },
  });
  const kk1 = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r1.id,
      noKk: "3201010101010001",
      namaKepalaKeluarga: "Pak Bagus Santoso",
    },
  });
  await prisma.user.create({
    data: {
      username: "warga_demo",
      noKtp: "3201010101010003",
      nama: "Bagus Santoso",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r1.id,
      kartuKeluargaId: kk1.id,
    },
  });

  // Rumah 7 — milik, 2 KK (multi-KK), 2 warga
  const r2 = await prisma.rumah.create({
    data: {
      rtId: rt1.id,
      nomorRumah: "07",
      tipeHunian: "milik",
      status: "aktif",
    },
  });
  const kk2a = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r2.id,
      noKk: "3201010101010010",
      namaKepalaKeluarga: "Pak Dedi Kurniawan",
    },
  });
  const kk2b = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r2.id,
      noKk: "3201010101010011",
      namaKepalaKeluarga: "Bu Endang (Orang Tua)",
    },
  });
  await prisma.user.create({
    data: {
      username: "warga2_rt1",
      noKtp: "3201010101010012",
      nama: "Dedi Kurniawan",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r2.id,
      kartuKeluargaId: kk2a.id,
    },
  });
  await prisma.user.create({
    data: {
      username: "warga3_rt1",
      noKtp: "3201010101010013",
      nama: "Rina Kurniawan",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r2.id,
      kartuKeluargaId: kk2b.id,
    },
  });

  // Rumah 15 — kontrak, 1 KK penyewa, 1 warga penyewa + KontrakRumah aktif
  const r3 = await prisma.rumah.create({
    data: {
      rtId: rt1.id,
      nomorRumah: "15",
      tipeHunian: "kontrak",
      status: "aktif",
    },
  });
  const kk3 = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r3.id,
      noKk: "3201010101010020",
      namaKepalaKeluarga: "Pak Rendi Penyewa",
    },
  });
  await prisma.user.create({
    data: {
      username: "penyewa_demo",
      noKtp: "3201010101010021",
      nama: "Rendi Pratama",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r3.id,
      kartuKeluargaId: kk3.id,
    },
  });
  await prisma.kontrakRumah.create({
    data: {
      rumahId: r3.id,
      namaPenyewa: "Pak Rendi Pratama",
      tanggalMulai: new Date("2024-01-01"),
      tanggalSelesai: new Date("2025-12-31"),
      status: "aktif",
      catatan: "Kontrak tahunan, perpanjang setiap Januari.",
      createdById: pengurusRt1.id,
    },
  });

  // ── RUMAH RT 002 ─────────────────────────────────────────────────────────

  // Rumah 03 — milik, 1 KK, 1 warga
  const r4 = await prisma.rumah.create({
    data: {
      rtId: rt2.id,
      nomorRumah: "03",
      tipeHunian: "milik",
      status: "aktif",
    },
  });
  const kk4 = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r4.id,
      noKk: "3201010101020001",
      namaKepalaKeluarga: "Ibu Farida Hanum",
    },
  });
  await prisma.user.create({
    data: {
      username: "warga_rt2",
      noKtp: "3201010101020002",
      nama: "Farida Hanum",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r4.id,
      kartuKeluargaId: kk4.id,
    },
  });

  // Rumah 08 — kontrak, 1 KK, 1 warga + KontrakRumah aktif
  const r5 = await prisma.rumah.create({
    data: {
      rtId: rt2.id,
      nomorRumah: "08",
      tipeHunian: "kontrak",
      status: "aktif",
    },
  });
  const kk5 = await prisma.kartuKeluarga.create({
    data: {
      rumahId: r5.id,
      noKk: "3201010101020010",
      namaKepalaKeluarga: "Pak Yusuf Kontraktor",
    },
  });
  await prisma.user.create({
    data: {
      username: "penyewa_rt2",
      noKtp: "3201010101020011",
      nama: "Yusuf Rahman",
      passwordHash: hash,
      role: "warga",
      status: "aktif",
      rumahId: r5.id,
      kartuKeluargaId: kk5.id,
    },
  });
  // pengurusRt2 belum tersedia sebagai variable; gunakan query
  const pengurusRt2 = await prisma.user.findUnique({
    where: { username: "bendahara_rt2" },
  });
  await prisma.kontrakRumah.create({
    data: {
      rumahId: r5.id,
      namaPenyewa: "Yusuf Rahman",
      tanggalMulai: new Date("2025-06-01"),
      tanggalSelesai: new Date("2026-05-31"),
      status: "aktif",
      catatan: "Kontrak 1 tahun.",
      createdById: pengurusRt2!.id,
    },
  });

  // ── JENIS IURAN ───────────────────────────────────────────────────────────
  await prisma.jenisIuran.createMany({
    data: [
      {
        rtId: rt1.id,
        nama: "Iuran Kebersihan",
        deskripsi: "Bulanan",
        nominal: 25000,
        tipe: "bulanan",
        jatuhTempo: 10,
      },
      {
        rtId: rt1.id,
        nama: "Iuran Keamanan",
        deskripsi: "Bulanan",
        nominal: 50000,
        tipe: "bulanan",
        jatuhTempo: 10,
      },
      {
        rtId: rt1.id,
        nama: "Patungan Pagar",
        deskripsi: "Insidental — renovasi pagar RT",
        nominal: 150000,
        tipe: "insidental",
      },
      {
        rtId: rt2.id,
        nama: "Iuran Kebersihan",
        deskripsi: "Bulanan",
        nominal: 30000,
        tipe: "bulanan",
        jatuhTempo: 15,
      },
      {
        rtId: rt2.id,
        nama: "Iuran Keamanan",
        deskripsi: "Bulanan",
        nominal: 50000,
        tipe: "bulanan",
        jatuhTempo: 15,
      },
    ],
  });

  console.log("Seed OK.");
  console.log("");
  console.log("Akun demo (password: demo123):");
  console.log("  pengurus_rw      — Pengurus RW 001 (monitoring read-only)");
  console.log("  bendahara_rt1    — Pengurus RT 001");
  console.log("  bendahara_rt2    — Pengurus RT 002");
  console.log("  warga_demo       — Warga Rumah 12A RT 001 (milik, 1 KK)");
  console.log(
    "  warga2_rt1       — Warga Rumah 07 RT 001 (milik, multi-KK, KK Pak Dedi)",
  );
  console.log(
    "  warga3_rt1       — Warga Rumah 07 RT 001 (milik, multi-KK, KK Bu Endang)",
  );
  console.log("  penyewa_demo     — Warga Rumah 15 RT 001 (kontrak, penyewa)");
  console.log("  warga_rt2        — Warga Rumah 03 RT 002 (milik)");
  console.log("  penyewa_rt2      — Warga Rumah 08 RT 002 (kontrak, penyewa)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
