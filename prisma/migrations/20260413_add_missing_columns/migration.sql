-- AlterTable - Add missing column to kartu_keluarga
ALTER TABLE "kartu_keluarga" ADD COLUMN "foto_kk_url" TEXT;

-- CreateTable foto_ktp
CREATE TABLE "foto_ktp" (
    "id" UUID NOT NULL,
    "kartu_keluarga_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_ktp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "foto_ktp_kartu_keluarga_id_idx" ON "foto_ktp"("kartu_keluarga_id");

-- AddForeignKey
ALTER TABLE "foto_ktp" ADD CONSTRAINT "foto_ktp_kartu_keluarga_id_fkey" FOREIGN KEY ("kartu_keluarga_id") REFERENCES "kartu_keluarga"("id") ON DELETE CASCADE;
