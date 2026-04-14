const { PrismaClient } = require("@prisma/client");

async function reset() {
  const prisma = new PrismaClient();
  try {
    console.log("Resetting database...");

    // Delete all data in order (respecting foreign keys)
    await prisma.$executeRaw`TRUNCATE TABLE "vote_record" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "vote" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "tagihan" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "pembayaran" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "jenis_iuran" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "kegiatan" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "kas" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "announcement" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "kontrak_rumah" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "rumah" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "kartu_keluarga" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "refresh_token" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "audit_log" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "notification" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "rt_settings" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "user" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "rt" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "rw" CASCADE`;

    console.log("✓ Database cleared");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err.message);
    process.exit(1);
  }
}

reset();
