-- AlterTable
ALTER TABLE "users" ADD COLUMN "pending_rumah_id" UUID,
ADD COLUMN "pending_nomor_rumah" VARCHAR(20),
ADD COLUMN "pending_tipe_hunian" VARCHAR(20),
ADD COLUMN "pending_kontak" VARCHAR(100),
ADD COLUMN "pending_no_kk" VARCHAR(16),
ADD COLUMN "pending_nama_kk" VARCHAR(200);
