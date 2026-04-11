-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "rw" (
    "id" UUID NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rt" (
    "id" UUID NOT NULL,
    "rw_id" UUID NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rt_settings" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "reminder_offsets" JSONB NOT NULL DEFAULT '[3,1,0]',
    "bank_name" VARCHAR(100),
    "bank_account_number" VARCHAR(50),
    "bank_account_name" VARCHAR(200),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rt_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "no_ktp" VARCHAR(16),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'tidak_aktif',
    "nama" VARCHAR(200) NOT NULL,
    "rt_id" UUID,
    "rw_id" UUID,
    "rumah_id" UUID,
    "kartu_keluarga_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rumah" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "nomor_rumah" VARCHAR(50) NOT NULL,
    "alamat" TEXT,
    "kontak" VARCHAR(20),
    "tipe_hunian" VARCHAR(20) NOT NULL DEFAULT 'milik',
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rumah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kontrak_rumah" (
    "id" UUID NOT NULL,
    "rumah_id" UUID NOT NULL,
    "nama_penyewa" VARCHAR(200) NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "catatan" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kontrak_rumah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kartu_keluarga" (
    "id" UUID NOT NULL,
    "rumah_id" UUID NOT NULL,
    "no_kk" VARCHAR(16) NOT NULL,
    "nama_kepala_keluarga" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kartu_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_iuran" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "nominal" DECIMAL(15,2) NOT NULL,
    "tipe" VARCHAR(20) NOT NULL,
    "jatuh_tempo" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagihan" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "rumah_id" UUID NOT NULL,
    "iuran_id" UUID NOT NULL,
    "periode" VARCHAR(32) NOT NULL,
    "insidental_batch_id" UUID,
    "nominal" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'belum_bayar',
    "jatuh_tempo" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" UUID NOT NULL,
    "tagihan_id" UUID NOT NULL,
    "rumah_id" UUID NOT NULL,
    "submitted_by" UUID NOT NULL,
    "input_by_pengurus" BOOLEAN NOT NULL DEFAULT false,
    "nominal" DECIMAL(15,2) NOT NULL,
    "metode" VARCHAR(20) NOT NULL,
    "bukti_file" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "verified_by" UUID,
    "catatan" TEXT,
    "reject_reason" TEXT,
    "received_by_name" VARCHAR(200),
    "received_date" DATE,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran_verification_audit" (
    "id" UUID NOT NULL,
    "pembayaran_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(30) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_verification_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "image_file" VARCHAR(500),
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "opsi" JSONB NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "show_result_after_deadline" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_record" (
    "id" UUID NOT NULL,
    "voting_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "opsi_dipilih" VARCHAR(255) NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kas" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "tipe" VARCHAR(20) NOT NULL,
    "deskripsi" VARCHAR(255) NOT NULL,
    "nominal" DECIMAL(15,2) NOT NULL,
    "kategori" VARCHAR(100),
    "recorded_by" UUID,
    "recorded_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pembayaran_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" UUID NOT NULL,
    "rt_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "deskripsi" TEXT,
    "tanggal" DATE NOT NULL,
    "jam" VARCHAR(10),
    "lokasi" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rsvp_kegiatan" (
    "id" UUID NOT NULL,
    "kegiatan_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hadir" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rsvp_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layanan_request" (
    "id" UUID NOT NULL,
    "rumah_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tipe" VARCHAR(30) NOT NULL,
    "keterangan" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'proses',
    "catatan_rt" TEXT,
    "surat_file" VARCHAR(500),
    "handled_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layanan_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "type" VARCHAR(50),
    "link" VARCHAR(500),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(200),
    "metadata" JSONB,
    "ip" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rt_settings_rt_id_key" ON "rt_settings"("rt_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_no_ktp_key" ON "users"("no_ktp");

-- CreateIndex
CREATE INDEX "users_rt_id_idx" ON "users"("rt_id");

-- CreateIndex
CREATE INDEX "users_rumah_id_idx" ON "users"("rumah_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rumah_rt_id_nomor_rumah_key" ON "rumah"("rt_id", "nomor_rumah");

-- CreateIndex
CREATE INDEX "kontrak_rumah_rumah_id_status_idx" ON "kontrak_rumah"("rumah_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_keluarga_no_kk_key" ON "kartu_keluarga"("no_kk");

-- CreateIndex
CREATE INDEX "kartu_keluarga_rumah_id_idx" ON "kartu_keluarga"("rumah_id");

-- CreateIndex
CREATE INDEX "jenis_iuran_rt_id_idx" ON "jenis_iuran"("rt_id");

-- CreateIndex
CREATE INDEX "tagihan_rt_id_periode_idx" ON "tagihan"("rt_id", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "tagihan_rumah_id_iuran_id_periode_key" ON "tagihan"("rumah_id", "iuran_id", "periode");

-- CreateIndex
CREATE INDEX "pembayaran_status_idx" ON "pembayaran"("status");

-- CreateIndex
CREATE INDEX "pembayaran_tagihan_id_idx" ON "pembayaran"("tagihan_id");

-- CreateIndex
CREATE INDEX "pembayaran_verification_audit_pembayaran_id_idx" ON "pembayaran_verification_audit"("pembayaran_id");

-- CreateIndex
CREATE INDEX "announcement_rt_id_idx" ON "announcement"("rt_id");

-- CreateIndex
CREATE INDEX "voting_rt_id_idx" ON "voting"("rt_id");

-- CreateIndex
CREATE UNIQUE INDEX "vote_record_voting_id_user_id_key" ON "vote_record"("voting_id", "user_id");

-- CreateIndex
CREATE INDEX "kas_rt_id_recorded_date_idx" ON "kas"("rt_id", "recorded_date");

-- CreateIndex
CREATE INDEX "kegiatan_rt_id_idx" ON "kegiatan"("rt_id");

-- CreateIndex
CREATE UNIQUE INDEX "rsvp_kegiatan_kegiatan_id_user_id_key" ON "rsvp_kegiatan"("kegiatan_id", "user_id");

-- CreateIndex
CREATE INDEX "layanan_request_rumah_id_idx" ON "layanan_request"("rumah_id");

-- CreateIndex
CREATE INDEX "notification_user_id_read_at_idx" ON "notification"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- AddForeignKey
ALTER TABLE "rt" ADD CONSTRAINT "rt_rw_id_fkey" FOREIGN KEY ("rw_id") REFERENCES "rw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rt_settings" ADD CONSTRAINT "rt_settings_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rw_id_fkey" FOREIGN KEY ("rw_id") REFERENCES "rw"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_kartu_keluarga_id_fkey" FOREIGN KEY ("kartu_keluarga_id") REFERENCES "kartu_keluarga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rumah" ADD CONSTRAINT "rumah_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kontrak_rumah" ADD CONSTRAINT "kontrak_rumah_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kontrak_rumah" ADD CONSTRAINT "kontrak_rumah_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kartu_keluarga" ADD CONSTRAINT "kartu_keluarga_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jenis_iuran" ADD CONSTRAINT "jenis_iuran_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_iuran_id_fkey" FOREIGN KEY ("iuran_id") REFERENCES "jenis_iuran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_tagihan_id_fkey" FOREIGN KEY ("tagihan_id") REFERENCES "tagihan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_verification_audit" ADD CONSTRAINT "pembayaran_verification_audit_pembayaran_id_fkey" FOREIGN KEY ("pembayaran_id") REFERENCES "pembayaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_verification_audit" ADD CONSTRAINT "pembayaran_verification_audit_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting" ADD CONSTRAINT "voting_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting" ADD CONSTRAINT "voting_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_record" ADD CONSTRAINT "vote_record_voting_id_fkey" FOREIGN KEY ("voting_id") REFERENCES "voting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_record" ADD CONSTRAINT "vote_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kas" ADD CONSTRAINT "kas_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kas" ADD CONSTRAINT "kas_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kas" ADD CONSTRAINT "kas_pembayaran_id_fkey" FOREIGN KEY ("pembayaran_id") REFERENCES "pembayaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_rt_id_fkey" FOREIGN KEY ("rt_id") REFERENCES "rt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvp_kegiatan" ADD CONSTRAINT "rsvp_kegiatan_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvp_kegiatan" ADD CONSTRAINT "rsvp_kegiatan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layanan_request" ADD CONSTRAINT "layanan_request_rumah_id_fkey" FOREIGN KEY ("rumah_id") REFERENCES "rumah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layanan_request" ADD CONSTRAINT "layanan_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layanan_request" ADD CONSTRAINT "layanan_request_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial unique: satu kontrak aktif per rumah
CREATE UNIQUE INDEX "kontrak_rumah_one_aktif_per_rumah" ON "kontrak_rumah" ("rumah_id") WHERE "status" = 'aktif';
