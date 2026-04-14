/**
 * DEVELOPMENT ONLY: Re-seed database with test accounts
 * Use this if you see "Username/NIK tidak ditemukan" on login
 */
import { jsonOk, jsonErr } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  // Only allow in development
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "development"
  ) {
    return jsonErr("Not available in this environment", 403);
  }

  try {
    const hash = await bcrypt.hash("demo123", 10);

    // Get or create RW
    let rw = await prisma.rw.findFirst();
    if (!rw) {
      rw = await prisma.rw.create({
        data: { nama: "RW 001", alamat: "Kelurahan Demo" },
      });
    }

    // Get or create RTs
    let rt1 = await prisma.rt.findFirst({ where: { rwId: rw.id } });
    if (!rt1) {
      rt1 = await prisma.rt.create({ data: { rwId: rw.id, nama: "RT 001" } });
    }

    // Create/update pengurus_rw account
    const existingPengurusRw = await prisma.user.findUnique({
      where: { username: "pengurus_rw" },
    });
    if (!existingPengurusRw) {
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
    }

    // Create/update bendahara_rt1 account
    const existingBendahara = await prisma.user.findUnique({
      where: { username: "bendahara_rt1" },
    });
    if (!existingBendahara) {
      await prisma.user.create({
        data: {
          username: "bendahara_rt1",
          nama: "Pak Ahmad (RT 001)",
          passwordHash: hash,
          role: "pengurus_rt",
          status: "aktif",
          rtId: rt1.id,
        },
      });
    }

    // Create test rumah and warga if needed
    let rumah = await prisma.rumah.findFirst({ where: { rtId: rt1.id } });
    if (!rumah) {
      rumah = await prisma.rumah.create({
        data: {
          rtId: rt1.id,
          nomorRumah: "12A",
          tipeHunian: "milik",
          status: "aktif",
        },
      });
    }

    let kk = await prisma.kartuKeluarga.findFirst({
      where: { rumahId: rumah.id },
    });
    if (!kk) {
      kk = await prisma.kartuKeluarga.create({
        data: {
          rumahId: rumah.id,
          noKk: "3201010101010001",
          namaKepalaKeluarga: "Pak Bagus Santoso",
        },
      });
    }

    const existingWarga = await prisma.user.findUnique({
      where: { username: "warga_demo" },
    });
    if (!existingWarga) {
      await prisma.user.create({
        data: {
          username: "warga_demo",
          noKtp: "3201010101010003",
          nama: "Bagus Santoso",
          passwordHash: hash,
          role: "warga",
          status: "aktif",
          rumahId: rumah.id,
          kartuKeluargaId: kk.id,
        },
      });
    }

    return jsonOk({
      message: "Test accounts created/updated successfully",
      accounts: [
        { username: "pengurus_rw", password: "demo123", role: "pengurus_rw" },
        { username: "bendahara_rt1", password: "demo123", role: "pengurus_rt" },
        { username: "warga_demo", password: "demo123", role: "warga" },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return jsonErr(
      "Failed to seed database: " +
        (error instanceof Error ? error.message : "Unknown error"),
      500,
    );
  }
}
